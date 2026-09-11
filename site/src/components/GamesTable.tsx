import React, { useState } from 'react';
import { SimulatedBetGame } from '../types';
import { CheckCircle2, XCircle, Slash, Calendar, Info } from 'lucide-react';

interface GamesTableProps {
  games: SimulatedBetGame[];
}

export default function GamesTable({ games }: GamesTableProps) {
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'push'>('all');

  const filteredGames = games.filter((g) => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Historical Game Logs ({games.length} Matches Analyzed)</h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Deep-dive review of individual simulated wagers and scoring lines</p>
        </div>

        {/* Filters */}
        <div className="flex p-0.5 bg-zinc-950 rounded-lg border border-zinc-850 self-start sm:self-center">
          {(['all', 'win', 'loss'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all duration-150 ${
                filter === type
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 font-medium">
          No matches found matching the filter selection
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Sport</th>
                <th className="py-2.5 px-3">Matchup</th>
                <th className="py-2.5 px-3">Scoring Score</th>
                <th className="py-2.5 px-3">Bet Target Placement</th>
                <th className="py-2.5 px-3 text-right">Stake / Return</th>
                <th className="py-2.5 px-3 text-right">Net Return</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((g) => {
                const isWin = g.status === 'win';
                const isLoss = g.status === 'loss';
                return (
                  <tr
                    key={g.id}
                    className="border-b border-zinc-850/60 hover:bg-zinc-950/30 transition-colors duration-150 text-xs text-zinc-300 font-medium font-sans"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                      {g.date}
                    </td>

                    {/* Sport */}
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wide bg-zinc-950 border border-zinc-800 text-zinc-400">
                        {g.sport}
                      </span>
                    </td>

                    {/* Matchup */}
                    <td className="py-3 px-3">
                      <span className="text-zinc-100">{g.matchup}</span>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                      {g.awayScore} - {g.homeScore}
                    </td>

                    {/* Bet Placed */}
                    <td className="py-3 px-3">
                      <span className="text-zinc-200 font-mono text-[11px]">{g.betPlaced}</span>
                    </td>

                    {/* Stake / Return */}
                    <td className="py-3 px-3 text-right font-mono text-[11px]">
                      <div>${g.stake.toLocaleString()}</div>
                      <div className="text-[9px] text-zinc-500">${g.returnVal.toLocaleString()} ret</div>
                    </td>

                    {/* Net Result */}
                    <td className={`py-3 px-3 text-right font-mono font-bold text-[11px] ${
                      isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-zinc-400'
                    }`}>
                      {g.netResult > 0 ? '+' : ''}${g.netResult.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center">
                        {isWin ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold tracking-wide rounded-md uppercase flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            WIN
                          </span>
                        ) : isLoss ? (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold tracking-wide rounded-md uppercase flex items-center justify-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                            LOSS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 text-[9px] font-bold tracking-wide rounded-md uppercase flex items-center justify-center gap-1">
                            <Slash className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                            PUSH
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-1.5 p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl mt-1 text-[11px] text-zinc-400 leading-normal">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span>For memory and DOM efficiency, only the final 250 matched bets of the strategy run are rendered above. Full statistics are fully factored in the equity curve.</span>
      </div>
    </div>
  );
}
