import assert from 'node:assert/strict';
import {
  ADVISOR_REQUESTS_PER_HOUR, attemptUnlock, clientIp, failureEntries, guardAdvisorRequest, issueToken,
  resetLimiters, sessionStatus, SESSION_COOKIE,
} from '../src/server/auth';
import { AdviceFormatError, generateAdvice, parseAdvice } from '../src/server/advisor';
import { fetchEspnScoreboard } from '../src/server/espn';
import advisorHandler from '../api/strategy-advisor';
import backtestHandler from '../api/backtest';
import espnHandler from '../api/espn-scoreboard';
import authHandler from '../api/advisor-auth';
import type { ApiRequest, ApiResponse } from '../src/server/httpTypes';

const keys = ['EDGE_SPECTRUM_MODE', 'ADVISOR_PASSCODE', 'ADVISOR_SECRET', 'GEMINI_API_KEY', 'ADVISOR_DAILY_LIMIT', 'VERCEL', 'TRUST_PROXY'] as const;
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
const originalFetch = globalThis.fetch;
let networkCalls = 0;
globalThis.fetch = (() => { networkCalls++; throw new Error('Unexpected network call'); }) as typeof fetch;

function responseCapture() {
  const result = { status: 200, body: undefined as any, headers: {} as Record<string, unknown> };
  const response = {
    status(code: number) { result.status = code; return this; },
    json(body: unknown) { result.body = body; return this; },
    send(body: unknown) { result.body = body; return this; },
    setHeader(name: string, value: unknown) { result.headers[name] = value; return this; },
  } as unknown as ApiResponse;
  return { result, response };
}

try {
  process.env.EDGE_SPECTRUM_MODE = 'full';
  process.env.ADVISOR_PASSCODE = 'test-only-passcode';
  process.env.ADVISOR_SECRET = 'test-only-signing-secret';
  process.env.GEMINI_API_KEY = 'test-only-not-a-real-key';
  const { token } = issueToken();
  const cookie = `${SESSION_COOKIE}=${token}`;
  assert.equal(guardAdvisorRequest(cookie, 'Explain this simulation.'), null);
  assert.equal(attemptUnlock('wrong', 'test-client').status, 401);
  assert.equal(attemptUnlock('test-only-passcode', 'test-client').status, 200);
  assert.equal(guardAdvisorRequest(undefined, 'Hello')?.status, 401);
  assert.equal(guardAdvisorRequest(cookie, '')?.status, 400);
  assert.equal(guardAdvisorRequest(cookie, 'x'.repeat(1001))?.status, 400);
  assert.equal(sessionStatus(`${SESSION_COOKIE}=%ZZ`).body.authed, false);
  assert.equal(attemptUnlock('test-only-passcode ', 'len-client').status, 401, 'a passcode with a trailing space');
  assert.equal(attemptUnlock('x'.repeat(5000), 'len-client').status, 401, 'an oversized passcode');
  // A date that isn't YYYYMMDD[-YYYYMMDD] is refused before any fetch.
  await assert.rejects(fetchEspnScoreboard('NFL', '20240101&limit=1'), /Invalid date/);

  for (const mode of [undefined, 'demo', 'FULL', 'typo']) {
    if (mode === undefined) delete process.env.EDGE_SPECTRUM_MODE;
    else process.env.EDGE_SPECTRUM_MODE = mode;
    assert.deepEqual(sessionStatus(cookie).body, { mode: 'demo', configured: false, authed: false });
    assert.equal(attemptUnlock('test-only-passcode', 'test-client').status, 403);
    assert.equal(guardAdvisorRequest(cookie, 'Hello')?.status, 403);
    await assert.rejects(generateAdvice('Hello', {}), /disabled in demo mode/);

    const advisor = responseCapture();
    await advisorHandler({ method: 'POST', headers: { cookie }, body: { prompt: 'Hello' } } as ApiRequest, advisor.response);
    assert.equal(advisor.result.status, 403);
    const auth = responseCapture();
    authHandler({ method: 'POST', headers: {}, body: { passcode: 'test-only-passcode' } } as ApiRequest, auth.response);
    assert.equal(auth.result.status, 403);
    assert.equal(auth.result.headers['Set-Cookie'], undefined);
  }

  process.env.EDGE_SPECTRUM_MODE = 'full';
  delete process.env.ADVISOR_PASSCODE;
  assert.equal(guardAdvisorRequest(cookie, 'Hello')?.status, 503);
  assert.equal(attemptUnlock('test-only-passcode', 'test-client').status, 503);
  // A passcode with no signing secret is not a configured gate either.
  process.env.ADVISOR_PASSCODE = 'test-only-passcode';
  delete process.env.ADVISOR_SECRET;
  assert.equal(sessionStatus(cookie).body.configured, false);
  assert.equal(guardAdvisorRequest(cookie, 'Hello')?.status, 503);
  assert.equal(attemptUnlock('test-only-passcode', 'test-client').status, 503);
  process.env.ADVISOR_SECRET = 'test-only-signing-secret';

  // Forwarding headers are believed only behind a proxy that sets them, so a
  // new X-Forwarded-For per guess does not dodge the lockout.
  delete process.env.VERCEL;
  delete process.env.TRUST_PROXY;
  const from = (forwarded: string) => clientIp({ headers: { 'x-forwarded-for': forwarded }, socket: { remoteAddress: '203.0.113.9' } } as any);
  assert.equal(from('198.51.100.1'), '203.0.113.9');
  process.env.TRUST_PROXY = '1';
  assert.equal(from('198.51.100.1, 10.0.0.1'), '198.51.100.1');
  delete process.env.TRUST_PROXY;
  resetLimiters();
  for (let i = 0; i < 8; i++) assert.equal(attemptUnlock('wrong', from(`198.51.100.${i}`)).status, 401);
  assert.equal(attemptUnlock('test-only-passcode', from('198.51.100.99')).status, 429);
  // Guesses spread across real addresses hit the all-clients ceiling, which also bounds the map.
  resetLimiters();
  const spread = Array.from({ length: 60 }, (_, i) => attemptUnlock('wrong', `client-${i}`).status);
  assert.equal(spread.filter((s) => s === 401).length, 40);
  assert.equal(spread.at(-1), 429);
  assert.equal(failureEntries(), 40);

  // Advisor spend controls: an hourly allowance per session and address, a daily ceiling for everyone.
  resetLimiters();
  for (let i = 0; i < ADVISOR_REQUESTS_PER_HOUR; i++) assert.equal(guardAdvisorRequest(cookie, 'Hello', 'a'), null);
  assert.equal(guardAdvisorRequest(cookie, 'Hello', 'a')?.status, 429);
  assert.equal(guardAdvisorRequest(`${SESSION_COOKIE}=${issueToken().token}`, 'Hello', 'a')?.status, 429, 'a fresh session from the same address');
  assert.equal(guardAdvisorRequest(cookie, '', 'a')?.status, 400, 'a rejected request is not counted');
  resetLimiters();
  process.env.ADVISOR_DAILY_LIMIT = '3';
  for (let i = 0; i < 3; i++) assert.equal(guardAdvisorRequest(`${SESSION_COOKIE}=${issueToken().token}`, 'Hello', `b${i}`), null);
  assert.equal(guardAdvisorRequest(`${SESSION_COOKIE}=${issueToken().token}`, 'Hello', 'b9')?.status, 503);
  delete process.env.ADVISOR_DAILY_LIMIT;
  resetLimiters();

  // The model's reply is checked before it leaves the server.
  for (const bad of ['', 'not json', '{}', '{"analysis":{}}', '{"analysis":"  "}', 'null']) {
    assert.throws(() => parseAdvice(bad), AdviceFormatError, `parseAdvice(${JSON.stringify(bad)})`);
  }
  const template = { name: 'T', description: 'd', sport: 'NFL', betType: 'spread', sideSelection: 'favorites', streakFilter: 'any' };
  const advice = parseAdvice(JSON.stringify({ analysis: 'ok', extra: 1, suggestedTemplates: [
    template,
    { ...template, sideSelection: 'over' }, // a team bet on a totals side
    { ...template, sport: 'XFL' },
    { ...template, oddsMin: 200, oddsMax: 100 },
    { ...template, name: 'Totals', betType: 'totals', sideSelection: 'under', spreadMin: 'x' },
  ] }));
  assert.deepEqual(Object.keys(advice), ['analysis', 'suggestedTemplates']);
  assert.deepEqual(advice.suggestedTemplates!.map((t) => t.name), ['T', 'Totals']);
  assert.equal(advice.suggestedTemplates![1].spreadMin, undefined);
  assert.deepEqual(parseAdvice('{"analysis":"ok"}').suggestedTemplates, []);

  // Bad input to the two open endpoints is the caller's error (400), never a
  // 500, and none of it reaches the network.
  const call = async (handler: (req: ApiRequest, res: ApiResponse) => unknown, req: object) => {
    const { result, response } = responseCapture();
    await handler(req as ApiRequest, response);
    return result;
  };
  await assert.rejects(fetchEspnScoreboard('XYZ'), /Unknown sport/);
  for (const query of [{ sport: 'NFL', date: 'abc' }, { sport: ['NFL', 'NBA'] }, { date: ['20240101', '20240102'] }, { sport: 'zzz' }]) {
    const res = await call(espnHandler, { method: 'GET', query });
    assert.equal(res.status, 400, `espn ${JSON.stringify(query)}`);
    assert.equal(res.headers['Cache-Control'], undefined);
  }
  const malformed = { method: 'POST', get body(): unknown { throw new SyntaxError('Unexpected end of JSON input'); } };
  assert.equal((await call(backtestHandler, malformed)).status, 400);
  assert.equal((await call(backtestHandler, { method: 'POST', body: { sport: 'NFL' } })).status, 400);
  assert.equal((await call(backtestHandler, { method: 'GET' })).status, 405);
  const ran = await call(backtestHandler, { method: 'POST', body: {
    sport: 'NHL', startYear: 2020, endYear: 2020, betType: 'totals', sideSelection: 'over', unitSize: 100, startingBankroll: 10000,
  } });
  assert.equal(ran.status, 200);
  assert.ok(ran.body.summary.totalBets > 0);
  assert.equal(networkCalls, 0);

  // A stalled ESPN is cut off and reported as a gateway timeout.
  const { espnScoreboardRoute } = await import('../src/server/espn');
  globalThis.fetch = ((_url: unknown, init?: RequestInit) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
  })) as typeof fetch;
  // AbortSignal.timeout's timer is unref'd; with no socket open, hold the process for it.
  const keepAlive = setTimeout(() => {}, 5000);
  assert.equal((await espnScoreboardRoute({ sport: 'NFL' }, 50)).status, 504);
  clearTimeout(keepAlive);

  // Through the handler with a stubbed Gemini: an empty reply is a 502, a good one a 200.
  const gemini = (text: string) => (async () => new Response(
    JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP' }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )) as typeof fetch;
  const ask = () => call(advisorHandler, { method: 'POST', headers: { cookie }, socket: {}, body: { prompt: 'Hello' } });
  globalThis.fetch = gemini('');
  const empty = await ask();
  assert.equal(empty.status, 502);
  assert.equal(typeof empty.body.error, 'string');
  globalThis.fetch = gemini('{"analysis":"Fine.","suggestedTemplates":[]}');
  const good = await ask();
  assert.equal(good.status, 200);
  assert.deepEqual(good.body, { analysis: 'Fine.', suggestedTemplates: [] });
  // A dataset question carries the matching rows and their sources to the model (audit PROD-15).
  let sent = '';
  globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
    sent = String(init?.body ?? '');
    return gemini('{"analysis":"Double-zero roulette loses 5.26%."}')('');
  }) as typeof fetch;
  const roulette = await call(advisorHandler, { method: 'POST', headers: { cookie }, socket: {}, body: { prompt: 'How bad is roulette compared with keno?' } });
  assert.equal(roulette.status, 200);
  assert.ok(sent.includes('Roulette Double Zero') && sent.includes('Wizard of Odds') && sent.includes('Keno'), 'dataset rows and sources reach the model');
  const { relevantEdges } = await import('../src/server/edgeContext');
  assert.deepEqual(relevantEdges('How should I size my NFL underdog bets?'), [], 'a strategy question carries no dataset rows');
  console.log('Deployment checks passed: demo rejects live AI and old sessions; full mode preserves authentication; zero network calls; bad input is a 400 and a stalled ESPN a 504; advisor limits, lockout and reply validation hold; dataset questions carry their rows.');
} finally {
  for (const key of keys) {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  }
  globalThis.fetch = originalFetch;
}

// Vercel runs api/*.ts as unbundled Node ESM, where a relative import with no
// extension fails at load (FUNCTION_INVOCATION_FAILED on every call). tsx and
// Vite resolve it fine, so only a scan of the api/ import graph catches it.
// Found 2026-10-26: src/dataGenerator.ts imported './stats', and /api/backtest 500ed.
{
  const { readFileSync, readdirSync, existsSync } = await import('node:fs');
  const { dirname, join, normalize } = await import('node:path');
  const root = join(import.meta.dirname, '..');
  const queue = readdirSync(join(root, 'api')).filter(f => f.endsWith('.ts')).map(f => join(root, 'api', f));
  const seen = new Set<string>();
  const bad: string[] = [];
  for (const file of queue) {
    if (seen.has(file)) continue;
    seen.add(file);
    for (const [, spec] of readFileSync(file, 'utf8').matchAll(/^import (?!type )[^;]*?from '(\.{1,2}\/[^']+)'/gm)) {
      if (!spec.endsWith('.js')) { bad.push(`${file.slice(root.length + 1)} -> '${spec}'`); continue; }
      const ts = normalize(join(dirname(file), spec.replace(/\.js$/, '.ts')));
      if (existsSync(ts)) queue.push(ts);
    }
  }
  assert.deepEqual(bad, [], 'relative imports reachable from api/ must end in .js');
  console.log(`API import graph: ${seen.size} files, every relative import ends in .js.`);
}

// Framing (audit INT-01): only the Spectrum page asked for with ?embed may be framed by another
// site; every other route keeps X-Frame-Options and frame-ancestors. Vercel's header sources here
// are plain regex groups, so anchoring each one is enough to replay the matching.
{
  type Rule = { source: string; missing?: { type: string; key: string }[]; headers: { key: string; value: string }[] };
  const { readFileSync } = await import('node:fs');
  const rules: Rule[] = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).headers;
  const headersFor = (url: string) => {
    const { pathname, searchParams } = new URL(url, 'https://x.test');
    const out: Record<string, string> = {};
    for (const r of rules) {
      if (!new RegExp(`^${r.source}$`).test(pathname)) continue;
      if (r.missing?.some((m) => m.type === 'query' && searchParams.has(m.key))) continue;
      for (const h of r.headers) out[h.key] = h.value;
    }
    return out;
  };
  for (const url of ['/', '/backtester', '/backtester?embed=1', '/?embed=1', '/spectrum/index.html', '/diagram/hub-data-flow.html?embed=1']) {
    const h = headersFor(url);
    assert.equal(h['X-Frame-Options'], 'SAMEORIGIN', `${url} can be framed`);
    assert.equal(h['Content-Security-Policy'], "frame-ancestors 'self'", `${url} lost frame-ancestors`);
  }
  const embed = headersFor('/spectrum/index.html?embed=1');
  assert.equal(embed['X-Frame-Options'], undefined, 'the Spectrum embed still sends X-Frame-Options');
  assert.equal(embed['Content-Security-Policy'], undefined, 'the Spectrum embed still sends frame-ancestors');
  assert.equal(embed['X-Content-Type-Options'], 'nosniff', 'the Spectrum embed lost nosniff');
  console.log('Framing: only /spectrum/?embed can be framed elsewhere; every other route sends SAMEORIGIN.');
}
