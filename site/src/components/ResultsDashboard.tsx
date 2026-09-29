import React from 'react';
import { BacktestSummary } from '../types';
import { TrendingUp, Award, HelpCircle, Activity, ShieldAlert, Sparkles, AlertCircle, Sigma } from 'lucide-react';
import { MIN_RELIABLE_SAMPLE } from '../stats';

interface ResultsDashboardProps {
  summary: BacktestSummary;
}

export default function ResultsDashboard({ summary }: ResultsDashboardProps) {
  const isProfit = summary.netProfit >= 0;

  // Nice metrics card formatter
  return (
    <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Net Profit Card */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Net Profit (P/L)</span>
          <div className={`p-1 rounded-md text-xs font-bold ${
            isProfit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {isProfit ? '+' : ''}{summary.roi.toFixed(1)}%
          </div>
        </div>
        <div className="mt-3.5">
          <div className={`text-xl lg:text-2xl font-bold font-mono tracking-tight ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '$' : '-$'}{Math.abs(summary.netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
            End Bankroll: ${summary.finalBankroll.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. ROI Card */}
      <div className="bg-zinc-900 border border-zinc-800/85 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Return on Risk</span>
          <TrendingUp className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="mt-3.5">
          <div className={`text-xl lg:text-2xl font-bold font-mono tracking-tight ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {summary.roi.toFixed(2)}%
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
            ROI over {summary.totalBets} matches
          </span>
        </div>
      </div>

      {/* 3. Win Rate Card */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Win Percentage</span>
          <Award className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-3.5">
          <div className="text-xl lg:text-2xl font-bold text-zinc-100 font-mono tracking-tight">
            {summary.winRate}%
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
            W/L/P: {summary.wonBets} - {summary.lostBets} - {summary.pushedBets}
          </span>
        </div>
      </div>

      {/* 4. Total Volume */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Total Matches Bet</span>
          <Activity className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-3.5">
          <div className="text-xl lg:text-2xl font-bold text-zinc-100 font-mono tracking-tight">
            {summary.totalBets}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
            Staked: ${summary.totalWagered.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 5. Max Drawdown */}
      <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Max Drawdown</span>
          <ShieldAlert className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-3.5">
          <div className="text-xl lg:text-2xl font-bold text-amber-500 font-mono tracking-tight">
            -{summary.maxDrawdownPercent}%
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
            Max Drop: ${summary.maxDrawdown.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 6. Intelligent Sizing Kelly Recommendation */}
      <div className="bg-zinc-900 border border-sky-950/40 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-sky-950/60 transition-all duration-200 relative overflow-hidden group">
        <div className="absolute right-0 top-0 bg-sky-500/5 w-16 h-16 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
        <div className="flex items-center justify-between z-10">
          <span className="text-[10px] uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            Kelly Sizing
          </span>
          <span className="cursor-help" title="Kelly Criterion calculates optimal percentage of bankroll to wager on similar parameters based on historic advantage.">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
          </span>
        </div>
        <div className="mt-3.5 z-10 flex flex-col gap-0.5">
          <div className={`text-xl lg:text-2xl font-bold font-mono tracking-tight ${summary.kellyPercentage > 0 ? 'text-sky-400' : 'text-zinc-400'}`}>
            {summary.kellyPercentage > 0 ? `${summary.kellyPercentage}%` : '0.00%'}
          </div>
          <span className="text-[10px] text-zinc-300 font-mono block leading-relaxed font-sans">
            {summary.kellyPercentage > 0 ? `Wager size suggestion` : 'No positive edge found'}
          </span>
        </div>
      </div>
    </div>
    <SignificancePanel summary={summary} />
    </div>
  );
}

/** "Is this real?" — the win rate against the rate its own prices need, with the uncertainty on it. */
function SignificancePanel({ summary }: ResultsDashboardProps) {
  const decided = summary.wonBets + summary.lostBets;
  if (decided === 0) return null;
  const small = summary.totalBets < MIN_RELIABLE_SAMPLE;
  const beatsBreakeven = summary.winRate > summary.breakevenWinRate;
  const significant = summary.pValue < 0.05;
  const pText = summary.pValue < 0.0001 ? '< 0.0001' : summary.pValue.toFixed(4);

  const verdict = !beatsBreakeven
    ? { text: 'Below breakeven — no edge over the vig', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
    : significant
      ? { text: 'Significant at the 5% level', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      : { text: 'Indistinguishable from noise', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };

  return (
    <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <Sigma className="w-4 h-4 text-sky-400" />
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Statistical Significance</span>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md border ${verdict.cls}`}>{verdict.text}</span>
        {small && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Small sample: {summary.totalBets} &lt; {MIN_RELIABLE_SAMPLE} wagers
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div>
          <div className="text-[10px] text-zinc-400 font-sans">Breakeven win rate</div>
          <div className="text-lg font-bold text-zinc-100">{summary.breakevenWinRate.toFixed(2)}%</div>
          <div className="text-[10px] text-zinc-500">needed at these prices · actual {summary.winRate.toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-400 font-sans">95% confidence interval</div>
          <div className="text-lg font-bold text-zinc-100">{summary.winRateLow.toFixed(2)}% – {summary.winRateHigh.toFixed(2)}%</div>
          <div className="text-[10px] text-zinc-500">Wilson, over {decided.toLocaleString()} decided wagers</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-400 font-sans">p-value (one-tailed)</div>
          <div className={`text-lg font-bold ${significant ? 'text-emerald-400' : 'text-zinc-100'}`}>{pText}</div>
          <div className="text-[10px] text-zinc-500">H₀: true win rate ≤ breakeven</div>
        </div>
      </div>
      <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed">
        Exact binomial test; pushes excluded. Each filter you try is another test — tune enough of them and
        one will clear 5% by chance, so treat a significant result found by searching as a hypothesis, not a finding.
      </p>
    </div>
  );
}
