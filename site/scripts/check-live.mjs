/**
 * Smoke check of the deployed site, for the daily and post-deploy workflow. Nothing inside the
 * repo can see a deploy that failed, a route that stopped answering, or the public demo being
 * switched to full mode (it must never hold AI credentials). Exits 1 on any problem.
 *
 *   node scripts/check-live.mjs [base-url]
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOSTED } from './build-registry.mjs';

const base = (process.argv[2] ?? new URL(HOSTED).origin).replace(/\/+$/, '');
const here = dirname(fileURLToPath(import.meta.url));
const localEdges = JSON.parse(readFileSync(join(here, '..', 'public', 'spectrum', 'edges.json'), 'utf8'));
const count = (data) => (Array.isArray(data) ? data : data.records ?? data.edges ?? []).length;

const problems = [];
const get = (path, init) => fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(20_000), ...init });
async function expect(label, run) {
  try {
    const problem = await run();
    if (problem) problems.push(`${label}: ${problem}`);
  } catch (error) {
    problems.push(`${label}: ${error.message}`);
  }
}
const type = (res) => res.headers.get('content-type') ?? '';

for (const path of ['/', '/spectrum/index.html', '/backtester', '/odds', '/parlay', '/setup']) {
  await expect(path, async () => {
    const res = await get(path);
    return res.status === 200 && type(res).includes('text/html') ? null : `HTTP ${res.status} ${type(res)}`;
  });
}
await expect('/robots.txt', async () => {
  const res = await get('/robots.txt');
  return res.status === 200 && type(res).includes('text/plain') ? null : `HTTP ${res.status} ${type(res)}`;
});
await expect('unknown path', async () => {
  const res = await get('/definitely-not-a-page');
  return res.status === 404 ? null : `HTTP ${res.status}, expected 404`;
});
await expect('demo mode', async () => {
  const body = await (await get('/api/advisor-auth')).json();
  return body.mode === 'demo' ? null : `the public site reports mode "${body.mode}"; it must stay in demo mode`;
});
await expect('dataset', async () => {
  const live = count(await (await get('/spectrum/edges.json')).json());
  const local = count(localEdges);
  return live === local && live > 0 ? null : `${live} records live, ${local} in the repo: not deployed?`;
});
await expect('backtest', async () => {
  const res = await get('/api/backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sport: 'NHL', startYear: 2024, endYear: 2024, betType: 'totals', sideSelection: 'over', unitSize: 100, startingBankroll: 10000 }),
  });
  if (res.status !== 200) return `HTTP ${res.status}`;
  const body = await res.json();
  return body.summary?.totalBets > 0 ? null : 'no bets in the response';
});

for (const p of problems) console.log(`LIVE ${p}`);
console.log(`${base}: ${problems.length} problem(s)`);
process.exit(problems.length ? 1 : 0);
