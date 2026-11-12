/**
 * Forward line capture (roadmap Actions 5.1 + 5.2). Snapshots ESPN's public
 * scoreboard for every sport the hub knows and appends one JSON line per game to
 *
 *   <out>/<SPORT>/<YYYY-MM-DD>.jsonl      (the scoreboard's own day, as ESPN reports it)
 *
 * Append-only: a run never rewrites or reorders a line, so the files are an honest
 * log of what the book showed and when. Public scoreboard data, captured for
 * educational closing-line-value analysis.
 *
 * linePhase, decided at capture time and never revised:
 *   open    the first capture of a not-yet-started game, across the sport's recent day files
 *   close   a later capture of a not-yet-started game within one collection interval
 *           (--interval-hours, default 3) of its start: on that schedule it is the last
 *           look before the game. Two can qualify if the job runs more often than the
 *           interval says; `minutesToStart` is stored so a reader can pick the latest.
 *   midday  any other capture of a not-yet-started game
 *   null    the game has started (`state` in|post): the line is no longer pre-game,
 *           but the score is still worth keeping for grading. A final is logged once.
 *
 * Run (from site/):  npm run capture:lines -- --out <folder> [--interval-hours 3]
 * Exits 1 naming any sport whose fetch failed; a sport with no games is a success. A line that
 * does not parse (a run killed mid-write) and a game with no usable start time are skipped with
 * a warning.
 */
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchEspnScoreboard } from '../src/server/espn';

/** The sports `fetchEspnScoreboard` maps; anything else would silently fetch NFL. */
export const SPORTS = ['NFL', 'NBA', 'MLB', 'NHL'] as const;

export type LinePhase = 'open' | 'midday' | 'close' | null;

export interface LineRecord {
  eventId: string;
  sport: string;
  eventDate: string;
  capturedAt: string;
  state: string;
  linePhase: LinePhase;
  minutesToStart: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  provider: string | null;
  spread: number | null; // home team
  spreadOdds: { home: number | null; away: number | null };
  overUnder: number | null;
  moneyline: { home: number | null; away: number | null };
}

const DAY = /^\d{4}-\d{2}-\d{2}/;
const DAY_FILE = /^\d{4}-\d{2}-\d{2}\.jsonl$/;

/** The day a board is filed under: ESPN's own, or the capture date when that is not a date. */
export function dayName(boardDate: unknown, capturedAt: Date): string {
  // The string becomes a file name, so nothing but a date gets through (no `../`).
  return (typeof boardDate === 'string' && DAY.test(boardDate) ? boardDate : capturedAt.toISOString()).slice(0, 10);
}

/** A sport's day files, oldest first. */
export function dayFiles(dir: string): string[] {
  return existsSync(dir) ? readdirSync(dir).filter(n => DAY_FILE.test(n)).sort().map(n => join(dir, n)) : [];
}

/** Every record that parses, in file order, and how many lines did not. */
export function readRecords(files: string[]): { records: LineRecord[]; skipped: number } {
  const records: LineRecord[] = [];
  let skipped = 0;
  for (const file of files) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const r = JSON.parse(line);
        if (typeof r?.eventId !== 'string') throw new Error('not a line record');
        records.push(r);
      } catch { skipped++; }
    }
  }
  return { records, skipped };
}

// ponytail: a game is "seen" if it is in the sport's last 8 day files. ESPN's NFL board lists a
// whole week under a new date each day; a board that lists games further ahead needs a wider window.
export const RECENT_DAY_FILES = 8;

/** Event id -> the state of its latest record, so a run can tell a first capture from a repeat. */
export function seenIds(records: LineRecord[]): Map<string, string> {
  return new Map(records.map(r => [r.eventId, r.state]));
}

export function toRecords(
  sport: string,
  games: any[],
  capturedAt: Date,
  seen: Map<string, string>,
  intervalHours: number,
): LineRecord[] {
  // A final score never changes, and ESPN keeps an off-season sport's last final on its board for
  // weeks, so a game already logged as final is not logged again.
  const dated = games.filter(g => Number.isFinite(Date.parse(g.date)));
  // Without a start time there is no minutesToStart, and the game could never reach `close`.
  if (dated.length < games.length) console.warn(`${sport}: skipped ${games.length - dated.length} game(s) with no usable start time`);
  return dated.filter(g => !(g.state === 'post' && seen.get(g.id) === 'post')).map(g => {
    const minutesToStart = Math.round((Date.parse(g.date) - capturedAt.getTime()) / 60000);
    const linePhase: LinePhase =
      g.state !== 'pre' ? null
        : !seen.has(g.id) ? 'open'
          : minutesToStart <= intervalHours * 60 ? 'close'
            : 'midday';
    return {
      eventId: g.id,
      sport,
      eventDate: g.date,
      capturedAt: capturedAt.toISOString(),
      state: g.state ?? 'unknown',
      linePhase,
      minutesToStart,
      homeTeam: g.homeTeam.name,
      awayTeam: g.awayTeam.name,
      homeScore: g.homeTeam.score,
      awayScore: g.awayTeam.score,
      provider: g.odds.provider,
      spread: g.odds.spread,
      spreadOdds: g.odds.spreadOdds,
      overUnder: g.odds.overUnder,
      moneyline: g.odds.moneyline,
    };
  });
}

/** Appends to the day file; never truncates. */
export function appendRecords(file: string, records: LineRecord[]): void {
  if (!records.length) return;
  mkdirSync(resolve(file, '..'), { recursive: true });
  // A file cut off mid-line would swallow the first new record into its broken last line.
  const cutOff = existsSync(file) && !/(^|\n)$/.test(readFileSync(file, 'utf8'));
  appendFileSync(file, (cutOff ? '\n' : '') + records.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main() {
  const out = arg('out');
  if (!out) throw new Error('Missing --out <folder>');
  const intervalHours = Number(arg('interval-hours') ?? 3);
  if (!(intervalHours > 0)) throw new Error('--interval-hours must be a positive number');

  const capturedAt = new Date();
  const failed: string[] = [];
  for (const sport of SPORTS) {
    try {
      const board = await fetchEspnScoreboard(sport);
      const dir = join(out, sport);
      const file = join(dir, `${dayName(board.date, capturedAt)}.jsonl`);
      const prior = readRecords(dayFiles(dir).slice(-RECENT_DAY_FILES));
      if (prior.skipped) console.warn(`${sport}: skipped ${prior.skipped} unreadable line(s) under ${dir}`);
      const records = toRecords(sport, board.games, capturedAt, seenIds(prior.records), intervalHours);
      appendRecords(file, records);
      console.log(records.length ? `${sport}: ${records.length} game(s) -> ${file}`
        : board.games.length ? `${sport}: nothing new (${board.games.length} final(s) already logged)`
          : `${sport}: no games on ESPN's board`);
    } catch (err) {
      failed.push(sport);
      console.error(`${sport}: capture failed: ${(err as Error).message}`);
    }
  }
  if (failed.length) {
    console.error(`LINE_CAPTURE_FAILED for ${failed.join(', ')}`);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err.message); process.exit(1); });
}
