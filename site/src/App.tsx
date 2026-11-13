import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, Routes, Route, useLocation } from 'react-router-dom';
import { LazyMotion } from 'motion/react';
import Home from './pages/Home';
import Topbar from './components/Topbar';
import CommandPalette from './components/CommandPalette';
import SiteFooter from './components/SiteFooter';
import { DeploymentProvider, SourceBar } from './deployment';
import { TOOLS } from './tools';

// Motion's animation features arrive as their own chunk (motion's documented async LazyMotion).
const loadMotionFeatures = () => import('./motionFeatures').then((m) => m.default);

// Each tool is its own chunk: the hub page should not download the chart and
// markdown libraries only the backtester uses.
const BacktesterApp = lazy(() => import('./BacktesterApp'));
const OddsConverter = lazy(() => import('./pages/OddsConverter'));
const ParlayCalculator = lazy(() => import('./pages/ParlayCalculator'));
const KellyCalculator = lazy(() => import('./pages/KellyCalculator'));
const Setup = lazy(() => import('./pages/Setup'));

const SITE = 'Edge Spectrum';
const HOME_DESCRIPTION = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
/**
 * Routes the SPA serves. `vercel.json` (rewrites), `server.ts` (CLIENT_ROUTES)
 * and `public/sitemap.xml` each list the same paths: change them together.
 */
const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': { title: SITE, description: HOME_DESCRIPTION },
  '/setup': { title: `Your own site · ${SITE}`, description: 'Deploy your own Edge Spectrum: every tool, plus live AI advice on your own account.' },
  ...Object.fromEntries(
    TOOLS.filter((t) => t.kind === 'route').map((t) => [t.href, { title: `${t.title} · ${SITE}`, description: t.blurb }]),
  ),
};

/**
 * Per-route title and description, and focus on the new page's heading after
 * a client-side navigation so keyboard and screen-reader users land on it.
 * Rendered inside the Suspense boundary, so it runs once the page has mounted.
 */
function RouteMeta() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const meta = PAGE_META[pathname.replace(/\/+$/, '') || '/'];
    document.title = meta?.title ?? `Page not found · ${SITE}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta?.description ?? HOME_DESCRIPTION);
    if (first.current) { first.current = false; return; }
    const heading = document.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);
  return (
    <>
      <main className="relative z-[1] mx-auto max-w-[1120px] px-5 py-20">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100 outline-none">Page not found</h1>
        <p className="mt-4 text-base text-zinc-400">Nothing lives at this address. The tools are here:</p>
        <ul className="mt-5 flex flex-col gap-2 text-[15px]">
          {TOOLS.map((t) => (
            <li key={t.slug}>
              {t.kind === 'route'
                ? <Link to={t.href} className="text-sky-400 underline hover:text-sky-300">{t.title}</Link>
                : <a href={t.href} className="text-sky-400 underline hover:text-sky-300">{t.title}</a>}
            </li>
          ))}
          <li><Link to="/" className="text-sky-400 underline hover:text-sky-300">Home</Link></li>
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}

/** A render error in one page must not blank the whole app (there was no boundary at all). */
class ErrorBoundary extends React.Component<{ children: React.ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error(error); }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main role="alert" className="relative z-[1] mx-auto max-w-[1120px] px-5 py-20">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-100">This page hit an error</h1>
        <p className="mt-4 text-base text-zinc-400">
          Something on {this.props.resetKey} failed to display. Reloading usually fixes it; the other tools still work.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">
          Reload
        </button>
      </main>
    );
  }
}

function Shell() {
  const [pal, setPal] = useState(false);
  const openPal = useCallback(() => setPal(true), []);
  const closePal = useCallback(() => setPal(false), []);
  const { pathname } = useLocation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((p) => !p); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="min-h-screen text-zinc-100">
      {/* Past the source bar and the topbar to the page (audit UX-08). It focuses whichever `main` the route rendered, so no page needs an id. */}
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          const main = document.querySelector('main');
          if (!main) return;
          e.preventDefault();
          main.setAttribute('tabindex', '-1');
          main.focus();
        }}
      >
        Skip to content
      </a>
      {/* The org source bar sits above every other piece of chrome, in flow, and scrolls away under the sticky topbar. */}
      <SourceBar />
      <Topbar onPalette={openPal} />
      <ErrorBoundary resetKey={pathname}>
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/backtester" element={<BacktesterApp />} />
            <Route path="/odds" element={<OddsConverter />} />
            <Route path="/parlay" element={<ParlayCalculator />} />
            <Route path="/kelly" element={<KellyCalculator />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <RouteMeta />
        </Suspense>
      </ErrorBoundary>
      <CommandPalette open={pal} onClose={closePal} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DeploymentProvider>
        {/* `m` components plus this feature set, not `motion`: half the animation code for the one fade the pages use. */}
        <LazyMotion features={loadMotionFeatures} strict>
          <Shell />
        </LazyMotion>
      </DeploymentProvider>
    </BrowserRouter>
  );
}
