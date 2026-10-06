import React, { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { BacktestSummary } from '../types';
import { TrendingUp, Award, HelpCircle, Activity, ShieldAlert, Sparkles, AlertCircle, Sigma, Wallet } from 'lucide-react';
import { MIN_RELIABLE_SAMPLE } from '../stats';
import { Card, alpha } from './ui';

interface ResultsDashboardProps {
  summary: BacktestSummary;
}

/** Tweens a number to its new value; renders the exact value immediately under reduced motion. */
function useCountUp(value: number, duration = 0.7) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (reduced) { setShown(value); prev.current = value; return; }
    const controls = animate(prev.current, value, { duration, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setShown(v) });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration, reduced]);
  return shown;
}

const money = (v: number) => `${v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Metric({ label, accent, icon, value, sub, badge, title }: {
  label: string; accent: string; icon?: React.ReactNode; value: React.ReactNode; sub: React.ReactNode; badge?: React.ReactNode; title?: string;
}) {
  return (
    <Card accent={accent} className="flex flex-col justify-between p-4" title={title}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[.1em] text-zinc-500">{label}</span>
        {badge ?? icon}
      </div>
      <div className="mt-3.5">
        <div className="font-mono text-xl font-medium tracking-[-0.01em] lg:text-2xl" style={{ color: accent }}>{value}</div>
        <span className="mt-1 block font-mono text-[10.5px] text-zinc-500">{sub}</span>
      </div>
    </Card>
  );
}

export default function ResultsDashboard({ summary }: ResultsDashboardProps) {
  const isProfit = summary.netProfit >= 0;
  const pnlColor = isProfit ? 'var(--a-emerald)' : 'var(--a-rose)';
  const net = useCountUp(summary.netProfit);
  const roi = useCountUp(summary.roi);
  const win = useCountUp(summary.winRate);
  const bets = useCountUp(summary.totalBets, 0.5);
  const dd = useCountUp(summary.maxDrawdownPercent);
  const kelly = useCountUp(summary.kellyPercentage);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-6">
        <Metric
          label="Net profit (P/L)" accent={pnlColor}
          badge={<span className="rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-medium" style={{ color: pnlColor, borderColor: alpha(pnlColor, 25), background: alpha(pnlColor, 8) }}>{isProfit ? '+' : ''}{roi.toFixed(1)}%</span>}
          value={money(net)}
          sub={<>End bankroll ${summary.finalBankroll.toLocaleString()}</>}
        />
        <Metric label="Return on risk" accent={pnlColor} icon={<TrendingUp className="h-4 w-4 text-zinc-500" />} value={`${roi.toFixed(2)}%`} sub={<>ROI over {summary.totalBets} matches</>} />
        <Metric label="Win percentage" accent="var(--fg)" icon={<Award className="h-4 w-4 text-sky-400" />} value={`${win.toFixed(1)}%`} sub={<>W/L/P {summary.wonBets} - {summary.lostBets} - {summary.pushedBets}</>} />
        <Metric label="Matches bet" accent="var(--fg)" icon={<Activity className="h-4 w-4 text-sky-400" />} value={Math.round(bets).toLocaleString()} sub={<>Staked ${summary.totalWagered.toLocaleString()}</>} />
        <Metric label="Max drawdown" accent="var(--a-amber)" icon={<ShieldAlert className="h-4 w-4 text-amber-400" />} value={`-${dd.toFixed(1)}%`} sub={<>Max drop ${summary.maxDrawdown.toLocaleString()}</>} />
        <Metric
          label="Kelly sizing" accent={summary.kellyPercentage > 0 ? 'var(--a-sky)' : 'var(--a-zinc)'}
          icon={<span className="cursor-help" title="Kelly Criterion calculates the optimal percentage of bankroll to wager on similar parameters based on the historic advantage."><HelpCircle className="h-3.5 w-3.5 text-zinc-500" /></span>}
          value={summary.kellyPercentage > 0 ? `${kelly.toFixed(2)}%` : '0.00%'}
          sub={<span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-sky-400" />{summary.kellyPercentage > 0 ? 'Wager size suggestion' : 'No positive edge found'}</span>}
        />
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
    ? { text: 'Below breakeven — no edge over the vig', c: 'var(--a-rose)' }
    : significant
      ? { text: 'Significant at the 5% level', c: 'var(--a-emerald)' }
      : { text: 'Indistinguishable from noise', c: 'var(--a-amber)' };

  return (
    <Card accent={verdict.c} still className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Sigma className="h-4 w-4 text-sky-400" />
        <span className="font-mono text-[10.5px] font-medium uppercase tracking-[.1em] text-zinc-500">Statistical significance</span>
        <span className="ml-auto rounded-md border px-2 py-0.5 text-[11px] font-medium" style={{ color: verdict.c, borderColor: alpha(verdict.c, 25), background: alpha(verdict.c, 8) }}>{verdict.text}</span>
        {small && (
          <span className="flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            <AlertCircle className="h-3 w-3" /> Small sample: {summary.totalBets} &lt; {MIN_RELIABLE_SAMPLE} wagers
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 font-mono sm:grid-cols-3">
        {[
          { l: 'Breakeven win rate', v: `${summary.breakevenWinRate.toFixed(2)}%`, s: `needed at these prices · actual ${summary.winRate.toFixed(2)}%`, c: 'var(--fg)' },
          { l: '95% confidence interval', v: `${summary.winRateLow.toFixed(2)}% – ${summary.winRateHigh.toFixed(2)}%`, s: `Wilson, over ${decided.toLocaleString()} decided wagers`, c: 'var(--fg)' },
          { l: 'p-value (one-tailed)', v: pText, s: 'H₀: true win rate ≤ breakeven', c: significant ? 'var(--a-emerald)' : 'var(--fg)' },
        ].map((m) => (
          <div key={m.l} className="rounded-lg border border-zinc-800/60 bg-(--bg)/50 px-3 py-2.5">
            <div className="font-sans text-[10.5px] text-zinc-500">{m.l}</div>
            <div className="text-lg font-medium" style={{ color: m.c }}>{m.v}</div>
            <div className="text-[10.5px] text-zinc-600">{m.s}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-zinc-500">
        <Wallet className="mt-0.5 h-3 w-3 flex-none text-zinc-600" />
        Exact binomial test; pushes excluded. Each filter you try is another test — tune enough of them and
        one will clear 5% by chance, so treat a significant result found by searching as a hypothesis, not a finding.
      </p>
    </Card>
  );
}
