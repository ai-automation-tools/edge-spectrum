import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import StrategyBuilder from './components/StrategyBuilder';
import ResultsDashboard from './components/ResultsDashboard';
import ProfitChart from './components/ProfitChart';
import GamesTable from './components/GamesTable';
import AiAdvisor from './components/AiAdvisor';
import EspnFeed from './components/EspnFeed';
import { Strategy, BacktestResponse, StrategyTemplate } from './types';
import { AlertCircle, RotateCcw, LineChart, Table, Info, BookOpen } from 'lucide-react';

// Keystroke-to-request grace period for the auto-rerun effect.
const RERUN_DEBOUNCE_MS = 300;

export default function App() {
  // Initial starting strategy parameters
  const [strategy, setStrategy] = useState<Strategy>({
    sport: 'NFL',
    startYear: 2020,
    endYear: 2024,
    betType: 'moneyline',
    sideSelection: 'favorites',
    streakFilter: 'any',
    streakTarget: 'bet_team',
    starPlayerFilter: 'any',
    unitSize: 100,
    startingBankroll: 10000
  });

  const [result, setResult] = useState<BacktestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'espn'>('analytics');

  // The one in-flight backtest. A newer run aborts the older one so a slow
  // response can never land after — and overwrite — a fresher one.
  const inFlight = useRef<AbortController | null>(null);

  // Trigger backtest. Stable identity (no captured state) so the debounce
  // effect below can hold on to it without re-arming its timer every render.
  const runBacktest = useCallback(async (targetStrategy: Strategy) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetStrategy),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const details: string[] = Array.isArray(body?.details) ? body.details : [];
        throw new Error(
          details.length
            ? `Invalid strategy: ${details.join('; ')}`
            : body?.error || 'Simulation server returned an error response.',
        );
      }

      const data: BacktestResponse = await response.json();
      // Superseded while we were parsing — the newer run owns the UI now.
      if (controller.signal.aborted) return;
      setResult(data);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      console.error(err);
      setError(err?.message || 'Error executing backtest. Please retry.');
    } finally {
      // Leave the spinner up for whichever run superseded us.
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, []);

  // Abort whatever is still running when the backtester unmounts.
  useEffect(() => () => inFlight.current?.abort(), []);

  // Run backtests automatically whenever any core parameter or filter changes.
  // Debounced, because `unitSize` / `startingBankroll` are free-text number
  // inputs that fire this on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => runBacktest(strategy), RERUN_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [
    strategy.sport,
    strategy.startYear,
    strategy.endYear,
    strategy.betType,
    strategy.sideSelection,
    strategy.streakFilter,
    strategy.streakTarget,
    strategy.starPlayerFilter,
    strategy.unitSize,
    strategy.startingBankroll,
    strategy.oddsMin,
    strategy.oddsMax,
    strategy.spreadMin,
    strategy.spreadMax,
    strategy.totalMin,
    strategy.totalMax,
  ]);

  // Accept recommended templates directly from the AI Advisor
  const handleApplyTemplate = (tmpl: StrategyTemplate) => {
    const updatedStrategy: Strategy = {
      ...strategy,
      sport: tmpl.sport,
      betType: tmpl.betType,
      sideSelection: tmpl.sideSelection,
      streakFilter: tmpl.streakFilter,
      streakTarget: tmpl.streakTarget,
      starPlayerFilter: tmpl.starPlayerFilter,
      oddsMin: tmpl.oddsMin,
      oddsMax: tmpl.oddsMax,
      spreadMin: tmpl.spreadMin,
      spreadMax: tmpl.spreadMax,
      totalMin: tmpl.totalMin,
      totalMax: tmpl.totalMax,
    };
    
    setStrategy(updatedStrategy);
  };

  return (
    <div className="min-h-screen bg-[#060606] text-zinc-100 font-sans flex flex-col">
      {/* Navbar Console */}
      <Header />

      {/* Main Dashboard Space */}
      <main className="flex-1 px-4 py-6 md:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6 animate-fadeIn">
        
        {/* Error notification bar if API is down */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Segment: Strategy Builder Grid */}
        <div>
          <StrategyBuilder
            currentStrategy={strategy}
            onChange={setStrategy}
            onRunBacktest={(latestStrat) => runBacktest(latestStrat)}
            isLoading={isLoading}
          />
        </div>

        {/* Middle Segment: KPI Metrics Panel */}
        {result?.summary && (
          <div className="transition-all duration-300">
            <ResultsDashboard summary={result.summary} />
          </div>
        )}

        {/* Lower Grid: Charts / Logs & AI Space */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start mt-1">
          
          {/* Main Visual Workspace Area (Spans 3 Columns on desktop) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Workspace tabs navigator */}
            <div className="flex border-b border-zinc-900 pb-px">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'border-sky-500 text-sky-400 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📊 Backtest Analytics
              </button>
              <button
                onClick={() => setActiveTab('espn')}
                className={`py-2 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'espn'
                    ? 'border-sky-500 text-sky-400 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📡 Live ESPN Scoreboard
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] uppercase tracking-wider font-mono rounded-full font-bold">
                  Live
                </span>
              </button>
            </div>

            {activeTab === 'analytics' ? (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <ProfitChart data={result?.profitHistory || []} />
                
                {/* Detailed Table */}
                {result?.games && (
                  <GamesTable games={result.games} />
                )}
              </div>
            ) : (
              <div className="animate-fadeIn">
                <EspnFeed currentStrategy={strategy} />
              </div>
            )}
          </div>

          {/* AI Advisor Space (Spans 2 Columns on desktop) */}
          <AiAdvisor
            currentStrategy={strategy}
            onApplyTemplate={handleApplyTemplate}
          />

        </div>

        {/* Knowledge documentation footnotes */}
        <footer className="border-t border-zinc-900 mt-12 pt-6 pb-6 text-center text-zinc-500 text-[11px] leading-relaxed">
          <div className="flex justify-center items-center gap-1.5 text-sky-400 hover:text-sky-300 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-semibold">About this simulation</span>
          </div>
          <p>
            Games are <strong>simulated</strong>, not historical. Team strength follows era ratings that
            approximate real 2000&ndash;2025 standings, and every line is priced off the same distribution the
            scores are drawn from &mdash; so the book&rsquo;s hold is the only edge in the data. Strategies that
            look profitable here are noise, which is rather the point.
          </p>
          <p className="mt-1">
            Sports Betting Backtest Simulator © {new Date().getFullYear()} • Custom Analytical Sandbox Engine. Always gamble responsibly.
          </p>
        </footer>
      </main>
    </div>
  );
}
