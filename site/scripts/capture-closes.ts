/**
 * Market-close capture (roadmap Action 5.3, audit INT-08). Fetches the last few trading days of
 * end-of-day prices for named tickers from Tiingo and appends each day not yet recorded to
 *
 *   <out>/<TICKER>.jsonl      one line per trading day: date, close, adjClose, divCash, splitFactor, capturedAt
 *
 * Append-only, like the line archive: a day is written once and never revised, so `adjClose` is the
 * adjusted close as of `capturedAt`. A later dividend or split moves Tiingo's adjusted history; a
 * total return over the archive is the closes plus `divCash`, with `splitFactor` applied.
 *
 * Needs the self-hoster's own Tiingo key, TIINGO_API_KEY in site/.env (free plan: 50 requests an hour,
 * 1,000 a day; one request per ticker per run). Tiingo's free plan is licensed for internal, personal
 * use only (tiingo.com/about/pricing, read 2026-11-13): the archive stays local and is not republished.
 *
 * Run (from site/):  npm run capture:closes -- --out <folder> [--tickers SPY,QQQ,GLD,HYG] [--days 10]
 * Exits 1 naming any ticker whose fetch failed. The key goes in a header and never into a message.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_TICKERS = ['SPY', 'QQQ', 'GLD', 'HYG'];
const TICKER = /^[A-Z][A-Z0-9.-]{0,9}$/;

export interface CloseRecord {
  ticker: string;
  date: string; // YYYY-MM-DD, the trading day
  close: number;
  adjClose: number;
  divCash: number;
  splitFactor: number;
  source: 'tiingo';
  capturedAt: string;
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Tiingo's daily price rows -> records, oldest first. A row without a date or a close is dropped. */
export function parseTiingo(ticker: string, rows: unknown, capturedAt: Date): CloseRecord[] {
  return (Array.isArray(rows) ? rows : [])
    .map((r: any) => ({ date: typeof r?.date === 'string' ? r.date.slice(0, 10) : '', close: num(r?.close), adjClose: num(r?.adjClose), divCash: num(r?.divCash) ?? 0, splitFactor: num(r?.splitFactor) ?? 1 }))
    .filter((r): r is Omit<CloseRecord, 'ticker' | 'source' | 'capturedAt'> & { close: number; adjClose: number } =>
      /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.close !== null && r.adjClose !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ ticker, ...r, source: 'tiingo' as const, capturedAt: capturedAt.toISOString() }));
}

/** Trading days already in the ticker's file. A line that does not parse is skipped. */
export function recordedDays(file: string): Set<string> {
  if (!existsSync(file)) return new Set();
  const days = new Set<string>();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    try { const d = JSON.parse(line)?.date; if (typeof d === 'string') days.add(d); } catch { /* blank or cut-off line */ }
  }
  return days;
}

/** Appends the days the file does not have yet; returns what was written. Never truncates. */
export function appendNewDays(file: string, records: CloseRecord[]): CloseRecord[] {
  const have = recordedDays(file);
  const fresh = records.filter((r) => !have.has(r.date));
  if (!fresh.length) return [];
  mkdirSync(resolve(file, '..'), { recursive: true });
  const cutOff = existsSync(file) && !/(^|\n)$/.test(readFileSync(file, 'utf8'));
  appendFileSync(file, (cutOff ? '\n' : '') + fresh.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  return fresh;
}

/** One request per ticker, for the last `days` calendar days. The key travels in a header only. */
export async function fetchTiingo(ticker: string, key: string, days: number, now = new Date(), timeoutMs = 15000): Promise<CloseRecord[]> {
  if (!TICKER.test(ticker)) throw new Error(`not a ticker: ${ticker}`);
  const start = new Date(now.getTime() - days * 86_400_000).toISOString().slice(0, 10);
  const res = await fetch(`https://api.tiingo.com/tiingo/daily/${encodeURIComponent(ticker.toLowerCase())}/prices?startDate=${start}`, {
    headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Tiingo answered ${res.status} for ${ticker}`);
  return parseTiingo(ticker, await res.json(), now);
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main() {
  const out = arg('out');
  if (!out) throw new Error('Missing --out <folder>');
  const tickers = (arg('tickers') ?? DEFAULT_TICKERS.join(',')).split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
  const bad = tickers.filter((t) => !TICKER.test(t));
  if (!tickers.length || bad.length) throw new Error(`--tickers must be comma-separated symbols${bad.length ? `; not a ticker: ${bad.join(', ')}` : ''}`);
  const days = Number(arg('days') ?? 10);
  if (!(Number.isInteger(days) && days > 0 && days <= 365)) throw new Error('--days must be a whole number from 1 to 365');

  const { config } = await import('dotenv');
  config({ path: resolve(fileURLToPath(import.meta.url), '../../.env'), quiet: true });
  const key = process.env.TIINGO_API_KEY ?? '';
  if (!key) throw new Error('capture:closes needs TIINGO_API_KEY in site/.env (see site/.env.example)');

  const now = new Date();
  const failed: string[] = [];
  for (const ticker of tickers) {
    try {
      const file = join(out, `${ticker}.jsonl`);
      const written = appendNewDays(file, await fetchTiingo(ticker, key, days, now));
      console.log(written.length ? `${ticker}: ${written.length} day(s) -> ${file} (latest ${written.at(-1)!.date} close ${written.at(-1)!.close})` : `${ticker}: nothing new`);
    } catch (err) {
      failed.push(ticker);
      console.error(`${ticker}: capture failed: ${(err as Error).message}`);
    }
  }
  if (failed.length) {
    console.error(`MARKET_CLOSE_FAILED for ${failed.join(', ')}`);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err.message); process.exit(1); });
}
