import { useState, useEffect } from 'react';
import { Strategy, SportType } from '../types';
import { RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';
import { gradeBet, scoreboardDate, toScoreboardDay, type LiveGame } from '../liveGrading';

interface EspnTeam {
  name: string;
  abbrev: string;
  logo?: string;
  score: number | null;
}

interface EspnGame extends LiveGame {
  id: string;
  statusDetail: string;
  homeTeam: EspnTeam;
  awayTeam: EspnTeam;
  odds: LiveGame['odds'] & { details: string };
}

interface EspnFeedProps {
  currentStrategy: Strategy;
}

export default function EspnFeed({ currentStrategy }: EspnFeedProps) {
  const [sport, setSport] = useState<SportType>(currentStrategy.sport);
  const [dateStr, setDateStr] = useState<string>(''); // YYYYMMDD, or '' for ESPN's current board
  const [games, setGames] = useState<EspnGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0); // bumped by Retry

  // Auto-update local sport selection when parent strategy sport changes
  useEffect(() => {
    setSport(currentStrategy.sport);
  }, [currentStrategy.sport]);

  const humanDate = (raw: string) =>
    scoreboardDate(raw)?.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    }) ?? 'Today / Latest';

  const stepDate = (dayOffset: number) => {
    const d = scoreboardDate(dateStr) ?? new Date();
    d.setDate(d.getDate() + dayOffset);
    setDateStr(toScoreboardDay(d));
  };

  // The clean-up aborts the request this effect started, so a slow answer for
  // an earlier sport or day cannot land on top of a newer one.
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    fetch(`/api/espn-scoreboard?sport=${sport}&date=${dateStr}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || 'The scoreboard request failed.');
        if (!controller.signal.aborted) setGames(data?.games || []);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err?.message || 'Could not load the ESPN scoreboard.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [sport, dateStr, attempt]);

  return (
    <div className="panel p-5 flex flex-col gap-4">
      {/* Block Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-zinc-800 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ESPN scoreboard check
          </h3>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
            Finished games on ESPN's unofficial scoreboard, graded against your selection
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => stepDate(-1)}
            aria-label="Previous day"
            className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-white light:hover:text-zinc-50 rounded-lg text-zinc-400 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono font-medium text-zinc-300">
            {humanDate(dateStr)}
          </span>

          <button
            onClick={() => stepDate(1)}
            aria-label="Next day"
            className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-white light:hover:text-zinc-50 rounded-lg text-zinc-400 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDateStr('')}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[10px] uppercase font-bold text-zinc-400 font-mono rounded-lg transition-all cursor-pointer"
            title="Jump back to present matches"
          >
            Latest
          </button>
        </div>
      </div>

      {/* Internal Sub-Nav for Sports */}
      <div role="group" aria-label="Sport" className="flex flex-wrap items-center gap-2 bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-850">
        {(['NFL', 'NBA', 'MLB', 'NHL'] as SportType[]).map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            aria-pressed={sport === s}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
              sport === s
                ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {s}
          </button>
        ))}
        
        <div className="ml-auto pr-2 text-[10px] text-zinc-500 font-mono hidden sm:block">
          Linked with Strategy Focus
        </div>
      </div>

      {/* Grid or States */}
      {isLoading ? (
        <div role="status" className="py-16 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
          <p className="text-xs font-mono text-zinc-400 animate-pulse">
            Querying ESPN public scoreboards...
          </p>
        </div>
      ) : error ? (
        <div className="py-12 px-6 text-center text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl leading-relaxed flex flex-col items-center gap-2">
          <Info className="w-5 h-5" />
          <span role="alert">{error}</span>
          <button 
            onClick={() => setAttempt((n) => n + 1)}
            className="mt-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-sans text-[11px] font-semibold tracking-wide cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : games.length === 0 ? (
        <div className="py-16 text-center text-xs text-zinc-500 font-medium">
          No matches found on the ESPN feed for this date. Step calendar backwards or forwards to find schedules.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => {
            const betResult = gradeBet(currentStrategy, game);

            
            return (
              <div 
                key={game.id}
                className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-750 transition-all duration-200"
              >
                {/* Scoreboard line */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-2">
                    <span>{game.statusDetail}</span>
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] uppercase tracking-wider font-bold rounded">
                      ESPN Feed
                    </span>
                  </div>

                  {/* Team Away and Home Row */}
                  <div className="flex flex-col gap-2.5">
                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {game.awayTeam.logo ? (
                          <img 
                            src={game.awayTeam.logo} 
                            alt={game.awayTeam.abbrev} 
                            className="w-5 h-5 object-contain" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] flex items-center justify-center font-bold text-zinc-400">
                            {game.awayTeam.abbrev[0]}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-zinc-200">
                          {game.awayTeam.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ({game.awayTeam.abbrev})
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-100">
                        {game.awayTeam.score ?? '–'}
                      </span>
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {game.homeTeam.logo ? (
                          <img 
                            src={game.homeTeam.logo} 
                            alt={game.homeTeam.abbrev} 
                            className="w-5 h-5 object-contain" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] flex items-center justify-center font-bold text-zinc-400">
                            {game.homeTeam.abbrev[0]}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-zinc-200">
                          {game.homeTeam.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          ({game.homeTeam.abbrev})
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-100">
                        {game.homeTeam.score ?? '–'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Foot Vegas Lines / Strategy Validator */}
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between gap-2.5">
                  <div className="flex flex-col gap-0.5 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500">Vegas Spread:</span>
                      <span className="text-sky-400 font-bold">{game.odds.details}</span>
                    </div>
                    {game.odds.overUnder && (
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-500">O/U Line:</span>
                        <span className="text-emerald-400 font-bold">{game.odds.overUnder}</span>
                      </div>
                    )}
                  </div>

                  {/* Strategy Output Badge */}
                  <div className="text-right">
                    {betResult.status === 'no_bet' ? (
                      <span title={betResult.detail} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] font-bold rounded uppercase">
                        No Trigger
                      </span>
                    ) : betResult.status === 'not_evaluated' ? (
                      <div className="flex flex-col items-end gap-0.5 max-w-[11rem]">
                        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-bold rounded uppercase">
                          Not evaluated
                        </span>
                        <span className="text-[9px] text-zinc-500 leading-snug">{betResult.detail}</span>
                      </div>
                    ) : betResult.status === 'pending' ? (
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold rounded uppercase">
                        Scheduled
                      </span>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[9px] font-semibold text-zinc-400 font-mono">
                          {betResult.betPlaced}
                        </span>
                        {betResult.status === 'win' ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            WIN
                          </span>
                        ) : betResult.status === 'loss' ? (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold rounded uppercase flex items-center gap-1">
                            <XCircle className="w-2.5 h-2.5" />
                            LOSS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 text-[9px] font-bold rounded uppercase">
                            PUSH
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Notice about live matches */}
      <div className="flex items-center gap-1.5 p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-[10px] text-zinc-400 leading-relaxed font-sans">
        <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span>
          <strong>What is graded:</strong> your bet type, your side (home, away, favourite, underdog and the four combinations, over, under) and your line and odds ranges, against the line ESPN shows now, which may not be the closing line. Streak and rest selections and the streak filter are marked <em>not evaluated</em>: the scoreboard does not carry that history.
        </span>
      </div>
    </div>
  );
}
