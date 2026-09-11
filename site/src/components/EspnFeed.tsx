import React, { useState, useEffect } from 'react';
import { Strategy, SportType } from '../types';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Info, Sparkles, HelpCircle } from 'lucide-react';

interface EspnGame {
  id: string;
  date: string;
  shortName: string;
  name: string;
  status: string;
  statusDetail: string;
  homeTeam: {
    name: string;
    abbrev: string;
    logo?: string;
    score: number;
    winner: boolean;
  };
  awayTeam: {
    name: string;
    abbrev: string;
    logo?: string;
    score: number;
    winner: boolean;
  };
  odds: {
    details: string;
    overUnder: number | null;
    spread: number | null;
  };
}

interface EspnFeedProps {
  currentStrategy: Strategy;
}

export default function EspnFeed({ currentStrategy }: EspnFeedProps) {
  const [sport, setSport] = useState<SportType>(currentStrategy.sport);
  const [dateStr, setDateStr] = useState<string>(''); // YYYYMMDD formats
  const [games, setGames] = useState<EspnGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-update local sport selection when parent strategy sport changes
  useEffect(() => {
    setSport(currentStrategy.sport);
  }, [currentStrategy.sport]);

  // Format date helper to human readable
  const getHumanDate = (rawDate: string) => {
    if (!rawDate) return 'Today / Latest';
    if (rawDate.length === 8) {
      const year = rawDate.slice(0, 4);
      const month = rawDate.slice(4, 6);
      const day = rawDate.slice(6, 8);
      return new Date(`${year}-${month}-${day}`).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return rawDate;
  };

  // Helper to step date backward/forward
  const stepDate = (dayOffset: number) => {
    const defaultDate = new Date();
    if (dateStr) {
      const year = parseInt(dateStr.slice(0, 4));
      const month = parseInt(dateStr.slice(4, 6)) - 1;
      const day = parseInt(dateStr.slice(6, 8));
      defaultDate.setFullYear(year, month, day);
    }
    defaultDate.setDate(defaultDate.getDate() + dayOffset);
    
    const yyyy = defaultDate.getFullYear();
    const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
    const dd = String(defaultDate.getDate()).padStart(2, '0');
    setDateStr(`${yyyy}${mm}${dd}`);
  };

  // Fetch games from proxy
  const fetchEspnGames = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `/api/espn-scoreboard?sport=${sport}&date=${dateStr}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Response error from proxy server');
      }
      const data = await res.json();
      setGames(data.games || []);
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to ESPN Live Data feed. This might be due to offline connections or API drift.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEspnGames();
  }, [sport, dateStr]);

  // Determine favorite
  const parseFavorite = (details: string, home: string, away: string) => {
    if (!details || details === 'N/A' || details === 'EVEN') return 'none';
    const cleanDetails = details.toUpperCase();
    const homeUpper = home.toUpperCase();
    const awayUpper = away.toUpperCase();

    if (cleanDetails.includes(homeUpper)) {
      return 'home';
    }
    if (cleanDetails.includes(awayUpper)) {
      return 'away';
    }
    return 'none';
  };

  // Evaluate the strategy's outcome on this specific real game
  const evaluateRealGameBet = (game: EspnGame) => {
    const isFinished = game.status === 'STATUS_FINAL';
    if (!isFinished) return { betPlaced: 'N/A', status: 'pending', detail: 'Game has not concluded yet' };

    const fav = parseFavorite(game.odds.details, game.homeTeam.abbrev, game.awayTeam.abbrev);
    const totalScore = game.homeTeam.score + game.awayTeam.score;
    const isOverUnderSet = game.odds.overUnder !== null;

    let selectedTeam: 'home' | 'away' | 'none' = 'none';
    let label = 'No Bet Triggered';

    if (currentStrategy.betType === 'moneyline') {
      if (currentStrategy.sideSelection === 'home') {
        selectedTeam = 'home';
        label = `ML: ${game.homeTeam.abbrev}`;
      } else if (currentStrategy.sideSelection === 'away') {
        selectedTeam = 'away';
        label = `ML: ${game.awayTeam.abbrev}`;
      } else if (currentStrategy.sideSelection === 'favorites') {
        if (fav === 'home') {
          selectedTeam = 'home';
          label = `Fav ML: ${game.homeTeam.abbrev}`;
        } else if (fav === 'away') {
          selectedTeam = 'away';
          label = `Fav ML: ${game.awayTeam.abbrev}`;
        }
      } else if (currentStrategy.sideSelection === 'underdogs') {
        if (fav === 'home') {
          selectedTeam = 'away';
          label = `Dog ML: ${game.awayTeam.abbrev}`;
        } else if (fav === 'away') {
          selectedTeam = 'home';
          label = `Dog ML: ${game.homeTeam.abbrev}`;
        }
      } else if (currentStrategy.sideSelection === 'home_favorites' && fav === 'home') {
        selectedTeam = 'home';
        label = `Home Fav ML: ${game.homeTeam.abbrev}`;
      } else if (currentStrategy.sideSelection === 'away_favorites' && fav === 'away') {
        selectedTeam = 'away';
        label = `Away Fav ML: ${game.awayTeam.abbrev}`;
      } else if (currentStrategy.sideSelection === 'home_underdogs' && fav === 'away') {
        selectedTeam = 'home';
        label = `Home Dog ML: ${game.homeTeam.abbrev}`;
      } else if (currentStrategy.sideSelection === 'away_underdogs' && fav === 'home') {
        selectedTeam = 'away';
        label = `Away Dog ML: ${game.awayTeam.abbrev}`;
      }

      if (selectedTeam === 'none') {
        return { betPlaced: 'No Bet', status: 'no_bet', detail: 'Line parameters do not match strategy' };
      }

      const wonBet = (selectedTeam === 'home' && game.homeTeam.winner) || (selectedTeam === 'away' && game.awayTeam.winner);
      return {
        betPlaced: label,
        status: wonBet ? 'win' : 'loss',
        detail: wonBet ? 'Wagered winner' : 'Wagered loser'
      };
    }

    if (currentStrategy.betType === 'totals') {
      if (!isOverUnderSet) {
        return { betPlaced: 'N/A', status: 'no_bet', detail: 'No Over/Under threshold offered' };
      }
      const ou = game.odds.overUnder!;

      if (currentStrategy.sideSelection === 'over') {
        const isWin = totalScore > ou;
        const isPush = totalScore === ou;
        return {
          betPlaced: `Over ${ou}`,
          status: isPush ? 'push' : isWin ? 'win' : 'loss',
          detail: `Combined scores: ${totalScore} points`
        };
      } else if (currentStrategy.sideSelection === 'under') {
        const isWin = totalScore < ou;
        const isPush = totalScore === ou;
        return {
          betPlaced: `Under ${ou}`,
          status: isPush ? 'push' : isWin ? 'win' : 'loss',
          detail: `Combined scores: ${totalScore} points`
        };
      }
    }

    if (currentStrategy.betType === 'spread') {
      // Point Spread evaluation helper
      if (!game.odds.details || game.odds.details === 'N/A' || game.odds.details === 'EVEN') {
        return { betPlaced: 'N/A', status: 'no_bet', detail: 'No point spread details offered' };
      }
      
      const lineText = game.odds.details;
      // Spread lines usually look like "KC -3" or "PHI -7.5"
      const match = lineText.match(/(-?\d+(?:\.\d+)?)$/);
      if (!match) return { betPlaced: 'No Bet', status: 'no_bet', detail: 'Unable to parse spread value' };
      
      const spreadVal = Math.abs(parseFloat(match[1])); // size of spread, e.g. 3.5

      let betSide: 'home' | 'away' | 'none' = 'none';
      let textLabel = 'Spread Bet';

      if (currentStrategy.sideSelection === 'favorites') {
        if (fav === 'home') {
          betSide = 'home';
          textLabel = `Spread ${game.homeTeam.abbrev} -${spreadVal}`;
        } else if (fav === 'away') {
          betSide = 'away';
          textLabel = `Spread ${game.awayTeam.abbrev} -${spreadVal}`;
        }
      } else if (currentStrategy.sideSelection === 'underdogs') {
        if (fav === 'home') {
          betSide = 'away';
          textLabel = `Spread ${game.awayTeam.abbrev} +${spreadVal}`;
        } else if (fav === 'away') {
          betSide = 'home';
          textLabel = `Spread ${game.homeTeam.abbrev} +${spreadVal}`;
        }
      }

      if (betSide === 'none') {
        return { betPlaced: 'No Bet', status: 'no_bet', detail: 'Line conditions skipped spread target' };
      }

      let difference = 0;
      let wonSpread = false;
      let isPushSpread = false;

      if (betSide === 'home') {
        if (fav === 'home') {
          // Favorite covers spread if homeScore - awayScore > spreadVal
          difference = game.homeTeam.score - game.awayTeam.score;
          wonSpread = difference > spreadVal;
          isPushSpread = difference === spreadVal;
        } else {
          // Underdog covers if homeScore + spreadVal > awayScore
          difference = game.homeTeam.score - game.awayTeam.score;
          wonSpread = difference + spreadVal > 0;
          isPushSpread = difference + spreadVal === 0;
        }
      } else if (betSide === 'away') {
        if (fav === 'away') {
          // Favorite covers spread if awayScore - homeScore > spreadVal
          difference = game.awayTeam.score - game.homeTeam.score;
          wonSpread = difference > spreadVal;
          isPushSpread = difference === spreadVal;
        } else {
          // Underdog covers if awayScore + spreadVal > homeScore
          difference = game.awayTeam.score - game.homeTeam.score;
          wonSpread = difference + spreadVal > 0;
          isPushSpread = difference + spreadVal === 0;
        }
      }

      return {
        betPlaced: textLabel,
        status: isPushSpread ? 'push' : wonSpread ? 'win' : 'loss',
        detail: `Spread differential: ${difference > 0 ? '+' : ''}${difference}`
      };
    }

    return { betPlaced: 'No Bet', status: 'no_bet', detail: 'Selected strategy matches no filters' };
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Block Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-zinc-800 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time ESPN Scoreboard Feed
          </h3>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
            Undocumented public scoreboard parsing & validation against your Strategy
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => stepDate(-1)}
            className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-lg text-zinc-400 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono font-medium text-zinc-300">
            {getHumanDate(dateStr)}
          </span>

          <button
            onClick={() => stepDate(1)}
            className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-lg text-zinc-400 transition-all cursor-pointer"
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
      <div className="flex flex-wrap items-center gap-2 bg-zinc-950/40 p-1.5 rounded-xl border border-zinc-850">
        {(['NFL', 'NBA', 'MLB', 'NHL'] as SportType[]).map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
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
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
          <p className="text-xs font-mono text-zinc-400 animate-pulse">
            Querying ESPN public scoreboards...
          </p>
        </div>
      ) : error ? (
        <div className="py-12 px-6 text-center text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl leading-relaxed flex flex-col items-center gap-2">
          <Info className="w-5 h-5" />
          <span>{error}</span>
          <button 
            onClick={fetchEspnGames} 
            className="mt-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-sans text-[11px] font-semibold tracking-wide cursor-pointer"
          >
            Retry Connecting
          </button>
        </div>
      ) : games.length === 0 ? (
        <div className="py-16 text-center text-xs text-zinc-500 font-medium">
          No matches found on the ESPN feed for this date. Step calendar backwards or forwards to find schedules.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => {
            const betResult = evaluateRealGameBet(game);
            const isFinished = game.status === 'STATUS_FINAL';
            
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
                        {game.awayTeam.score}
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
                        {game.homeTeam.score}
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
                      <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] font-bold rounded uppercase">
                        No Trigger
                      </span>
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
          <strong>Live Strategy Validation</strong> translates your current multi-parameter strategy criteria to historical and contemporary schedules on ESPN directly, providing real-time forward test verification!
        </span>
      </div>
    </div>
  );
}
