/**
 * Daily line-movement digest over the archive capture-lines.ts writes. For one scoreboard day it
 * reads <archive>/<SPORT>/<day>.jsonl and reports, per game, the opening and closing spread,
 * total and home moneyline, the final score, and any gap in the captures, then lists the biggest
 * spread moves. Read-only over the archive; writes one markdown file and prints it.
 *
 *   <out>/<YYYY-MM-DD>.md        out defaults to <archive>/digests
 *
 * Opening = the game's `open` capture. Closing = its `close` capture with the smallest
 * minutesToStart (two can exist if the job ran more often than its interval). A game with no
 * `close` capture is reported with its last pre-game line and flagged, never shown as a close.
 *
 * Run (from site/):  npm run digest:lines -- --archive <folder> [--date YYYY-MM-DD] [--out <folder>]
 * --date defaults to yesterday (UTC). Exits 1 when the day has no capture file for any sport,
 * because that means the capture did not run, not that nothing happened.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPORTS, type LineRecord } from './capture-lines';

export interface GameDigest {
  sport: string;
  eventId: string;
  game: string; // "Away @ Home"
  open: LineRecord | null;
  close: LineRecord | null;
  lastPre: LineRecord | null; // the latest pre-game capture, whatever its phase
  final: LineRecord | null;
  gaps: string[];
}

/** Groups one sport's day of captures into one digest row per game, in first-seen order. */
export function digestGames(sport: string, records: LineRecord[]): GameDigest[] {
  const byId = new Map<string, LineRecord[]>();
  for (const r of records) byId.set(r.eventId, [...(byId.get(r.eventId) ?? []), r]);
  return [...byId].map(([eventId, rs]) => {
    const pre = rs.filter(r => r.state === 'pre');
    const open = pre.find(r => r.linePhase === 'open') ?? null;
    const closes = pre.filter(r => r.linePhase === 'close');
    const close = closes.length ? closes.reduce((a, b) => (b.minutesToStart < a.minutesToStart ? b : a)) : null;
    const lastPre = pre.length ? pre[pre.length - 1] : null;
    const final = rs.find(r => r.state === 'post') ?? null;
    const gaps: string[] = [];
    if (!pre.length) gaps.push('no pre-game capture');
    else {
      if (!open) gaps.push('no opening capture');
      if (!close) gaps.push('no close capture');
      if (pre.every(r => r.spread === null && r.overUnder === null && r.moneyline.home === null)) gaps.push('no odds posted');
    }
    if (!final) gaps.push('no final yet');
    const g = rs[0];
    return { sport, eventId, game: `${g.awayTeam} @ ${g.homeTeam}`, open, close, lastPre, final, gaps };
  });
}

const num = (n: number | null | undefined, signed = false) =>
  n === null || n === undefined ? '—' : signed && n > 0 ? `+${n}` : String(n);

/** "open → close (move)"; the move only when both ends are numbers. */
function movement(a: number | null | undefined, b: number | null | undefined, signed: boolean): string {
  if ((a ?? null) === null && (b ?? null) === null) return '—';
  const move = a !== null && a !== undefined && b !== null && b !== undefined && a !== b
    ? ` (${b - a > 0 ? '+' : ''}${+(b - a).toFixed(1)})` : '';
  return `${num(a, signed)} → ${num(b, signed)}${move}`;
}

export function spreadMove(g: GameDigest): number | null {
  const a = g.open?.spread, b = g.close?.spread;
  return a === null || a === undefined || b === null || b === undefined ? null : +(b - a).toFixed(1);
}

export function renderDigest(day: string, archive: string, games: GameDigest[]): string {
  const sports = [...new Set(games.map(g => g.sport))];
  const full = games.filter(g => g.open && g.close).length;
  const out: string[] = [`# Line movement: ${day}`, ''];
  if (!games.length) {
    out.push(`The capture files for ${day} hold no games. Off-season sports have none; if that is unexpected, check the capture task.`);
    return out.join('\n') + '\n';
  }
  out.push(
    `${games.length} game${games.length === 1 ? '' : 's'} across ${sports.join(', ')}, from \`${archive}\`. `
    + `Opening and closing line both captured for ${full} of ${games.length}. `
    + 'Spreads are the home side; a game without a close capture shows its last pre-game line, marked *.',
    '',
  );
  const moves = games.map(g => ({ g, m: spreadMove(g) })).filter(x => x.m) as { g: GameDigest; m: number }[];
  if (moves.length) {
    out.push('## Biggest spread moves', '', '| Sport | Game | Open | Close | Move |', '|:--|:--|--:|--:|--:|');
    for (const { g, m } of moves.sort((a, b) => Math.abs(b.m) - Math.abs(a.m)).slice(0, 5)) {
      out.push(`| ${g.sport} | ${g.game} | ${num(g.open!.spread, true)} | ${num(g.close!.spread, true)} | ${m > 0 ? '+' : ''}${m} |`);
    }
    out.push('');
  }
  for (const sport of sports) {
    const rows = games.filter(g => g.sport === sport);
    out.push(`## ${sport} (${rows.length})`, '',
      '| Game | Home spread | Total | Home moneyline | Final | Gaps |', '|:--|:--|:--|:--|:--|:--|');
    for (const g of rows) {
      const end = g.close ?? g.lastPre;
      const star = !g.close && g.lastPre && g.lastPre !== g.open ? '*' : '';
      const cell = (pick: (r: LineRecord) => number | null, signed: boolean) =>
        movement(g.open ? pick(g.open) : null, end && end !== g.open ? pick(end) : null, signed) + star;
      const final = g.final ? `${g.final.awayScore}–${g.final.homeScore}` : '—';
      out.push(`| ${g.game} | ${cell(r => r.spread, true)} | ${cell(r => r.overUnder, false)} | `
        + `${cell(r => r.moneyline.home, true)} | ${final} | ${g.gaps.join(', ') || '—'} |`);
    }
    out.push('');
  }
  return out.join('\n') + '\n';
}

function readDay(file: string): LineRecord[] {
  return readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l) as LineRecord);
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

function main() {
  const archive = arg('archive');
  if (!archive) throw new Error('Missing --archive <folder> (the line capture\'s output folder)');
  if (!existsSync(archive)) throw new Error(`No archive at ${archive}`);
  const day = arg('date') ?? new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('--date must be YYYY-MM-DD');
  const outDir = arg('out') ?? join(archive, 'digests');

  const files = SPORTS.map(s => [s, join(archive, s, `${day}.jsonl`)] as const).filter(([, f]) => existsSync(f));
  if (!files.length) {
    console.error(`LINE_DIGEST_EMPTY: no capture file for ${day} under ${archive}. Is the line capture task running?`);
    process.exit(1);
  }
  const games = files.flatMap(([s, f]) => digestGames(s, readDay(f)));
  const md = renderDigest(day, archive, games);
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, `${day}.md`);
  writeFileSync(file, md, 'utf8');
  console.log(md);
  console.log(`digest -> ${file}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (err) { console.error((err as Error).message); process.exit(1); }
}
