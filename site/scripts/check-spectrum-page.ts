/**
 * Browser smoke test for the Spectrum page (roadmap Action 2.9).
 *
 * `check:spectrum` runs the page's math; nothing ran the page. Every defect found
 * during the V21 rebuild — a squeezed plot, a pinned custom row dropped by
 * `update()`, list buttons rendering as raw grey buttons — was caught by hand.
 * This serves the built `dist/` with `vite preview` (the file that deploys, Plotly
 * from its CDN) and drives it in headless Chromium:
 *
 *   - it loads with one bar per record and no console errors
 *   - the plot fills its box, and the inspector's `.li` buttons keep their reset
 *   - clicking a bar pins it, and the URL reopens the same pin in a fresh tab
 *   - the theme switch redraws the chart
 *   - "Where do I sit?" places a "You" bar that survives a filter change
 *
 * Run after `npm run build`. CI needs `npx playwright install --with-deps chromium`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { preview } from 'vite';
import { chromium, type Page } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = resolve(ROOT, 'dist/spectrum/index.html');
if (!existsSync(PAGE)) {
  console.error(`check:spectrum-page — ${PAGE} is missing; run \`npm run build\` first.`);
  process.exit(1);
}
const RECORDS = (JSON.parse(readFileSync(resolve(ROOT, 'public/spectrum/edges.json'), 'utf8')) as unknown[]).length;

const failures: string[] = [];
const expect = (ok: boolean, msg: string) => { if (!ok) failures.push(msg); console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${msg}`); };

const server = await preview({ root: ROOT, logLevel: 'silent', preview: { port: 0, open: false } });
const base = server.resolvedUrls!.local[0];
const browser = await chromium.launch();

// The chart element carries Plotly's state; these read it rather than the SVG.
const bars = (p: Page) => p.evaluate(() => {
  const el = document.getElementById('chart') as unknown as { data?: { x: string[] }[] };
  return el.data?.[0]?.x ?? [];
});
const ready = (p: Page) => p.waitForFunction(() => {
  const el = document.getElementById('chart') as unknown as { data?: { x: string[] }[] };
  return (el.data?.[0]?.x?.length ?? 0) > 0;
}, null, { timeout: 30_000 });

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  // l=all shows every layer, so every record is a bar.
  await page.goto(`${base}spectrum/index.html?l=all`);
  await ready(page);
  const all = await bars(page);
  expect(all.length === RECORDS, `loads with ${all.length} bars (edges.json has ${RECORDS})`);

  const fill = await page.evaluate(() => {
    const el = document.getElementById('chart') as unknown as HTMLElement & { _fullLayout: { _size: { w: number } } };
    return el._fullLayout._size.w / el.clientWidth;
  });
  expect(fill > 0.6, `plot area fills ${(fill * 100).toFixed(0)}% of the chart width`);

  const li = await page.locator('#insp .li').first().evaluate((b) => {
    const s = getComputedStyle(b);
    return { bg: s.backgroundColor, border: s.borderTopWidth };
  });
  expect(li.bg === 'rgba(0, 0, 0, 0)' && li.border === '0px', `inspector .li buttons keep their reset (bg ${li.bg}, border ${li.border})`);

  // A real click on a bar, through Plotly's own hit-testing.
  // Plotly registers a click on the point it last hovered, so move there first.
  const bar = page.locator('#chart .bars .point path').first();
  await bar.scrollIntoViewIfNeeded();
  const box = await bar.boundingBox();
  if (!box) throw new Error('no bar to click');
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(x, y, { steps: 3 });
  await page.mouse.click(x, y);
  await page.waitForFunction(() => new URLSearchParams(location.search).has('pin'), null, { timeout: 5_000 }).catch(() => {});
  const pinned = new URL(page.url()).searchParams.get('pin');
  expect(!!pinned && all.includes(pinned), `clicking a bar pins it (pin=${pinned})`);
  const title = await page.locator('#insp .insp-title').textContent();
  expect(title === pinned, `the inspector shows the pinned row ("${title}")`);

  const fresh = await ctx.newPage();
  await fresh.goto(page.url());
  await ready(fresh);
  const reopened = await fresh.locator('#insp .insp-title').textContent();
  const pinBtn = await fresh.locator('#pinBtn').textContent({ timeout: 5_000 }).catch(() => null);
  expect(reopened === pinned && /Unpin/.test(pinBtn ?? ''), `the URL reopens the same pin in a new tab ("${reopened}")`);
  await fresh.close();

  // Theme: the chart's inks are theme-dependent, so the layout must change.
  const layout = () => page.evaluate(() => JSON.stringify((document.getElementById('chart') as unknown as { layout: unknown }).layout));
  const dark = await layout();
  await page.click('.theme-toggle [data-theme="light"]');
  const light = await layout();
  const cls = await page.evaluate(() => document.documentElement.className);
  expect(/\blight\b/.test(cls) && light !== dark, `the theme switch redraws the chart (html.${cls})`);

  // "Where do I sit?": the form's defaults are a valid wager; give it a name and submit.
  await page.click('#addYou');
  await page.fill('#youForm input[name="n"]', 'Smoke Test Row');
  await page.click('#youForm button[type="submit"]');
  const withYou = await bars(page);
  expect(withYou.includes('Smoke Test Row'), 'the form places a "You" bar');
  expect(new URL(page.url()).searchParams.get('yn') === 'Smoke Test Row', 'the "You" row is kept in the URL');
  const shared = await ctx.newPage();
  await shared.goto(page.url());
  await ready(shared);
  const sharedTitle = await shared.locator('#insp .insp-title').textContent();
  expect((await bars(shared)).includes('Smoke Test Row') && sharedTitle === 'Smoke Test Row', 'the "You" link reopens with the bar placed and pinned');
  await shared.close();
  await page.click('#cats [data-quick="none"]');
  expect((await bars(page)).includes('Smoke Test Row'), 'the "You" bar ignores the category filters');

  expect(errors.length === 0, `no console errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
} finally {
  await browser.close();
  await new Promise<void>((r) => server.httpServer.close(() => r()));
}

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nSpectrum page check passed: it loads, pins, shares, themes and places a "You" bar.');
