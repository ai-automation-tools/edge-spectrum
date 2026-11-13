import { useEffect, useState } from 'react';
import { SimulatedBetGame } from '../types';
import { CheckCircle2, XCircle, Slash, Info } from 'lucide-react';

interface GamesTableProps {
  /** The truncated tail of the ledger — `gamesPreview` from the API. */
  games: SimulatedBetGame[];
  /** Every wager the run placed, so the table can say what it is not showing. */
  totalGames: number;
  /** The cap the engine applied to `games`. */
  previewLimit: number;
}

/** Rows per page: 250 at once made the page 17,000px tall (audit UX-06). */
export const PAGE_SIZE = 25;

type SortKey = 'date' | 'net' | 'status';
const SORT_LABEL: Record<SortKey, string> = { date: 'Date', net: 'Net Return', status: 'Status' };
const STATUS_RANK = { win: 0, push: 1, loss: 2 } as const;
const compare: Record<SortKey, (a: SimulatedBetGame, b: SimulatedBetGame) => number> = {
  date: (a, b) => a.date.localeCompare(b.date),
  net: (a, b) => a.netResult - b.netResult,
  status: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
};

export default function GamesTable({ games, totalGames, previewLimit }: GamesTableProps) {
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'push'>('all');
  // Newest first by default; the ledger arrives oldest first.
  const [sort, setSort] = useState<{ key: SortKey; dir: 'ascending' | 'descending' }>({ key: 'date', dir: 'descending' });
  const [page, setPage] = useState(0);
  // A new run, filter or order starts from the first page.
  useEffect(() => setPage(0), [games, filter, sort]);

  const filteredGames = games
    .filter((g) => filter === 'all' || g.status === filter)
    .sort((a, b) => (sort.dir === 'ascending' ? 1 : -1) * compare[sort.key](a, b));
  const pages = Math.max(1, Math.ceil(filteredGames.length / PAGE_SIZE));
  const shown = filteredGames.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const sortBy = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'descending' ? 'ascending' : 'descending' }));
  const th = (key: SortKey, align = '') => (
    <th className={`py-1 px-1 ${align}`} aria-sort={sort.key === key ? sort.dir : 'none'}>
      <button type="button" onClick={() => sortBy(key)} className="inline-flex items-center gap-1 rounded px-2 py-1.5 uppercase tracking-wider hover:text-zinc-200">
        {SORT_LABEL[key]}
        <span aria-hidden="true">{sort.key === key ? (sort.dir === 'ascending' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );

  const truncated = totalGames > games.length;

  return (
    <div className="panel p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            Historical Game Logs (
            {truncated
              ? `Last ${games.length.toLocaleString()} of ${totalGames.toLocaleString()} Wagers`
              : `${totalGames.toLocaleString()} Wagers Analyzed`}
            )
          </h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Deep-dive review of individual simulated wagers and scoring lines</p>
        </div>

        {/* Filters */}
        <div role="group" aria-label="Show" className="flex p-0.5 bg-(--bg-2) rounded-lg border border-zinc-800/70 self-start sm:self-center">
          {(['all', 'win', 'loss', 'push'] as const).map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={filter === type}
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
                {th('date')}
                <th className="py-2.5 px-3">Sport</th>
                <th className="py-2.5 px-3">Matchup</th>
                <th className="py-2.5 px-3">Scoring Score</th>
                <th className="py-2.5 px-3">Bet Target Placement</th>
                <th className="py-2.5 px-3 text-right">Stake / Return</th>
                {th('net', 'text-right')}
                {th('status', 'text-center')}
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => {
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
      {pages > 1 && (
        <nav aria-label="Game log pages" className="flex items-center justify-between gap-3 text-[11px] text-zinc-400">
          <span>
            Rows {(page * PAGE_SIZE + 1).toLocaleString()}–{Math.min((page + 1) * PAGE_SIZE, filteredGames.length).toLocaleString()} of {filteredGames.length.toLocaleString()}
          </span>
          <span className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page === 0} className="rounded-md border border-zinc-800 px-3 py-1.5 font-medium text-zinc-300 hover:border-zinc-700 disabled:opacity-40">Previous</button>
            <span className="font-mono">{page + 1} / {pages}</span>
            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pages - 1} className="rounded-md border border-zinc-800 px-3 py-1.5 font-medium text-zinc-300 hover:border-zinc-700 disabled:opacity-40">Next</button>
          </span>
        </nav>
      )}
      <div className="flex items-center gap-1.5 p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl mt-1 text-[11px] text-zinc-400 leading-normal">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span>
          {truncated ? (
            <>
              For payload and DOM efficiency the engine returns only the final{' '}
              {previewLimit.toLocaleString()} of this run&rsquo;s {totalGames.toLocaleString()} matched bets.
              The summary metrics and the equity curve are computed over all {totalGames.toLocaleString()}.
            </>
          ) : (
            <>
              All {totalGames.toLocaleString()} matched bets from this run are shown above &mdash; the run came in
              under the {previewLimit.toLocaleString()}-wager preview cap.
            </>
          )}
        </span>
      </div>
    </div>
  );
}
