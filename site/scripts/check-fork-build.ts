/**
 * A fork's build must not point at the original site (audit PROD-04).
 *
 * Checks the original's build in dist/ (run `npm run build` first) still carries its canonical URL,
 * sitemap and consent script, then builds the client twice as a fork, which Vercel's build env
 * names: once with no address of its own, where nothing in the output may name the org domain, and
 * once with EDGE_SPECTRUM_SITE_URL set, where the canonical URL must be the fork's.
 * Run: npm run check:fork
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ORIGINAL_ORG_URL, ORIGINAL_SITE_URL } from '../src/projectLinks';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORG_DOMAIN = new URL(ORIGINAL_ORG_URL).host;
const failures: string[] = [];
const check = (ok: unknown, msg: string) => { if (!ok) failures.push(msg); };
const read = (dir: string, f: string) => readFileSync(join(dir, f), 'utf8');
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));

// The original, as CI and Vercel build it.
const dist = join(ROOT, 'dist');
check(read(dist, 'index.html').includes(`<link rel="canonical" href="${ORIGINAL_SITE_URL}/"`), 'the original build lost its canonical URL');
check(read(dist, 'index.html').includes(`${ORIGINAL_ORG_URL}/consent.js`), 'the original build lost the consent script');
check(read(dist, 'sitemap.xml').includes(`${ORIGINAL_SITE_URL}/backtester`), 'the original build lost its sitemap');

function forkBuild(name: string, siteUrl?: string): string {
  const out = join(ROOT, 'node_modules/.cache/fork-check', name);
  const env: NodeJS.ProcessEnv = { ...process.env, VERCEL_GIT_REPO_OWNER: 'someone-else', VERCEL_GIT_REPO_SLUG: 'edge-spectrum' };
  delete env.EDGE_SPECTRUM_SITE_URL;
  if (siteUrl) env.EDGE_SPECTRUM_SITE_URL = siteUrl;
  const r = spawnSync(process.execPath, [join(ROOT, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', out, '--emptyOutDir', '--logLevel', 'error'], { cwd: ROOT, env, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`fork build (${name}) failed:\n${r.stderr}`);
  return out;
}

// A fork with nothing set: no file may name the org domain.
const bare = forkBuild('bare');
for (const f of files(bare)) {
  if (/\.(png|jpe?g|webp|ico|woff2?)$/.test(f)) continue;
  if (readFileSync(f, 'utf8').includes(ORG_DOMAIN)) check(false, `a fork's build still names ${ORG_DOMAIN} in ${relative(bare, f)}`);
}
check(!read(bare, 'index.html').includes('rel="canonical"'), "a fork's build still has a canonical URL");

// A fork with its own address: everything points there.
const own = forkBuild('own', 'https://bets.example.com/');
check(read(own, 'index.html').includes('<link rel="canonical" href="https://bets.example.com/"'), "a fork's own address is not its canonical URL");
check(read(own, 'sitemap.xml').includes('https://bets.example.com/backtester'), "a fork's sitemap does not use its own address");
check(read(own, 'spectrum/index.html').includes('href="https://bets.example.com/spectrum/index.html"'), "the fork's Spectrum page does not use its own address");
check(!read(own, 'index.html').includes(ORG_DOMAIN), "a fork with its own address still loads the org's consent script");

if (failures.length) {
  console.error(`check:fork — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`check:fork — the original keeps its canonical URL, sitemap and consent script; a fork's build names ${ORG_DOMAIN} nowhere, and takes its own address when given one.`);
