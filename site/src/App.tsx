import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Home from './pages/Home';
import BacktesterApp from './BacktesterApp';
import OddsConverter from './pages/OddsConverter';
import ParlayCalculator from './pages/ParlayCalculator';
import Setup from './pages/Setup';
import { DeploymentProvider, DemoBanner } from './deployment';

/**
 * Slim hub bar shared across tool pages. Hidden on the home page (which has its
 * own hero) so tools get a "← back to Edge Spectrum" affordance without a
 * duplicate brand header.
 */
function HubNav() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  return (
    <div className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#060606]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-2.5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="font-medium">
            Edge <span className="text-sky-400">Spectrum</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DeploymentProvider>
      <div className="min-h-screen bg-[#060606] text-zinc-100">
        <DemoBanner />
        <HubNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/backtester" element={<BacktesterApp />} />
          <Route path="/odds" element={<OddsConverter />} />
          <Route path="/parlay" element={<ParlayCalculator />} />
          <Route path="/setup" element={<Setup />} />
          {/* Unknown client routes fall back to the hub. */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      </DeploymentProvider>
    </BrowserRouter>
  );
}
