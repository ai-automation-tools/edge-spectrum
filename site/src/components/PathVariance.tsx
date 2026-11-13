import { useId } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Fan, WalkForward } from '../monteCarlo';
import { useTheme } from '../theme';

const CHART = {
  dark: { band: '#38bdf8', mid: '#e4e4e7', grid: '#27272a', axis: '#71717a' },
  light: { band: '#0369a1', mid: '#27272a', grid: '#d4d4d8', axis: '#63636b' },
} as const;

const usd = (v: number) => `${Math.round(v) < 0 ? '−' : Math.round(v) > 0 ? '+' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;

/** Bootstrap fan of the run's equity paths and its in-sample / out-of-sample split (roadmap 4.2, 4.3). */
export default function PathVariance({ fan, walkForward }: { fan: Fan; walkForward: WalkForward | null }) {
  const summaryId = useId();
  const c = CHART[useTheme()];
  if (!fan.points.length) return null;
  const data = fan.points.map((p) => ({ index: p.index, outer: [p.p5, p.p95], inner: [p.p25, p.p75], p50: p.p50 }));
  const end = fan.points[fan.points.length - 1];
  const summary =
    `Over ${fan.paths.toLocaleString()} reshuffles of these ${end.index.toLocaleString()} bets, the final result lands between ${usd(end.p5)} and ${usd(end.p95)} nine times in ten, ` +
    `with a median of ${usd(end.p50)}. ${Math.round(fan.bustShare * 100)}% of the reshuffles run out of bankroll.`;

  return (
    <div className="panel p-5">
      <div className="border-b border-zinc-800 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">How much was luck</h3>
        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">The same bets in {fan.paths.toLocaleString()} random orders: the band holds 90% of them, the darker band 50%</p>
      </div>
      <div className="h-[240px] w-full" role="img" aria-label="Range of equity paths" aria-describedby={summaryId}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="index" tick={{ fill: c.axis, fontSize: 10 }} tickFormatter={(v: number) => v.toLocaleString()} />
            <YAxis tick={{ fill: c.axis, fontSize: 10 }} tickFormatter={(v: number) => usd(v)} width={72} />
            <Tooltip
              formatter={(v: unknown, name: unknown) => (Array.isArray(v) ? `${usd(v[0])} to ${usd(v[1])}` : usd(Number(v))) + (name === 'outer' ? ' (90%)' : name === 'inner' ? ' (50%)' : ' (median)')}
              labelFormatter={(l) => `After bet ${Number(l).toLocaleString()}`}
              contentStyle={{ fontSize: 11 }}
            />
            <Area dataKey="outer" stroke="none" fill={c.band} fillOpacity={0.15} isAnimationActive={false} />
            <Area dataKey="inner" stroke="none" fill={c.band} fillOpacity={0.3} isAnimationActive={false} />
            <Line dataKey="p50" stroke={c.mid} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p id={summaryId} className="mt-3 text-xs text-zinc-400 leading-relaxed">{summary}</p>

      {walkForward && (
        <div className="mt-5 border-t border-zinc-800/60 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-2">Earlier seasons vs. later seasons</p>
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="text-left font-sans text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-1.5 pr-3 font-medium">Seasons</th>
                <th className="pb-1.5 pr-3 text-right font-medium">Bets</th>
                <th className="pb-1.5 pr-3 text-right font-medium">Win rate</th>
                <th className="pb-1.5 text-right font-medium">ROI</th>
              </tr>
            </thead>
            <tbody>
              {(['inSample', 'outOfSample'] as const).map((k) => {
                const h = walkForward[k];
                return (
                  <tr key={k} className="border-t border-zinc-800/60 text-zinc-300">
                    <td className="py-1.5 pr-3 font-sans">{h.fromYear}–{h.toYear} {k === 'inSample' ? '(in sample)' : '(out of sample)'}</td>
                    <td className="py-1.5 pr-3 text-right">{h.bets.toLocaleString()}</td>
                    <td className="py-1.5 pr-3 text-right">{h.winRate.toFixed(2)}%</td>
                    <td className={`py-1.5 text-right ${h.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{h.roi > 0 ? '+' : ''}{h.roi.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            {walkForward.holds
              ? 'The ROI has the same sign in both halves.'
              : 'The ROI changes sign between the halves: what worked earlier did not carry forward, the usual mark of a pattern found by chance.'}{' '}
            A strategy chosen because it looked good on these seasons should be judged on seasons it was not chosen on.
          </p>
        </div>
      )}
    </div>
  );
}
