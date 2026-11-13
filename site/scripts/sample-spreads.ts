/**
 * One-off sample of prediction-market spreads (audit INT-10). Not a feed: run it by hand when the
 * Prediction Markets rows are re-cited, and quote its output, date and this script in the row.
 *
 *   npm run sample:spreads            markdown table
 *   npm run sample:spreads -- --json  the same numbers as JSON
 *
 * Both APIs are public and need no key. For every open market priced near the middle (mid 20c to
 * 80c, the rows assume 50c), the cost of crossing half the quoted spread is (ask - bid) / 2 / mid,
 * as a share of the stake. The script reports the median per group weighted by each market's
 * last-24-hour volume: idle markets quote 1c / 99c and would swamp a plain median, but nobody trades
 * there. A group with no volume in the window reports none.
 */

const KALSHI = 'https://api.elections.kalshi.com/trade-api/v2/markets';
const GAMMA = 'https://gamma-api.polymarket.com/events';

/** Row in edges.ts → where its markets live. */
const GROUPS: Array<{ row: string; venue: 'kalshi' | 'polymarket'; keys: string[] }> = [
  { row: 'Kalshi Economic', venue: 'kalshi', keys: ['KXCPI', 'KXPAYROLLS', 'KXU3'] },
  { row: 'Kalshi Fed Rate', venue: 'kalshi', keys: ['KXFED', 'KXFEDDECISION'] },
  { row: 'Kalshi GDP', venue: 'kalshi', keys: ['KXGDP'] },
  { row: 'Kalshi Weather', venue: 'kalshi', keys: ['KXHIGHNY', 'KXHIGHCHI', 'KXHIGHMIA', 'KXHIGHLAX', 'KXHIGHAUS', 'KXHIGHDEN', 'KXHIGHPHIL'] },
  { row: 'Polymarket Elections', venue: 'polymarket', keys: ['elections'] },
  { row: 'Polymarket SCOTUS', venue: 'polymarket', keys: ['scotus'] },
  { row: 'Polymarket Oscars', venue: 'polymarket', keys: ['oscars'] },
  { row: 'Polymarket Geopolitics', venue: 'polymarket', keys: ['geopolitics'] },
  { row: 'Polymarket Sports/Entertainment', venue: 'polymarket', keys: ['sports', 'pop-culture'] },
  { row: 'Polymarket Crypto Prices', venue: 'polymarket', keys: ['crypto-prices'] },
];

type Quote = { bid: number; ask: number; volume: number };

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  return res.json();
}

async function kalshiQuotes(series: string): Promise<Quote[]> {
  const out: Quote[] = [];
  let cursor = '';
  for (let page = 0; page < 10; page++) {
    const body = (await getJson(`${KALSHI}?series_ticker=${series}&status=open&limit=200${cursor ? `&cursor=${cursor}` : ''}`)) as { markets?: Record<string, string>[]; cursor?: string };
    for (const m of body.markets ?? []) out.push({ bid: Number(m.yes_bid_dollars), ask: Number(m.yes_ask_dollars), volume: Number(m.volume_24h_fp) || 0 });
    if (!body.cursor) break;
    cursor = body.cursor;
  }
  return out;
}

async function polymarketQuotes(tag: string): Promise<Quote[]> {
  const out: Quote[] = [];
  for (let offset = 0; offset < 1000; offset += 50) {
    const events = (await getJson(`${GAMMA}?closed=false&limit=50&offset=${offset}&tag_slug=${tag}`)) as { markets?: { closed?: boolean; bestBid?: number; bestAsk?: number; volume24hr?: number }[] }[];
    if (!Array.isArray(events) || events.length === 0) break;
    for (const e of events) for (const m of e.markets ?? []) if (!m.closed) out.push({ bid: Number(m.bestBid), ask: Number(m.bestAsk), volume: Number(m.volume24hr) || 0 });
    if (events.length < 50) break;
  }
  return out;
}

/** Half the spread as a share of the mid, with the market's volume, for traded quotes near 50c. */
export function halfSpreads(quotes: Quote[]): { x: number; w: number }[] {
  return quotes
    .filter(({ bid, ask, volume }) => bid > 0 && ask > bid && ask < 1 && volume > 0)
    .map(({ bid, ask, volume }) => ({ mid: (bid + ask) / 2, half: (ask - bid) / 2, volume }))
    .filter(({ mid }) => mid >= 0.2 && mid <= 0.8)
    .map(({ mid, half, volume }) => ({ x: half / mid, w: volume }));
}

/** The value at half the total weight. */
export function weightedMedian(xs: { x: number; w: number }[]): number {
  const s = [...xs].sort((a, b) => a.x - b.x);
  const total = s.reduce((t, { w }) => t + w, 0);
  let run = 0;
  for (const { x, w } of s) if ((run += w) >= total / 2) return x;
  return NaN;
}

async function main() {
  const rows = [];
  for (const g of GROUPS) {
    const quotes = (await Promise.all(g.keys.map((k) => (g.venue === 'kalshi' ? kalshiQuotes(k) : polymarketQuotes(k)).catch(() => [] as Quote[])))).flat();
    const hs = halfSpreads(quotes);
    rows.push({ row: g.row, venue: g.venue, markets: hs.length, medianHalfSpreadPct: hs.length ? Number((100 * weightedMedian(hs)).toFixed(2)) : null });
  }
  const at = new Date().toISOString();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ sampledAt: at, rows }, null, 2));
    return;
  }
  console.log(`Sampled ${at}. Open markets traded in the last 24 hours with a mid between 20c and 80c; half the quoted spread as a share of the mid, median weighted by 24-hour volume.\n`);
  console.log('| Row | Markets | Median half-spread |\n|:---|---:|---:|');
  for (const r of rows) console.log(`| ${r.row} | ${r.markets} | ${r.medianHalfSpreadPct === null ? 'none priced' : `${r.medianHalfSpreadPct}%`} |`);
}

// Self-check the arithmetic before touching the network.
console.assert(weightedMedian([{ x: 1, w: 1 }, { x: 9, w: 1 }, { x: 2, w: 5 }]) === 2, 'weightedMedian');
console.assert(halfSpreads([{ bid: 0.48, ask: 0.52, volume: 3 }, { bid: 0.01, ask: 0.99, volume: 0 }, { bid: 0.01, ask: 0.09, volume: 9 }]).length === 1, 'halfSpreads');
main().catch((e) => { console.error(e); process.exit(1); });
