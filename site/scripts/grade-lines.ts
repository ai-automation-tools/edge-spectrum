/**
 * Closing-line value for your own bets, graded against your own line archive (audit PROD-10,
 * roadmap Action 5.4 as a local script first). Reads a CSV of bets and the archive
 * capture-lines.ts writes, finds each game's closing capture the way digest-lines.ts does, and
 * writes a markdown report. Read-only over the archive; nothing is published.
 *
 *   npm run grade:lines -- --archive <folder> --bets <bets.csv> [--out <report.md>]
 *
 * bets.csv, one bet per row, header required:
 *   date,sport,team,market,pick,line,price,stake
 *   2026-11-10,NBA,Knicks,spread,Knicks,-14.5,-110,100
 *   2026-11-10,NBA,Knicks,moneyline,Bucks,,+700,20
 *   2026-11-10,NBA,Knicks,total,over,221.5,-110,50
 * `date` is the scoreboard day (the archive's file name). `team` finds the game: either side, full
 * name or its last word(s). `pick` is the team bet on, or over/under for a total. `line` is the
 * spread or total taken (blank for a moneyline), `price` the American odds taken, `stake` optional.
 *
 * Measures, against the game's `close` capture (never a later or earlier one):
 *   - moneyline: EV at close = fair closing probability of the pick (both sides de-vigged,
 *     multiplicative) x the decimal price taken - 1. Positive means you beat the close.
 *   - spread / total: points gained on the closing line, from your side. EV at close only when
 *     the line taken equals the closing line, from the de-vigged closing prices.
 * Games with no close capture are listed and not graded.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { americanToDecimal, devig } from '../src/odds';
import { type LineRecord } from './capture-lines';
import { digestGames, readDay, type GameDigest } from './digest-lines';

export type Market = 'moneyline' | 'spread' | 'total';
export interface Bet { date: string; sport: string; team: string; market: Market; pick: string; line: number | null; price: number; stake: number | null }
export interface Graded {
  bet: Bet;
  game: string | null;
  problem: string | null; // why it could not be graded
  closeLine: number | null; // the closing spread (for the pick) or total
  closePrice: number | null; // the closing American price on the pick
  pointsClv: number | null; // spread/total: points better than the close
  evAtClose: number | null; // fraction of stake
  result: 'win' | 'loss' | 'push' | null;
  profit: number | null;
}

const MARKETS = ['moneyline', 'spread', 'total'] as const;

/** Parse the bets CSV. Throws naming the line on anything it cannot read. */
export function parseBets(csv: string): Bet[] {
  const lines = csv.replace(/\r\n/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
  const head = lines.shift()?.toLowerCase().split(',').map((h) => h.trim()) ?? [];
  const col = (name: string) => {
    const i = head.indexOf(name);
    if (i < 0) throw new Error(`bets CSV has no "${name}" column`);
    return i;
  };
  const at = { date: col('date'), sport: col('sport'), team: col('team'), market: col('market'), pick: col('pick'), line: col('line'), price: col('price'), stake: head.indexOf('stake') };
  return lines.map((l, n) => {
    const c = l.split(',').map((s) => s.trim());
    const where = `bets CSV line ${n + 2}`;
    const market = c[at.market]?.toLowerCase() as Market;
    if (!MARKETS.includes(market)) throw new Error(`${where}: market must be moneyline, spread or total`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c[at.date] ?? '')) throw new Error(`${where}: date must be YYYY-MM-DD`);
    const price = Number(c[at.price]);
    if (!Number.isFinite(price) || Math.abs(price) < 100) throw new Error(`${where}: price must be American odds, e.g. -110 or +150`);
    const line = c[at.line] ? Number(c[at.line]) : null;
    if (market !== 'moneyline' && (line === null || !Number.isFinite(line))) throw new Error(`${where}: a ${market} needs the line taken`);
    const pick = c[at.pick] ?? '';
    if (market === 'total' && !/^(over|under)$/i.test(pick)) throw new Error(`${where}: a total's pick is over or under`);
    const stake = at.stake >= 0 && c[at.stake] ? Number(c[at.stake]) : null;
    return { date: c[at.date], sport: (c[at.sport] ?? '').toUpperCase(), team: c[at.team] ?? '', market, pick, line, price, stake: stake !== null && Number.isFinite(stake) ? stake : null };
  });
}

/** "Knicks" matches "New York Knicks"; a full name matches itself. */
const names = (full: string, short: string) => {
  const a = full.toLowerCase(), b = short.toLowerCase().trim();
  return b.length > 0 && (a === b || a.endsWith(` ${b}`));
};

/** Fair probabilities of [home, away] (or [over, under]) from two American prices; null if either is missing. */
function fair(a: number | null, b: number | null): [number, number] | null {
  if (a === null || b === null) return null;
  const r = devig([americanToDecimal(a), americanToDecimal(b)], 'multiplicative');
  return [r.fair[0], r.fair[1]];
}

/** Grades one bet against the games found for its day. Pure: the archive read happens in main(). */
export function gradeBet(bet: Bet, games: GameDigest[]): Graded {
  const base: Graded = { bet, game: null, problem: null, closeLine: null, closePrice: null, pointsClv: null, evAtClose: null, result: null, profit: null };
  const ref = (g: GameDigest) => g.close ?? g.lastPre ?? g.final;
  const found = games.filter((g) => {
    const r = ref(g);
    return g.sport === bet.sport && r !== null && (names(r.homeTeam, bet.team) || names(r.awayTeam, bet.team));
  });
  if (found.length !== 1) return { ...base, problem: found.length ? `"${bet.team}" matches ${found.length} games` : 'game not in the archive' };
  const g = found[0];
  const close = g.close;
  const any = ref(g)!;
  let side: 'home' | 'away' | 'over' | 'under';
  if (bet.market === 'total') side = bet.pick.toLowerCase() as 'over' | 'under';
  else if (names(any.homeTeam, bet.pick)) side = 'home';
  else if (names(any.awayTeam, bet.pick)) side = 'away';
  else return { ...base, game: g.game, problem: `pick "${bet.pick}" is neither team` };

  const out: Graded = { ...base, game: g.game };
  if (g.final) Object.assign(out, settle(bet, side, g.final));
  if (!close) return { ...out, problem: 'no close capture' };

  if (bet.market === 'moneyline') {
    const p = fair(close.moneyline.home, close.moneyline.away);
    out.closePrice = side === 'home' ? close.moneyline.home : close.moneyline.away;
    if (p) out.evAtClose = (side === 'home' ? p[0] : p[1]) * americanToDecimal(bet.price) - 1;
  } else if (bet.market === 'spread') {
    if (close.spread === null) return { ...out, problem: 'no closing spread' };
    out.closeLine = side === 'home' ? close.spread : -close.spread;
    out.closePrice = side === 'home' ? close.spreadOdds.home : close.spreadOdds.away;
    out.pointsClv = +(bet.line! - out.closeLine).toFixed(1); // more points (or fewer to lay) is better
    const p = fair(close.spreadOdds.home, close.spreadOdds.away);
    if (p && out.pointsClv === 0) out.evAtClose = (side === 'home' ? p[0] : p[1]) * americanToDecimal(bet.price) - 1;
  } else {
    if (close.overUnder === null) return { ...out, problem: 'no closing total' };
    out.closeLine = close.overUnder;
    out.pointsClv = +((side === 'over' ? close.overUnder - bet.line! : bet.line! - close.overUnder)).toFixed(1);
  }
  return out;
}

/** Win, loss or push from the final score, and the profit when a stake is given. */
function settle(bet: Bet, side: string, final: LineRecord): Pick<Graded, 'result' | 'profit'> {
  const { homeScore: h, awayScore: a } = final;
  let margin: number;
  if (bet.market === 'total') margin = side === 'over' ? h + a - bet.line! : bet.line! - (h + a);
  else {
    const mine = side === 'home' ? h - a : a - h;
    margin = bet.market === 'spread' ? mine + bet.line! : mine;
  }
  const result = margin > 0 ? 'win' : margin < 0 ? 'loss' : 'push';
  const profit = bet.stake === null ? null : result === 'win' ? +(bet.stake * (americanToDecimal(bet.price) - 1)).toFixed(2) : result === 'loss' ? -bet.stake : 0;
  return { result, profit };
}

const pct = (x: number | null) => (x === null ? '—' : `${x > 0 ? '+' : ''}${(100 * x).toFixed(1)}%`);
const signed = (x: number | null) => (x === null ? '—' : x > 0 ? `+${x}` : String(x));

export function renderGrades(rows: Graded[], archive: string): string {
  const graded = rows.filter((r) => !r.problem || r.problem === 'no close capture');
  const withClv = rows.filter((r) => r.evAtClose !== null || r.pointsClv !== null);
  const beat = withClv.filter((r) => (r.evAtClose ?? 0) > 0 || (r.pointsClv ?? 0) > 0).length;
  const evs = rows.map((r) => r.evAtClose).filter((x): x is number => x !== null);
  const profits = rows.map((r) => r.profit).filter((x): x is number => x !== null);
  const out = [
    `# Closing-line grade`,
    '',
    `Archive: \`${archive}\`. ${rows.length} bet(s); ${graded.length} found; ${withClv.length} measured against a close.`,
    '',
    `- **Beat the close:** ${withClv.length ? `${beat} of ${withClv.length} (${Math.round((100 * beat) / withClv.length)}%)` : '—'}`,
    `- **Average EV at close:** ${evs.length ? pct(evs.reduce((s, x) => s + x, 0) / evs.length) : '—'} over ${evs.length} bet(s) priced against the de-vigged close`,
    `- **Net result:** ${profits.length ? `${profits.reduce((s, x) => s + x, 0).toFixed(2)} on ${profits.length} settled bet(s) with a stake` : '—'}`,
    '',
    'A positive EV at close over many bets is the sign of an edge; the result of a few bets is mostly luck.',
    '',
    '| Date | Game | Bet | Close | Points vs close | EV at close | Result | P/L | Note |',
    '|:---|:---|:---|:---|---:|---:|:---|---:|:---|',
    ...rows.map(({ bet: b, ...r }) => `| ${b.date} | ${r.game ?? `${b.sport} ${b.team}`} | ${b.market} ${b.pick}${b.line !== null ? ` ${signed(b.line)}` : ''} ${signed(b.price)} | ${r.closeLine !== null ? `${signed(r.closeLine)} ` : ''}${r.closePrice !== null ? signed(r.closePrice) : '—'} | ${signed(r.pointsClv)} | ${pct(r.evAtClose)} | ${r.result ?? '—'} | ${r.profit ?? '—'} | ${r.problem ?? ''} |`),
    '',
  ];
  return out.join('\n');
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

function main() {
  const archive = arg('archive'), betsFile = arg('bets');
  if (!archive || !betsFile) throw new Error('Usage: npm run grade:lines -- --archive <folder> --bets <bets.csv> [--out <report.md>]');
  const bets = parseBets(readFileSync(betsFile, 'utf8'));
  const cache = new Map<string, GameDigest[]>();
  const rows = bets.map((b) => {
    const key = `${b.sport}/${b.date}`;
    if (!cache.has(key)) {
      let games: GameDigest[] = [];
      try { games = digestGames(b.sport, readDay(join(archive, b.sport, `${b.date}.jsonl`))); } catch { /* no file: not in the archive */ }
      cache.set(key, games);
    }
    return gradeBet(b, cache.get(key)!);
  });
  const md = renderGrades(rows, archive);
  const out = arg('out') ?? betsFile.replace(/\.csv$/i, '') + '.grades.md';
  writeFileSync(out, md, 'utf8');
  console.log(md);
  console.log(`grades -> ${out}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (err) { console.error((err as Error).message); process.exit(1); }
}
