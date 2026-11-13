/**
 * An opt-in second line source for capture-lines.ts (audit INT-06): The Odds API, read with the
 * self-hoster's own key. It produces the same game objects parseEspnScoreboard does, so the
 * collector's phase rule, file layout and record shape stay one code path.
 *
 * Terms (read 2026-11-12, the-odds-api.com/terms-and-conditions.html): storing the data and using
 * it in your own analysis is allowed; redistributing it as a raw data product (an API, a feed,
 * downloadable files) is not. The archive is the user's own and stays local, as the ESPN one does.
 *
 * Cost per sport per run: 3 credits for odds (h2h, spreads, totals at one bookmaker) and 2 for
 * scores. Every 3 hours for four sports is about 4,800 credits a month; the free plan has 500.
 */

export const ODDS_API_SPORTS: Record<string, string> = {
  NFL: 'americanfootball_nfl',
  NBA: 'basketball_nba',
  MLB: 'baseball_mlb',
  NHL: 'icehockey_nhl',
};

/** The US scoreboard day of a start time, as ESPN files games (Eastern). */
const easternDay = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(iso));
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * Odds and scores responses -> one board per Eastern day, each game shaped like ESPN's parsed game.
 * A game only in `scores` (finished, or started and off the odds board) keeps its score and no odds.
 */
export function parseOddsApi(odds: any[], scores: any[], book: string, now: Date): { date: string; games: any[] }[] {
  const byId = new Map<string, { event: any; odds?: any; score?: any }>();
  for (const e of Array.isArray(odds) ? odds : []) byId.set(e.id, { event: e, odds: e });
  for (const s of Array.isArray(scores) ? scores : []) byId.set(s.id, { ...(byId.get(s.id) ?? { event: s }), score: s });

  const boards = new Map<string, any[]>();
  for (const [id, { event, odds: o, score: s }] of byId) {
    if (!event.commence_time || !Number.isFinite(Date.parse(event.commence_time))) continue;
    const home = event.home_team, away = event.away_team;
    const points = (team: string) => num(s?.scores?.find((x: any) => x.name === team)?.score) ?? 0;
    const bm = o?.bookmakers?.find((b: any) => b.key === book);
    const market = (key: string) => bm?.markets?.find((m: any) => m.key === key)?.outcomes ?? [];
    const out = (key: string, name: string) => market(key).find((x: any) => x.name === name);
    const state = s?.completed ? 'post' : Date.parse(event.commence_time) <= now.getTime() ? 'in' : 'pre';
    const game = {
      id,
      date: event.commence_time,
      state,
      homeTeam: { name: home, score: points(home) },
      awayTeam: { name: away, score: points(away) },
      odds: {
        provider: bm?.title ?? null,
        spread: num(out('spreads', home)?.point),
        spreadOdds: { home: num(out('spreads', home)?.price), away: num(out('spreads', away)?.price) },
        overUnder: num(out('totals', 'Over')?.point),
        moneyline: { home: num(out('h2h', home)?.price), away: num(out('h2h', away)?.price) },
      },
    };
    const day = easternDay(event.commence_time);
    boards.set(day, [...(boards.get(day) ?? []), game]);
  }
  return [...boards].sort(([a], [b]) => a.localeCompare(b)).map(([date, games]) => ({ date, games }));
}

/** Both calls for one sport. The key never appears in an error message. */
export async function fetchOddsApi(sport: string, key: string, book: string, now = new Date(), timeoutMs = 15000) {
  const path = ODDS_API_SPORTS[sport];
  if (!path) throw new Error(`The Odds API: no sport key for ${sport}`);
  const get = async (endpoint: string) => {
    const res = await fetch(`https://api.the-odds-api.com/v4/sports/${path}/${endpoint}&apiKey=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`The Odds API answered ${res.status} for ${sport} ${endpoint.split('?')[0]}`);
    return res.json();
  };
  const [odds, scores] = await Promise.all([
    get(`odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=${encodeURIComponent(book)}`),
    get('scores?daysFrom=1'),
  ]);
  return parseOddsApi(odds, scores, book, now);
}
