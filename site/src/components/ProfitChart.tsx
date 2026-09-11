import React, { useId } from 'react';
import { ProfitHistoryPoint } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProfitChartProps {
  data: ProfitHistoryPoint[];
}

export default function ProfitChart({ data }: ProfitChartProps) {
  const gradientId = useId();

  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-[350px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-xs">Execute a backtest to populate the cumulative profit curve map</p>
        </div>
      </div>
    );
  }

  // Check if profit is trending positive or negative
  const isHealthy = data[data.length - 1]?.cumulativeProfit >= 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-3 mb-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Portfolio Equity Curve</h3>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Chronological bankroll development over simulated match cycles</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm"></span>
            <span className="text-zinc-300">Net Profit Line</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isHealthy ? '#10b981' : '#f43f5e'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isHealthy ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
            <XAxis
              dataKey="index"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as ProfitHistoryPoint;
                  return (
                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl font-sans text-xs">
                      <div className="text-[10px] uppercase text-sky-400 font-bold font-mono">Bet Record #{p.index}</div>
                      <div className="font-semibold text-zinc-200 mt-1">{p.matchup}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{p.date}</div>
                      <div className="border-t border-zinc-850 my-2 pt-1.5 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-zinc-400 leading-none">Scoring Plunge:</span>
                          <span className={`font-mono font-bold leading-none ${p.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {p.netProfit >= 0 ? '+' : ''}${p.netProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-zinc-400 leading-none">Cumulative:</span>
                          <span className={`font-mono font-bold leading-none ${p.cumulativeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {p.cumulativeProfit >= 0 ? '+' : ''}${p.cumulativeProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-zinc-400 leading-none">Bankroll:</span>
                          <span className="font-mono text-zinc-200 font-bold leading-none">
                            ${p.currentBankroll.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              stroke={isHealthy ? '#10b981' : '#f43f5e'}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
