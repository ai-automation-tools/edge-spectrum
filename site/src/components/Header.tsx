import React from 'react';
import { Shield, TrendingUp, Trophy } from 'lucide-react';
import { MARKET_OVERROUND } from '../dataGenerator';

/** The book's hold, read straight off the model rather than asserted. */
const HOLD_PERCENT = ((MARKET_OVERROUND - 1) / MARKET_OVERROUND) * 100;

export default function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 py-4 sticky top-0 z-40 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
              Sports Betting Backtest Simulator
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full">
                Simulated Data
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Strategy emulator over 26 simulated seasons of MLB, NFL, NHL & NBA (2000-2025)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/40 border border-zinc-700/50 rounded-lg text-xs font-mono text-zinc-300">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Book Hold: {HOLD_PERCENT.toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/15 border border-sky-400/20 rounded-lg text-xs font-medium text-sky-300">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Quarter-Kelly Sizing</span>
          </div>
        </div>
      </div>
    </header>
  );
}
