/**
 * Offline check for the line collector (scripts/capture-lines.ts): a recorded
 * ESPN scoreboard shape goes through the real parser, and the records it makes
 * and the file it appends to are asserted. No network. Run: npm run check:lines
 */
import assert from 'node:assert/strict';
import { appendFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseEspnScoreboard } from '../src/server/espn';
import { appendRecords, dayFiles, dayName, readRecords, seenIds, toRecords, type LineRecord } from './capture-lines';
import { digestGames, readDay, renderDigest, spreadMove } from './digest-lines';

const team = (homeAway: string, abbreviation: string, displayName: string, score: string) =>
  ({ homeAway, score, team: { abbreviation, displayName } });
const event = (id: string, date: string, state: string, odds?: object) => ({
  id, date, shortName: 'MIL @ NY', name: 'Milwaukee Bucks at New York Knicks',
  status: { type: { name: 'STATUS_X', state, detail: '' } },
  competitions: [{
    competitors: [team('home', 'NY', 'New York Knicks', '0'), team('away', 'MIL', 'Milwaukee Bucks', '0')],
    odds: odds ? [odds] : undefined,
  }],
});
// Trimmed from a real 2026-11-10 NBA response: ESPN's `close` is the current number until tip-off.
const dk = {
  provider: { name: 'Draft Kings' }, details: 'NY -15.5', overUnder: 222.5, spread: -15.5,
  moneyline: { home: { close: { odds: '-1040' }, open: { odds: '-1260' } }, away: { close: { odds: '+670' } } },
  pointSpread: { home: { close: { line: '-15.5', odds: '-105' } }, away: { close: { line: '+15.5', odds: 'EVEN' } } },
};
const board = parseEspnScoreboard({
  day: { date: '2026-11-10' },
  events: [
    event('1', '2026-11-11T00:30Z', 'pre', dk),
    event('2', '2026-11-10T19:00Z', 'post', { ...dk, spread: 0 }),
    event('3', '2026-11-11T03:00Z', 'pre'),
  ],
}, 'NBA');
assert.equal(board.date, '2026-11-10');
assert.equal(board.games.length, 3);

const dir = mkdtempSync(join(tmpdir(), 'lines-'));
try {
  const file = join(dir, 'NBA', '2026-11-10.jsonl');
  // What a run knows before it captures: every record in the sport's day files.
  const seen = () => seenIds(readRecords(dayFiles(join(dir, 'NBA'))).records);

  // First run, 10:00Z: everything not started is an opener; a started game has no phase.
  const first = toRecords('NBA', board.games, new Date('2026-11-10T10:00Z'), seen(), 3);
  assert.deepEqual(first.map(r => r.linePhase), ['open', null, 'open']);
  const r = first[0];
  assert.equal(r.eventId, '1');
  assert.equal(r.homeTeam, 'New York Knicks');
  assert.equal(r.spread, -15.5);
  assert.deepEqual(r.spreadOdds, { home: -105, away: 100 }); // EVEN reads as +100
  assert.deepEqual(r.moneyline, { home: -1040, away: 670 });
  assert.equal(r.overUnder, 222.5);
  assert.equal(r.provider, 'Draft Kings');
  assert.equal(r.minutesToStart, 870);
  assert.equal(first[1].spread, 0, 'a pick\'em spread is 0, not missing');
  assert.equal(first[2].moneyline.home, null, 'no odds yet stays null, never 0');
  appendRecords(file, first);

  // Second run, 22:00Z: game 1 starts in 2.5h (inside the 3h interval) -> close; game 3 in 5h ->
  // midday; game 2 was already logged as final, so it is not logged again.
  const second = toRecords('NBA', board.games, new Date('2026-11-10T22:00Z'), seen(), 3);
  assert.deepEqual(second.map(r => [r.eventId, r.linePhase]), [['1', 'close'], ['3', 'midday']]);
  appendRecords(file, second);

  // Append-only: both runs are in the file, in order, untouched.
  const lines = readFileSync(file, 'utf8').trimEnd().split('\n').map(l => JSON.parse(l));
  assert.equal(lines.length, 5);
  assert.deepEqual(lines.slice(0, 3), JSON.parse(JSON.stringify(first)));
  assert.deepEqual(lines.slice(3), JSON.parse(JSON.stringify(second)));

  // A day with no games writes nothing (and creates no file).
  appendRecords(join(dir, 'MLB', '2026-11-10.jsonl'), []);
  assert.equal(dayFiles(join(dir, 'MLB')).length, 0);

  // ── The next day's board (audit BUG-32). ESPN files the same games under a new date, so
  // "seen" is keyed by event across day files: game 1 keeps its one opener, the final of
  // game 2 is not logged twice, and only the new game 4 opens. ──
  const next = join(dir, 'NBA', '2026-11-11.jsonl');
  const game4 = { ...board.games[0], id: '4', date: '2026-11-12T00:30Z' };
  const third = toRecords('NBA', [...board.games, game4], new Date('2026-11-11T00:00Z'), seen(), 3);
  assert.deepEqual(third.map(r => [r.eventId, r.linePhase]), [['1', 'close'], ['3', 'close'], ['4', 'open']]);
  appendRecords(next, third);
  const fourth = toRecords('NBA', [{ ...board.games[0], state: 'post' }], new Date('2026-11-11T03:30Z'), seen(), 3);
  assert.deepEqual(fourth.map(r => [r.eventId, r.state, r.linePhase]), [['1', 'post', null]]);
  appendRecords(next, fourth);
  const all = readRecords(dayFiles(join(dir, 'NBA'))).records;
  for (const id of ['1', '3', '4']) {
    assert.equal(all.filter(r => r.eventId === id && r.linePhase === 'open').length, 1, `game ${id} has exactly one opener`);
  }
  assert.equal(all.filter(r => r.eventId === '2' && r.state === 'post').length, 1, 'a final is logged once across day files');
  // The digest follows a day's games into the files around it: day one finds game 1's final in
  // day two's file, and day two finds its opener in day one's.
  const dayOne = digestGames('NBA', readDay(file));
  assert.deepEqual(dayOne.map(g => g.eventId), ['1', '2', '3']);
  assert.deepEqual(dayOne[0].gaps, [], 'opener, close and final found across two files');
  const dayTwo = digestGames('NBA', readDay(next));
  assert.deepEqual(dayTwo.map(g => g.eventId), ['1', '3', '4']);
  assert.ok(dayTwo[0].open && dayTwo[0].final, 'day two reads the opener from day one');

  // ── A game with no usable start time is skipped, never written with a null
  // minutesToStart (audit BUG-24). ──
  const undated = toRecords('NBA', [{ ...board.games[0], id: '5', date: 'not-a-date' }, { ...game4, id: '6' }], new Date('2026-11-11T00:00Z'), new Map(), 3);
  assert.deepEqual(undated.map(r => r.eventId), ['6']);
  assert.ok(undated.every(r => Number.isFinite(r.minutesToStart)));

  // ── A run killed mid-write leaves a cut-off last line (audit BUG-23). It is counted and
  // skipped, and the next append starts on its own line instead of joining the broken one. ──
  const cut = join(dir, 'NHL', '2026-11-10.jsonl');
  appendRecords(cut, first.slice(0, 2));
  appendFileSync(cut, '{"eventId":"9","sp', 'utf8');
  assert.deepEqual(readRecords([cut]), { records: JSON.parse(JSON.stringify(first.slice(0, 2))), skipped: 1 });
  appendRecords(cut, [first[2]]);
  const mended = readRecords([cut]);
  assert.deepEqual([mended.records.map(r => r.eventId), mended.skipped], [['1', '2', '3'], 1]);
  assert.equal(digestGames('NHL', readDay(cut)).length, 3, 'the digest reads past the broken line');

  // ── The day becomes a file name, so only a date gets through (audit BUG-34). ──
  const at = new Date('2026-11-12T01:00Z');
  assert.equal(dayName('2026-11-10', at), '2026-11-10');
  assert.equal(dayName('2026-11-10T08:00Z', at), '2026-11-10');
  for (const bad of ['../../../x', '', undefined, null, 20261110, 'x2026-11-10']) assert.equal(dayName(bad, at), '2026-11-12');
  assert.deepEqual(dayFiles(join(dir, 'NBA')).map(f => f.slice(-16)), ['2026-11-10.jsonl', '2026-11-11.jsonl']);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// ── The daily digest (scripts/digest-lines.ts) over a hand-built day ──
const rec = (eventId: string, phase: LineRecord['linePhase'], state: string, minutesToStart: number,
  spread: number | null, total: number | null = 220, homeMl: number | null = -150, score: [number, number] = [0, 0]): LineRecord => ({
  eventId, sport: 'NBA', eventDate: '2026-11-11T00:30Z', capturedAt: '2026-11-10T10:00Z', state, linePhase: phase,
  minutesToStart, homeTeam: `Home ${eventId}`, awayTeam: `Away ${eventId}`, homeScore: score[0], awayScore: score[1],
  provider: 'Draft Kings', spread, spreadOdds: { home: -110, away: -110 }, overUnder: total, moneyline: { home: homeMl, away: 130 },
});
const day = digestGames('NBA', [
  rec('A', 'open', 'pre', 600, -3.5, 220),
  rec('A', 'close', 'pre', 170, -4.5, 222.5, -190),
  rec('A', 'close', 'pre', 50, -5, 223, -200), // job ran early: the nearer close wins
  rec('A', null, 'post', -200, -5, 223, -200, [110, 101]),
  rec('B', 'open', 'pre', 900, 2, 230, 120),
  rec('B', 'midday', 'pre', 400, 1.5, 229, 110), // no close capture
  rec('C', null, 'post', -100, null, null, null, [90, 95]), // first seen after it started
]);
assert.deepEqual(day.map(g => g.eventId), ['A', 'B', 'C']);
assert.equal(day[0].close?.minutesToStart, 50);
assert.equal(spreadMove(day[0]), -1.5);
assert.deepEqual(day[0].gaps, []);
assert.deepEqual(day[1].gaps, ['no close capture', 'no final yet']);
assert.equal(spreadMove(day[1]), null, 'no close capture is never reported as a move');
assert.deepEqual(day[2].gaps, ['no pre-game capture']);
const md = renderDigest('2026-11-10', '/lines', day);
assert.match(md, /Opening and closing line both captured for 1 of 3/);
assert.match(md, /\| NBA \| Away A @ Home A \| -3\.5 \| -5 \| -1\.5 \|/);
assert.match(md, /\| Away A @ Home A \| -3\.5 → -5 \(-1\.5\) \| 220 → 223 \(\+3\) \| -150 → -200 \(-50\) \| 101–110 \| — \|/);
assert.match(md, /\| Away B @ Home B \| \+2 → \+1\.5 \(-0\.5\)\* \|/, 'the last pre-game line is marked, not called a close');
assert.match(md, /\| Away C @ Home C \| — \| — \| — \| 95–90 \| no pre-game capture \|/);
assert.match(renderDigest('2026-11-10', '/lines', []), /hold no games/);

console.log('check:lines OK: parser fields, linePhase rule, append-only file, one opener across day files, broken lines and undated games skipped, day-file names, daily digest');
