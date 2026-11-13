/**
 * Browser smoke test for the Spectrum page (Action 2.9).
 *
 * `check:spectrum` tests the page's math; this tests the page. It serves the built
 * `dist/` with `vite preview` — the files Vercel deploys — and drives the page in
 * headless Chromium through the interactions that broke by hand during the V21 rebuild.
 * Run after `npm run build`. Plotly is served from `dist/spectrum/` (Action 2.11); the fonts
 * still come from Google's CDN.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chromium, type Page } from 'playwright';
import { runBacktest } from '../src/dataGenerator';
import { DEFAULT_STRATEGY } from '../src/strategyUrl';
import { EDGES } from '../src/data/edges';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = 4317;
const PAGE_URL = `http://127.0.0.1:${PORT}/spectrum/index.html`;
// The one record count, in the baseline `check:edges -- --write-baseline` writes (audit AI-08).
const EXPECTED_RECORDS: number = JSON.parse(readFileSync(resolve(HERE, '../src/data/provenance-baseline.json'), 'utf8')).totalRecords;

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
  // Plotly is self-hosted (Action 2.11); a request to its CDN means the script tag regressed.
  const plotlyCdn: string[] = [];
  page.on('request', (r) => { if (new URL(r.url()).hostname.endsWith('plot.ly')) plotlyCdn.push(r.url()); });

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

  // ── 3b. Undated figures carry a "verify" badge; freshly cited ones do not ──
  // Clock pinned, so the S&P 500 citation ageing past a year cannot fail CI.
  await page.clock.setFixedTime(new Date('2026-10-20'));
  const verifyBadge = async (name: string) => {
    await open(page, '?l=all&pin=' + encodeURIComponent(name));
    return page.locator('#insp .insp-meta .badge', { hasText: /^verify$/ }).count();
  };
  // Any undated row: a fixed name breaks once that row is cited.
  const undated = EDGES.find(r => !r.asOf);
  check(!!undated && (await verifyBadge(undated.n)) === 1, 'an undated row shows no "verify" badge');
  check((await verifyBadge('S&P 500 Index (SPY/VOO)')) === 0, 'a cited, dated row shows a "verify" badge');

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

  // ── 5b. The open form keeps what was typed through a bar hover, a Play tick and
  //        arrow keys in its select, which leave the horizon alone (audit BUG-25) ──
  await open(page);
  await page.click('#addYou');
  await page.fill('#youForm input[name="n"]', 'Typed name');
  await page.fill('#youForm input[name="e"]', '-1.25');
  const typed = () => page.evaluate(() => {
    const f = document.getElementById('youForm') as HTMLFormElement | null;
    return f ? ['n', 'e'].map((k) => (f.elements.namedItem(k) as HTMLInputElement).value).join('|') : 'form gone';
  });
  const bar = (await page.locator('#chart .bars .point path').nth(3).boundingBox())!;
  await page.mouse.move(bar.x + bar.width / 2, bar.y + Math.min(bar.height / 2, 20));
  await page.waitForTimeout(300);
  check((await typed()) === 'Typed name|-1.25', `hovering a bar wiped the form (${await typed()})`);
  await page.mouse.move(5, 5);
  await page.click('#btnPlay');
  await page.waitForFunction(() => new URL(location.href).searchParams.has('h'), null, { timeout: 3_000 }).catch(() => {});
  check(new URL(page.url()).searchParams.has('h') && (await typed()) === 'Typed name|-1.25', `a Play tick wiped the form (${await typed()})`);
  await page.click('#btnPlay');
  const horizon = new URL(page.url()).searchParams.get('h');
  await page.focus('#youForm select[name="game"]');
  await page.keyboard.press('ArrowLeft'); // Play left the horizon past 1yr, so one press would move it
  check(new URL(page.url()).searchParams.get('h') === horizon, 'arrow keys in the form\'s select changed the horizon');

  // ── 5c. A reader's own row name is text in the chart, never markup (audit BUG-33) ──
  const markup = '<a href="https://example.com">x</a>';
  await open(page, '?ym=i&ya=5&yn=' + encodeURIComponent(markup));
  check((await page.locator('#chart a').count()) === 0, 'a "You" name made a link in the chart');
  const youText = await page.locator('#chart .bars text').filter({ hasText: '▼' }).allTextContents();
  check(youText.length === 1 && youText[0].includes(markup), `a "You" name with markup is not shown as written: ${JSON.stringify(youText)}`);

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
  check(plotlyCdn.length === 0, `the page still fetches Plotly from its CDN: ${plotlyCdn[0]}`);
  await page.close();

  // ── 8. Touch screens scroll past the chart instead of zooming it ───────────
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await open(phone);
  check((await phone.evaluate(() => (document.getElementById('chart') as any).layout.dragmode)) === false, 'touch screens still get drag-zoom on the chart');
  await phone.close();

  // ── 9. Backtester: a failed run takes the old numbers down, and a min above its max is
  //       said in the form and never sent (audit BUG-20, BUG-16) ──────────────────────────
  // `vite preview` has no API, so the endpoint is answered here with a real engine run.
  const bt = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const run = JSON.stringify(runBacktest(DEFAULT_STRATEGY));
  let failing = false;
  let posts = 0;
  await bt.route('**/api/backtest', (route) => {
    posts++;
    return failing
      ? route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"engine fell over"}' })
      : route.fulfill({ status: 200, contentType: 'application/json', body: run });
  });
  const kpis = bt.getByText('Net profit (P/L)');
  const execute = bt.getByRole('button', { name: 'Execute Backtest' });
  await bt.goto(`http://127.0.0.1:${PORT}/backtester`);
  await kpis.waitFor({ timeout: 15_000 });
  failing = true;
  await execute.click();
  await bt.getByText('engine fell over').waitFor({ timeout: 5_000 });
  check((await kpis.count()) === 0, 'a failed backtest leaves the previous result on screen');
  failing = false;
  await execute.click();
  await kpis.waitFor({ timeout: 5_000 });

  await bt.getByRole('button', { name: /Advanced Screening/ }).click();
  await bt.fill('#sb-oddsMin', '200');
  await bt.waitForTimeout(800); // past the 300 ms rerun debounce
  const sent = posts;
  await bt.fill('#sb-oddsMax', '100');
  await bt.waitForTimeout(800);
  check(posts === sent, 'a min above its max was sent to /api/backtest');
  check(await bt.getByRole('alert').filter({ hasText: 'Odds maximum must be greater than or equal to the minimum' }).isVisible(), 'the form does not say that the odds range is inverted');
  check(await execute.isDisabled(), 'Execute stays enabled on an inverted range');
  check((await bt.getAttribute('#sb-oddsMax', 'aria-invalid')) === 'true', 'the inverted maximum is not marked invalid');
  await bt.fill('#sb-oddsMax', '300');
  await bt.waitForTimeout(800);
  check(posts === sent + 1 && await execute.isEnabled(), 'fixing the range does not run the backtest again');
  // Totals take no streak filter, so the control goes with the bet type.
  check(await bt.locator('#sb-streak').isVisible(), 'the streak filter is missing on a moneyline bet');
  await bt.getByRole('button', { name: 'totals', exact: true }).click();
  check((await bt.locator('#sb-streak').count()) === 0, 'the streak filter is still offered on a totals bet');
  await bt.close();

  // ── 10. Accessibility depth (audit UX-05, -06, -11, -12, -13, -16, -19) ────────────────
  const a11y = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await a11y.route('**/api/backtest', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: run }));
  await a11y.route('**/api/espn-scoreboard**', (route) => route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"ESPN is down"}' }));
  await a11y.goto(`http://127.0.0.1:${PORT}/backtester`);
  await a11y.getByText('Net profit (P/L)').waitFor({ timeout: 15_000 });
  // UX-12: the finished run is announced in one sentence.
  check(/^Backtest done: [\d,]+ bets/.test(await a11y.getByRole('status').filter({ hasText: 'Backtest done' }).innerText().catch(() => '')), 'a finished backtest is not announced');
  // PROD-06: the CSV holds every wager of the run, not the 250-row preview.
  const [download] = await Promise.all([a11y.waitForEvent('download'), a11y.getByRole('button', { name: 'CSV' }).click()]);
  const csvRows = readFileSync((await download.path())!, 'utf8').trimEnd().split('\n').length - 1;
  const wagers = (JSON.parse(run) as { summary: { totalBets: number } }).summary.totalBets;
  check(csvRows === wagers, `the CSV has ${csvRows} rows for ${wagers} wagers`);
  // PROD-13: the luck panel draws the fan and says in words what it shows, with the season split.
  await a11y.getByText('How much was luck').waitFor({ timeout: 15_000 });
  check(/nine times in ten/.test(await a11y.getByText(/reshuffles of these/).innerText()), 'the fan chart has no text summary');
  check((await a11y.getByText(/\(out of sample\)/).count()) === 1, 'the walk-forward split is missing');
  // UX-06: 25 rows a page, newest first, and the sortable headers say how they are sorted.
  const rows = a11y.locator('table tbody tr');
  check((await rows.count()) === 25, `the game log shows ${await rows.count()} rows, not 25`);
  const dateTh = a11y.locator('th[aria-sort]').filter({ hasText: 'Date' });
  check((await dateTh.getAttribute('aria-sort')) === 'descending', 'the game log is not sorted newest first');
  await a11y.locator('th').filter({ hasText: 'Net Return' }).getByRole('button').click();
  const nets = await rows.evaluateAll((trs) => trs.map((tr) => Number(tr.children[6].textContent!.replace(/[^\d.-]/g, ''))));
  check(nets.every((v, i) => i === 0 || nets[i - 1] >= v), 'sorting by net return does not order the rows');
  check((await dateTh.getAttribute('aria-sort')) === 'none', 'the date header still claims the sort');
  await a11y.getByRole('button', { name: 'Next' }).click();
  check((await a11y.getByText(/^Rows 26–50 of/).count()) === 1, 'the game log does not page');
  // UX-11: toggles and the current page expose their state.
  check((await a11y.getByRole('button', { name: 'win', exact: true }).getAttribute('aria-pressed')) === 'false', 'the game-log filter has no pressed state');
  check((await a11y.locator('nav[aria-label="Tools"] a[aria-current="page"]').getAttribute('href')) === '/backtester', 'the topbar does not mark the current page');
  // UX-13: the equity curve has a name and a text summary tied to it.
  const curve = a11y.getByRole('img', { name: 'Equity curve' });
  const described = await curve.evaluate((el) => document.getElementById(el.getAttribute('aria-describedby')!)?.textContent ?? '');
  check(/cumulative profit ends at/.test(described), 'the equity curve has no text summary');
  // UX-11 and UX-12: the tabs follow the tab pattern, and a scoreboard error is announced.
  await a11y.getByRole('tab', { name: /Backtest analytics/ }).focus();
  await a11y.keyboard.press('ArrowRight');
  const espnTab = a11y.getByRole('tab', { name: /Live ESPN scoreboard/ });
  check((await espnTab.getAttribute('aria-selected')) === 'true' && await espnTab.evaluate((el) => el === document.activeElement), 'an arrow key does not move to the next tab');
  check((await a11y.getByRole('tabpanel').getAttribute('aria-labelledby')) === 'tab-espn', 'the tab panel is not labelled by its tab');
  await a11y.getByRole('alert').filter({ hasText: 'ESPN is down' }).waitFor({ timeout: 5_000 }).catch(() => check(false, 'a scoreboard error is not announced'));
  // UX-05: the palette is a modal dialog that keeps focus and gives it back.
  const opener = a11y.getByRole('button', { name: 'Open command palette' });
  await opener.click();
  const input = a11y.getByRole('combobox', { name: /Jump to/ });
  await input.waitFor();
  for (let i = 0; i < 3; i++) await a11y.keyboard.press('Tab');
  check(await a11y.evaluate(() => !!document.activeElement?.closest('dialog[open]')), 'Tab leaves the open palette');
  await input.focus();
  await a11y.keyboard.press('ArrowDown');
  const active = await input.getAttribute('aria-activedescendant');
  check(active === 'pal-opt-1' && (await a11y.locator(`#${active}`).getAttribute('aria-selected')) === 'true', 'arrowing does not move the selected option');
  await a11y.keyboard.press('Escape');
  check(await a11y.evaluate(() => !document.querySelector('dialog[open]')), 'Escape does not close the palette');
  check(await opener.evaluate((el) => el === document.activeElement), 'closing the palette does not return focus to its opener');
  await a11y.close();

  // UX-16 and UX-19 on the calculators, at phone width: a bad price says why, and the age and
  // help-line line sits under the heading, before the tool.
  const calc = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await calc.route('**/api/backtest', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: run }));
  // UX-06: on a phone the advisor comes within three screens of the results, not 17,000px down.
  await calc.goto(`http://127.0.0.1:${PORT}/backtester`);
  await calc.getByText('Net profit (P/L)').waitFor({ timeout: 15_000 });
  const y = (t: string) => calc.getByText(t, { exact: true }).first().evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const gap = (await y('Gemini Quant Advisor')) - (await y('Net profit (P/L)'));
  check(gap < 3 * 844, `on a phone the advisor starts ${Math.round(gap)}px below the results`);
  // PROD-11: -110 at 55% is a 5.5% full-Kelly bet, so half Kelly stakes $27.50 of $1,000.
  await calc.goto(`http://127.0.0.1:${PORT}/kelly`);
  await calc.getByText('Your stake').waitFor({ timeout: 15_000 });
  check((await calc.getByText('$27.50', { exact: true }).count()) === 1, 'the Kelly page does not stake $27.50 at -110, 55%, half Kelly');
  for (const path of ['/backtester', '/odds', '/kelly', '/parlay']) {
    await calc.goto(`http://127.0.0.1:${PORT}${path}`);
    const rg = calc.locator('main p, header p').filter({ hasText: '18+ (21+ where you live)' }).first();
    await rg.waitFor({ timeout: 15_000 });
    const box = await rg.boundingBox();
    check(box && box.y + box.height < 844 * 1.5, `${path}: the age and help-line notice starts at ${box?.y}px, not near the top`);
    check((await rg.locator('a').first().evaluate((a) => getComputedStyle(a).textDecorationLine)) === 'underline', `${path}: help-line links are not underlined`);
  }
  // On /parlay now. An absurd quoted price and an empty leg each say what is wrong.
  const quoted = calc.locator('#parlay-quoted');
  await quoted.fill('1000000000000');
  const why = async (el: typeof quoted) => el.evaluate((e) => document.getElementById(e.getAttribute('aria-describedby') ?? '')?.textContent ?? '');
  check((await quoted.getAttribute('aria-invalid')) === 'true' && /±1,000,000/.test(await why(quoted)), 'an absurd quoted price is not rejected with a message');
  const leg = calc.getByRole('textbox', { name: 'Leg 1 price', exact: true });
  await leg.fill('');
  check((await why(leg)) === 'Enter a price.', 'an empty leg gives no message');
  check((await calc.getByRole('status').filter({ hasText: 'Fix the prices marked above' }).count()) === 1, 'the missing parlay result is not explained');
  await leg.fill('−110');
  check((await leg.getAttribute('aria-invalid')) === 'false', 'a typographic minus is not read as a minus');
  await calc.close();

  // UX-13 on the hero strip and the Spectrum chart.
  const home = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await home.goto(`http://127.0.0.1:${PORT}/`);
  check(await home.getByRole('img', { name: /^All \d+ records on two lanes/ }).count() === 1, 'the hero strip has no text alternative');
  await home.goto(PAGE_URL);
  await home.waitForFunction(() => /activities, from/.test(document.getElementById('chart')?.getAttribute('aria-label') ?? ''), null, { timeout: 30_000 })
    .catch(() => check(false, 'the Spectrum chart has no generated label'));
  check(await home.locator('.hdr-rg').isVisible(), 'the Spectrum page has no age and help-line line under its heading');
  await home.close();
} finally {
  await browser.close();
  server.kill();
}

if (failures.length > 0) {
  console.error(`Spectrum browser check — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('Browser check passed. Spectrum: loads clean, pins, survives reload, re-themes, places "You" and keeps its form through hover and Play, shows a "You" name as text, compares, embeds, and leaves touch scrolling alone. Backtester: a failed run clears the old result, an inverted range is never sent, totals hide the streak filter, the CSV holds every wager, the luck panel draws the fan and the season split. Kelly: half Kelly at -110, 55% stakes $27.50. Accessibility: the run is announced, the game log pages and sorts, toggles and tabs expose their state, charts have text, the palette holds focus, calculator errors say why, and the help-line line sits by each tool.');
