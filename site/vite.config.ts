import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { ORIGINAL_ORG_URL, ORIGINAL_REPO, ORIGINAL_SITE_URL } from './src/projectLinks.ts';

/** owner/name of the repository being built: Vercel says so in its build env, anywhere else git does. */
function buildRepo(): string {
  const { VERCEL_GIT_REPO_OWNER: owner, VERCEL_GIT_REPO_SLUG: slug } = process.env;
  if (owner && slug) return `${owner}/${slug}`;
  try {
    const url = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return url.trim().match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1] ?? '';
  } catch {
    return ''; // no git (a tarball, a Docker build): not the original
  }
}

// Only the original repo's builds point at the original site and org (audit PROD-04).
const original = buildRepo().toLowerCase() === ORIGINAL_REPO;
const SITE_URL = (process.env.EDGE_SPECTRUM_SITE_URL ?? (original ? ORIGINAL_SITE_URL : '')).replace(/\/+$/, '');
const ORG_URL = original ? ORIGINAL_ORG_URL : '';
// Read by src/projectLinks.ts through import.meta.env.
process.env.VITE_SITE_URL = SITE_URL;
process.env.VITE_ORG_URL = ORG_URL;

/**
 * The commit this build is from, for `<meta name="build">` (org site upkeep: the surface-drift check
 * compares it with main). Vercel names it in the build env; elsewhere git does; neither, no stamp.
 */
function buildSha(): string {
  let sha = process.env.VERCEL_GIT_COMMIT_SHA ?? '';
  if (!sha) {
    try { sha = execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* no git */ }
  }
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : '';
}
const BUILD_SHA = buildSha();
const stamp = (html: string) =>
  BUILD_SHA ? html.replace('<meta charset="UTF-8" />', `$&\n    <meta name="build" content="${BUILD_SHA}" />`) : html;

/** Point a page at this build's own site, or drop the lines that would point at the original. */
function retarget(text: string): string {
  const drop = (needle: string) => text.split('\n').filter((line) => !line.includes(needle)).join('\n');
  if (SITE_URL !== ORIGINAL_SITE_URL) text = SITE_URL ? text.replaceAll(ORIGINAL_SITE_URL, SITE_URL) : drop(ORIGINAL_SITE_URL);
  if (!ORG_URL) text = drop(`${ORIGINAL_ORG_URL}/`);
  return text;
}

/** index.html as Vite builds it, plus the files `public/` copies verbatim. */
function siteUrls(): Plugin {
  let outDir = 'dist';
  return {
    name: 'edge-spectrum-site-urls',
    configResolved: (c) => { outDir = c.build.outDir; },
    transformIndexHtml: (html) => stamp(retarget(html)),
    closeBundle() {
      for (const f of ['spectrum/index.html', 'robots.txt', 'sitemap.xml']) {
        const p = join(outDir, f);
        if (existsSync(p)) writeFileSync(p, retarget(readFileSync(p, 'utf8')));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), siteUrls()],
    server: {
      // server.ts runs Vite in middleware mode, which opens the HMR WebSocket on its own
      // port (default 24678). Pin it so this app and my-prompt-library can run side by side.
      hmr: { port: 24679 },
      // Vite answers 403 to any Host but localhost, middleware mode included. ALLOWED_HOSTS
      // (site/.env) lets in the names a proxy such as `tailscale serve` forwards unchanged.
      allowedHosts: process.env.ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean),
    },
  };
});
