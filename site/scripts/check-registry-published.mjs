/**
 * Is the Cronsole catalog the site serves the one in site/public/registry/? Fetches the hosted
 * index.json, compares every template and pack id + sha256 with the committed index, then hashes
 * every served file. A merge that never deployed, or a host serving altered bytes, looks fine
 * from inside the repo; this is the check that can see it. Exits 1 on any difference.
 * It also checks the CORS header the Cronsole gallery needs to read the catalog cross-origin.
 *
 *   node scripts/check-registry-published.mjs [base-url]
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOSTED } from './build-registry.mjs';

const base = (process.argv[2] ?? HOSTED).replace(/\/*$/, '/');
const entries = index => new Map([...index.templates, ...(index.packs ?? [])].map(e => [e.path, e.sha256]));
const local = entries(JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'registry', 'index.json'), 'utf8')));

const res = await fetch(base + 'index.json');
const problems = [];
if (res.headers.get('access-control-allow-origin') !== '*') problems.push('index.json is served without Access-Control-Allow-Origin: *');
let live = new Map();
try { live = entries(await res.json()); } catch { problems.push(`index.json is not JSON (HTTP ${res.status}): not deployed?`); }

for (const p of local.keys()) if (!live.has(p)) problems.push(`missing from the host: ${p}`);
for (const p of live.keys()) if (!local.has(p)) problems.push(`on the host but not in site/public/registry/: ${p}`);
for (const [p, h] of local) if (live.has(p) && live.get(p) !== h) problems.push(`different sha256 in the hosted index: ${p}`);
for (const [p, h] of live) {
  const body = Buffer.from(await (await fetch(base + p)).arrayBuffer());
  if (createHash('sha256').update(body).digest('hex') !== h) problems.push(`served bytes don't match the hosted index: ${p}`);
}

for (const p of problems) console.log(`DRIFT ${p}`);
console.log(`${base}: ${live.size} files checked, ${problems.length} problem(s)`);
process.exit(problems.length ? 1 : 0);
