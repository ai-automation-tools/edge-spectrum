// Bundle budget, run after `npm run build` (audit PERF-01). Routes are split so the hub page
// does not carry the chart and markdown libraries; this fails the build if that slips.
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const MAX_CHUNK_RAW = 500_000; // any one chunk
const MAX_ENTRY_GZIP = 150_000; // JS the home page needs before it renders (roadmap Action 4.5)

const dist = join(import.meta.dirname, '..', 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
// The entry script plus whatever Vite preloads alongside it.
const initial = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]);
const size = (file) => {
  const bytes = readFileSync(join(dist, file));
  return { raw: bytes.length, gzip: gzipSync(bytes).length };
};

const failures = [];
for (const file of readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.js'))) {
  const { raw } = size(`assets/${file}`);
  if (raw > MAX_CHUNK_RAW) failures.push(`${file} is ${raw} bytes raw, over ${MAX_CHUNK_RAW}`);
}
const entryGzip = initial.reduce((sum, file) => sum + size(file).gzip, 0);
if (!initial.length) failures.push('no entry script found in dist/index.html');
if (entryGzip > MAX_ENTRY_GZIP) failures.push(`initial JS is ${entryGzip} bytes gzip, over ${MAX_ENTRY_GZIP}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Bundle check passed: initial JS ${(entryGzip / 1000).toFixed(1)} kB gzip in ${initial.length} file(s); no chunk over ${MAX_CHUNK_RAW / 1000} kB raw.`);
