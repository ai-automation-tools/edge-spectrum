import React from 'react';
import { Shield, TrendingUp, FlaskConical } from 'lucide-react';
import { MARKET_OVERROUND } from '../dataGenerator';
import { MIN_SEASON, MAX_SEASON } from '../strategyBounds';
import { Eyebrow, Reveal } from './ui';

/** The book's hold, read straight off the model rather than asserted. */
const HOLD_PERCENT = ((MARKET_OVERROUND - 1) / MARKET_OVERROUND) * 100;

/** The simulator's page head. The hub topbar is the sticky chrome now, so this sits in flow. */
export default function Header() {
  return (
    <Reveal>
      <header className="mx-auto flex max-w-7xl flex-col gap-4 px-6 pb-2 pt-10 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Eyebrow accent="emerald"><b>Simulator</b> · simulated data · {MIN_SEASON}–{MAX_SEASON}</Eyebrow>
          <h1 className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-zinc-100 md:text-[36px]">
            Sports Betting <span style={{ color: '#34d399' }}>Backtest</span> Simulator
          </h1>
          <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-zinc-400">
            Strategy emulator over {MAX_SEASON - MIN_SEASON + 1} simulated seasons of MLB, NFL, NHL &amp; NBA. Every line is priced
            from the distribution the scores are drawn from, so the hold is the only edge in the data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill border-zinc-800/80 bg-zinc-900/40" title="Read from MARKET_OVERROUND in the generator">
            <Shield className="h-3.5 w-3.5 text-sky-400" /> Book hold {HOLD_PERCENT.toFixed(2)}%
          </span>
          <span className="pill border-sky-500/20 bg-sky-500/10 text-sky-300">
            <TrendingUp className="h-3.5 w-3.5 text-sky-400" /> Quarter-Kelly sizing
          </span>
          <span className="pill border-amber-500/25 bg-amber-500/10 text-amber-300">
            <FlaskConical className="h-3.5 w-3.5" /> Synthetic games
          </span>
        </div>
      </header>
    </Reveal>
  );
}
