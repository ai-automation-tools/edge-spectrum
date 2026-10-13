/**
 * Browser smoke test for the Spectrum page (Action 2.9).
 *
 * `check:spectrum` tests the page's math; this tests the page. It serves the built
 * `dist/` with `vite preview` — the files Vercel deploys — and drives the page in
 * headless Chromium through the interactions that broke by hand during the V21 rebuild.
 * Run after `npm run build`. Needs the Plotly CDN, as the deployed page does.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chromium, type Page } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = 4317;
const PAGE_URL = `http://127.0.0.1:${PORT}/spectrum/index.html`;
const EXPECTED_RECORDS = 225;

const failures: string[] = [];
const check = (ok: unknown, msg: string) => { if (!ok) failures.push(msg); };

const server = spawn(process.execPath, [resolve(HERE, '../node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  cwd: resolve(HERE, '..'), stdio: 'ignore',
});

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(PAGE_URL)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`check:spectrum-browser — vite preview never answered on ${PAGE_URL}; run \`npm run build\` first`);
}

/** Open the page and wait until the chart holds its bars. Collects console errors and uncaught exceptions. */
async function open(page: Page, qs = '') {
  await page.goto(PAGE_URL + qs);
  await page.waitForFunction(() => (document.getElementById('chart') as any)?.data?.[0]?.x?.length > 0, null, { timeout: 30_000 });
}
const bars = (page: Page) => page.evaluate(() => (document.getElementById('chart') as any).data[0].x.length as number);

const browser = await chromium.launch();
try {
  await waitForServer();
  const errors: string[] = [];
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  // ── 1. Loads with every record and no errors ───────────────────────────────
  // l=all: the default Gross layer hides the fee and tax rows.
  await open(page, '?l=all');
  check((await bars(page)) === EXPECTED_RECORDS, `loaded ${await bars(page)} bars, expected ${EXPECTED_RECORDS}`);
  // The plot area must fill its box; V21 once shipped a squeezed plot.
  const fill = await page.evaluate(() => { const el = document.getElementById('chart') as any; return el._fullLayout._size.w / el.clientWidth; });
  check(fill > 0.6, `the plot fills only ${(fill * 100).toFixed(0)}% of the chart width`);

  // ── 2. The overview's list buttons keep their reset (border 0, no fill) ────
  // Without the `.li` reset they render as grey native buttons; V21 shipped that once.
  const li = await page.locator('#insp .li').first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { border: s.borderTopWidth, bg: s.backgroundColor };
  });
  check(li.border === '0px' && li.bg === 'rgba(0, 0, 0, 0)', `.li buttons lost their reset: border ${li.border}, background ${li.bg}`);

  // ── 3. A real click on a bar pins it, and the pin survives a reload ────────
  const box = (await page.locator('#chart .bars .point path').first().boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + Math.min(box.height / 2, 20));
  const pinned = await page.locator('#insp.pinned .insp-title').textContent({ timeout: 5_000 }).catch(() => null);
  check(pinned, 'clicking a bar did not pin it');
  const pinUrl = page.url();
  check(new URL(pinUrl).searchParams.get('pin') === pinned, `pin is not in the URL (${pinUrl})`);
  await open(page, new URL(pinUrl).search);
  check((await page.locator('#insp.pinned .insp-title').textContent()) === pinned, 'the pinned bar did not survive a reload');

  // ── 4. The theme switch redraws the chart in the other palette ─────────────
  const tick = () => page.evaluate(() => (document.getElementById('chart') as any).layout.yaxis.tickfont.color as string);
  const darkTick = await tick();
  await page.click('.theme-toggle [data-theme="light"]');
  await page.waitForFunction((t) => (document.getElementById('chart') as any).layout.yaxis.tickfont.color !== t, darkTick, { timeout: 5_000 }).catch(() => {});
  check(await page.evaluate(() => document.documentElement.classList.contains('light')), 'theme switch did not set the light class');
  check((await tick()) !== darkTick, 'theme switch did not redraw the chart');
  await page.click('.theme-toggle [data-theme="dark"]');

  // ── 5. "Where do I sit?" places a bar ──────────────────────────────────────
  await open(page);
  const before = await bars(page);
  await page.click('#addYou');
  await page.click('#youForm button[type="submit"]');
  await page.waitForFunction((n) => (document.getElementById('chart') as any).data[0].x.length === n, before + 1, { timeout: 5_000 }).catch(() => {});
  check((await bars(page)) === before + 1, 'the "Where do I sit?" form did not add a bar');
  // The link reopens it placed and pinned, and it ignores the category filters.
  const youName = new URL(page.url()).searchParams.get('yn');
  await open(page, new URL(page.url()).search);
  const youNames = await page.evaluate(() => (document.getElementById('chart') as any).data[0].x as string[]);
  check(youName && youNames.includes(youName) && (await page.locator('#insp.pinned .insp-title').textContent()) === youName, 'the "You" link does not reopen placed and pinned');
  await page.click('#cats [data-quick="none"]');
  check(youName && (await page.evaluate(() => (document.getElementById('chart') as any).data[0].x as string[])).includes(youName), 'the "You" bar disappears under the None category filter');
  check(new URL(page.url()).searchParams.has('ym'), 'the "You" row is not in the URL');

  // ── 6. Comparison search and compare mode ──────────────────────────────────
  await open(page, '?q=' + encodeURIComponent('slots, S&P 500 Index'));
  check((await bars(page)) === 5, `"slots, S&P 500 Index" shows ${await bars(page)} bars, expected 5`);
  await open(page, '?cmp=' + encodeURIComponent('Slots Average 92%|S&P 500 Index (SPY/VOO)'));
  const lines = await page.evaluate(() => (document.getElementById('cmpChart') as any)?.data?.filter((t: any) => t.mode === 'lines+markers').length ?? 0);
  check(lines === 2, `compare mode drew ${lines} lines from the URL, expected 2`);

  // ── 7. Embed mode shows the chart alone ────────────────────────────────────
  await open(page, '?embed=1');
  check(await page.locator('.controls').isHidden(), 'embed mode still shows the controls');
  check(await page.locator('.embed-cap').isVisible(), 'embed mode has no caption (helpline, full-tool link)');

  check(errors.length === 0, `console errors: ${errors.slice(0, 3).join(' | ')}`);
  await page.close();

  // ── 8. Touch screens scroll past the chart instead of zooming it ───────────
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await open(phone);
  check((await phone.evaluate(() => (document.getElementById('chart') as any).layout.dragmode)) === false, 'touch screens still get drag-zoom on the chart');
  await phone.close();
} finally {
  await browser.close();
  server.kill();
}

if (failures.length > 0) {
  console.error(`Spectrum browser check — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('Spectrum browser check passed: loads clean, pins, survives reload, re-themes, places "You", compares, embeds, and leaves touch scrolling alone.');
