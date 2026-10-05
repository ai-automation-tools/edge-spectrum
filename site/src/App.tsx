import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BacktesterApp from './BacktesterApp';
import OddsConverter from './pages/OddsConverter';
import ParlayCalculator from './pages/ParlayCalculator';
import Setup from './pages/Setup';
import Topbar from './components/Topbar';
import CommandPalette from './components/CommandPalette';
import { DeploymentProvider, SourceBar } from './deployment';

function Shell() {
  const [pal, setPal] = useState(false);
  const openPal = useCallback(() => setPal(true), []);
  const closePal = useCallback(() => setPal(false), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((p) => !p); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="min-h-screen text-zinc-100">
      {/* The org source bar sits above every other piece of chrome, in flow, and scrolls away under the sticky topbar. */}
      <SourceBar />
      <Topbar onPalette={openPal} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backtester" element={<BacktesterApp />} />
        <Route path="/odds" element={<OddsConverter />} />
        <Route path="/parlay" element={<ParlayCalculator />} />
        <Route path="/setup" element={<Setup />} />
        {/* Unknown client routes fall back to the hub. */}
        <Route path="*" element={<Home />} />
      </Routes>
      <CommandPalette open={pal} onClose={closePal} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DeploymentProvider>
        <Shell />
      </DeploymentProvider>
    </BrowserRouter>
  );
}
