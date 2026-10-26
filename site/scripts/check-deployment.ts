import assert from 'node:assert/strict';
import {
  attemptUnlock, guardAdvisorRequest, issueToken, sessionStatus, SESSION_COOKIE,
} from '../src/server/auth';
import { generateAdvice } from '../src/server/advisor';
import advisorHandler from '../api/strategy-advisor';
import authHandler from '../api/advisor-auth';
import type { ApiRequest, ApiResponse } from '../src/server/httpTypes';

const keys = ['EDGE_SPECTRUM_MODE', 'ADVISOR_PASSCODE', 'ADVISOR_SECRET', 'GEMINI_API_KEY'] as const;
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
  assert.equal(guardAdvisorRequest(undefined, 'Hello').status, 401);
  assert.equal(guardAdvisorRequest(cookie, '').status, 400);
  assert.equal(guardAdvisorRequest(cookie, 'x'.repeat(1001)).status, 400);
  assert.equal(sessionStatus(`${SESSION_COOKIE}=%ZZ`).body.authed, false);

  for (const mode of [undefined, 'demo', 'FULL', 'typo']) {
    if (mode === undefined) delete process.env.EDGE_SPECTRUM_MODE;
    else process.env.EDGE_SPECTRUM_MODE = mode;
    assert.deepEqual(sessionStatus(cookie).body, { mode: 'demo', configured: false, authed: false });
    assert.equal(attemptUnlock('test-only-passcode', 'test-client').status, 403);
    assert.equal(guardAdvisorRequest(cookie, 'Hello').status, 403);
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
  assert.equal(guardAdvisorRequest(cookie, 'Hello').status, 503);
  assert.equal(attemptUnlock('test-only-passcode', 'test-client').status, 503);
  assert.equal(networkCalls, 0);
  console.log('Deployment checks passed: demo rejects live AI and old sessions; full mode preserves authentication; zero network calls.');
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
