/**
 * Builds Edge Spectrum's Cronsole catalog (Registry v1) into site/public/registry/, so Vite
 * ships it and Vercel serves it at https://edge-spectrum.ai-automation-tools.dev/registry/,
 * where the Cronsole gallery (https://cronsole.ai-automation-tools.dev/) reads it.
 *
 *   registry/templates/<id>.json   one template per file
 *   registry/packs/<id>.json       an importable bundle
 *   registry/index.json            every template and pack with the sha256 of its exact bytes
 *
 * Deterministic and LF (no timestamps): Cronsole verifies each file's sha256 over its bytes.
 * Edit the templates HERE, never the output. Also fails if the README stops linking a template.
 *
 *   npm run build:registry            write
 *   npm run build:registry -- --check exit 1 if the committed output or a README link is stale
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(SITE, 'public', 'registry');
const README = join(SITE, '..', 'README.md');
export const HOSTED = 'https://edge-spectrum.ai-automation-tools.dev/registry/';
const GALLERY = 'https://cronsole.ai-automation-tools.dev/';

const REPO_PARAM = {
  key: 'repoPath', label: 'edge-spectrum clone', type: 'path', required: true,
  help: 'Absolute path to your clone of ai-automation-tools/edge-spectrum, with `npm ci` run in its site/ folder.',
};

// Audit GOV-01. The same notice is in the README; change them together.
const ESPN_NOTICE = "Uses an unofficial, undocumented ESPN endpoint: Edge Spectrum is not affiliated with ESPN, you are responsible for following ESPN's terms of use, and the capture is for personal, low-volume use, not for republishing.";

const TEMPLATES = [
  {
    schemaVersion: '1.0',
    id: 'edge-spectrum-line-capture',
    name: 'Edge Spectrum: ESPN Line Capture',
    description:
      'Snapshots ESPN\'s public scoreboard for NFL, NBA, MLB and NHL and appends one JSON line per game '
      + '(spread, total, moneyline, scores) to <output>/<SPORT>/<day>.jsonl, labelling each pre-game capture '
      + 'open, midday or close for closing-line-value analysis. Append-only, no keys. Needs Node 22 or 24 and a clone '
      + 'of edge-spectrum with `npm ci` run in site/. ' + ESPN_NOTICE,
    runtime: 'node',
    os: 'cross-platform',
    category: 'data-sync',
    tags: ['edge-spectrum', 'sports', 'odds', 'espn', 'clv', 'data-capture'],
    icon: 'LineChart',
    trigger: { kind: 'schedule', cron: '0 */3 * * *' },
    commandTemplate:
      'node "{{repoPath}}/site/node_modules/tsx/dist/cli.mjs" "{{repoPath}}/site/scripts/capture-lines.ts" '
      + '--out "{{outputDir}}" --interval-hours {{intervalHours}}',
    parameters: [
      REPO_PARAM,
      {
        key: 'outputDir', label: 'Line archive folder', type: 'path', required: true,
        help: 'Where the JSONL files go. Files are only ever appended to.',
      },
      {
        key: 'intervalHours', label: 'Hours between runs', type: 'text', default: '3', required: true,
        help: 'Match it to the schedule: a capture within this many hours of the start is labelled close.',
      },
    ],
    compatibleTargets: ['windows', 'cronsole-native', 'linux', 'macos'],
    // No retry: a retry minutes later would log a second, near-identical capture.
    execution: { timeoutSec: 300, retries: 0 },
    author: 'ai-automation-tools',
    version: '0.1.0',
  },
  {
    schemaVersion: '1.0',
    id: 'edge-spectrum-line-digest',
    name: 'Edge Spectrum: Daily Line Movement Digest',
    description:
      "Reads yesterday's captures from the ESPN Line Capture archive and writes a markdown digest to "
      + "<archive>/digests/<day>.md: each game's opening and closing spread, total and home moneyline, the final "
      + 'score, the biggest spread moves, and any game missing an opening or closing capture. Read-only over the '
      + 'archive, no keys, no network. Fails when the day has no capture file at all, which means the capture '
      + 'task did not run. Needs the line capture template running, Node 22 or 24 and a clone of edge-spectrum with '
      + '`npm ci` run in site/. The archive it reads comes from an unofficial ESPN endpoint: keep the digests for personal use. '
      + "The digest is also the run's output: turn on Notify on success for this task under Settings, Run-outcome webhook "
      + 'and Cronsole posts it to ntfy, Discord, email (Resend) or your own endpoint.',
    runtime: 'node',
    os: 'cross-platform',
    category: 'monitoring',
    tags: ['edge-spectrum', 'sports', 'odds', 'clv', 'report', 'line-movement'],
    icon: 'FileText',
    // 12:30 UTC: after the night's late games are final and a 3-hourly capture has logged them.
    trigger: { kind: 'schedule', cron: '30 12 * * *' },
    commandTemplate:
      'node "{{repoPath}}/site/node_modules/tsx/dist/cli.mjs" "{{repoPath}}/site/scripts/digest-lines.ts" '
      + '--archive "{{archiveDir}}"',
    parameters: [
      REPO_PARAM,
      {
        key: 'archiveDir', label: 'Line archive folder', type: 'path', required: true,
        help: "The ESPN Line Capture template's output folder. Digests go to its digests/ subfolder.",
      },
    ],
    compatibleTargets: ['windows', 'cronsole-native', 'linux', 'macos'],
    execution: { timeoutSec: 120 },
    author: 'ai-automation-tools',
    version: '0.1.1',
  },
  {
    schemaVersion: '1.0',
    id: 'edge-spectrum-market-close',
    name: 'Edge Spectrum: Market Close Capture',
    description:
      'Fetches the last ten days of end-of-day prices for named tickers (SPY, QQQ, GLD and HYG by default) from '
      + 'Tiingo and appends each trading day not yet recorded to <output>/<TICKER>.jsonl: close, adjusted close, '
      + 'dividend and split factor, with the capture time. Append-only, one request per ticker. Needs your own free '
      + 'Tiingo key as TIINGO_API_KEY in site/.env, Node 22 or 24 and a clone of edge-spectrum with `npm ci` run in '
      + "site/. Tiingo's free plan is for personal use only: keep the archive to yourself.",
    runtime: 'node',
    os: 'cross-platform',
    category: 'data-sync',
    tags: ['edge-spectrum', 'investing', 'etf', 'market-data', 'data-capture'],
    icon: 'TrendingUp',
    // 23:30 UTC on weekdays: after the US close and Tiingo's end-of-day update, in either daylight-saving season.
    trigger: { kind: 'schedule', cron: '30 23 * * 1-5' },
    commandTemplate:
      'node "{{repoPath}}/site/node_modules/tsx/dist/cli.mjs" "{{repoPath}}/site/scripts/capture-closes.ts" '
      + '--out "{{outputDir}}" --tickers "{{tickers}}"',
    parameters: [
      REPO_PARAM,
      {
        key: 'outputDir', label: 'Close archive folder', type: 'path', required: true,
        help: 'Where the per-ticker JSONL files go. Files are only ever appended to.',
      },
      {
        key: 'tickers', label: 'Tickers', type: 'text', default: 'SPY,QQQ,GLD,HYG', required: true,
        help: 'Comma-separated symbols, no spaces. Each is one request a run; the free plan allows 50 an hour.',
      },
    ],
    compatibleTargets: ['windows', 'cronsole-native', 'linux', 'macos'],
    execution: { timeoutSec: 120 },
    author: 'ai-automation-tools',
    version: '0.1.0',
  },
];

const PACKS = [
  {
    id: 'edge-spectrum',
    name: 'Edge Spectrum: Line Archive',
    description: 'Forward capture of public ESPN lines into an append-only archive, for closing-line-value analysis, and a daily digest of how each line moved.',
    templateIds: ['edge-spectrum-line-capture', 'edge-spectrum-line-digest'],
  },
];

// Mirrors cronsole backend/src/catalog/schema.ts (Registry v1).
const TARGETS = new Set(['windows', 'cronsole-native', 'macos', 'linux', 'claude-code', 'chatgpt', 'gemini']);
const COMMAND_SHAPE = /^node "\{\{repoPath\}\}\/site\/node_modules\/tsx\/dist\/cli\.mjs" "\{\{repoPath\}\}\/site\/scripts\/[a-z-]+\.ts"( --[a-z-]+ ("\{\{\w+\}\}"|\{\{\w+\}\}))*$/;
function validate(t) {
  const errs = [];
  const req = (ok, msg) => { if (!ok) errs.push(`${t.id}: ${msg}`); };
  req(/^edge-spectrum(-[a-z0-9]+)+$/.test(t.id), 'id must match edge-spectrum-<name> so it cannot collide with Cronsole ids');
  req(t.schemaVersion === '1.0' && t.name, 'schemaVersion 1.0 and a name are required');
  req(t.trigger?.kind === 'schedule' && t.trigger.cron.split(' ').length === 5, 'trigger must be a 5-field schedule');
  req(t.compatibleTargets.length && t.compatibleTargets.every(x => TARGETS.has(x)), 'bad compatibleTargets');
  const keys = new Set((t.parameters || []).map(p => p.key));
  const used = [...(t.commandTemplate || '').matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
  req(used.every(k => keys.has(k)), `placeholders without parameters: ${used.filter(k => !keys.has(k))}`);
  req((t.parameters || []).every(p => !('default' in p) || typeof p.default === 'string'), 'parameter defaults must be strings');
  // These commands run on other people's machines. The only shape allowed is this repo's own tsx
  // running a script under site/scripts/, with flags whose values are parameters (audit AI-01).
  req(COMMAND_SHAPE.test(t.commandTemplate || ''), 'commandTemplate must be node, the tsx in the clone, a script under {{repoPath}}/site/scripts/, then --flag {{param}} pairs');
  return errs;
}

const dump = obj => JSON.stringify(obj, null, 2) + '\n';
const sha = text => createHash('sha256').update(text, 'utf8').digest('hex');

export function build() {
  const errs = TEMPLATES.flatMap(validate);
  const ids = new Set(TEMPLATES.map(t => t.id));
  for (const p of PACKS) for (const id of p.templateIds) if (!ids.has(id)) errs.push(`pack ${p.id}: unknown template ${id}`);
  const readme = readFileSync(README, 'utf8');
  for (const id of ids) if (!readme.includes(`${GALLERY}#/t/${id}`)) errs.push(`README.md does not link ${GALLERY}#/t/${id}`);
  if (errs.length) throw new Error('Registry validation failed:\n  ' + errs.join('\n  '));

  const files = new Map();
  const templates = [...TEMPLATES].sort((a, b) => a.id.localeCompare(b.id)).map(t => {
    const path = `templates/${t.id}.json`;
    const body = dump(t);
    files.set(path, body);
    const { id, name, description, category, tags, runtime, os, compatibleTargets } = t;
    return { id, name, description, category, tags, runtime, os, compatibleTargets, path, sha256: sha(body) };
  });
  const packs = PACKS.map(({ templateIds, ...meta }) => {
    const path = `packs/${meta.id}.json`;
    const body = dump({ cronsoleCatalogVersion: '1.0', pack: meta, templates: templateIds.map(id => TEMPLATES.find(t => t.id === id)) });
    files.set(path, body);
    return { ...meta, templateIds, path, sha256: sha(body) };
  });
  files.set('index.json', dump({ registryVersion: '1.0', templates, packs }));
  return files;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(join(dir, e.name)) : [relative(OUT, join(dir, e.name)).split('\\').join('/')]);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = build();
  const existing = walk(OUT);
  const stale = [...files].filter(([p, b]) => !existsSync(join(OUT, p)) || readFileSync(join(OUT, p), 'utf8') !== b).map(([p]) => p);
  const orphans = existing.filter(p => !files.has(p));
  if (process.argv.includes('--check')) {
    for (const p of [...stale, ...orphans]) console.log(`stale: site/public/registry/${p}`);
    if (stale.length || orphans.length) process.exit(1);
    console.log(`registry OK: ${files.size} files current`);
  } else {
    for (const p of orphans) rmSync(join(OUT, p));
    for (const [p, b] of files) { mkdirSync(dirname(join(OUT, p)), { recursive: true }); writeFileSync(join(OUT, p), b); }
    console.log(`registry: ${TEMPLATES.length} template(s), ${PACKS.length} pack(s) -> site/public/registry/`);
  }
}
