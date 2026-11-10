/**
 * Server-side proxy for ESPN's public scoreboard API. Runs server-side to
 * avoid browser CORS restrictions. Shared by the local Express dev server
 * (`server.ts`) and the Vercel serverless function (`api/espn-scoreboard.ts`).
 */

interface EspnScoreboardResult {
  sport: string;
  date: string;
  games: any[];
}

/** Map our sport code to ESPN's {sport, league} path segments. */
function espnPath(sport: string): { espnSport: string; espnLeague: string } {
  switch (sport) {
    case 'NBA':
      return { espnSport: 'basketball', espnLeague: 'nba' };
    case 'MLB':
      return { espnSport: 'baseball', espnLeague: 'mlb' };
    case 'NHL':
      return { espnSport: 'hockey', espnLeague: 'nhl' };
    default:
      return { espnSport: 'football', espnLeague: 'nfl' };
  }
}

export async function fetchEspnScoreboard(
  sportRaw: string,
  dateInput = '',
): Promise<EspnScoreboardResult> {
  const sport = (sportRaw || 'NFL').toUpperCase();
  const { espnSport, espnLeague } = espnPath(sport);

  let url = `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/${espnLeague}/scoreboard?limit=100`;
  if (dateInput) {
    // Only YYYYMMDD or YYYYMMDD-YYYYMMDD reaches ESPN: anything else could add
    // its own query parameters and mint unlimited cache-key variants.
    if (!/^\d{8}(-\d{8})?$/.test(dateInput)) {
      throw new Error('Invalid date: expected YYYYMMDD or YYYYMMDD-YYYYMMDD');
    }
    url += `&dates=${dateInput}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ESPN API returned status ${response.status}`);
  }
  return parseEspnScoreboard(await response.json(), sport, dateInput);
}

/** A number from ESPN's odds strings ("-110", "+670", "o222.5", "EVEN"), or null. */
function num(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  if (v.toUpperCase() === 'EVEN') return 100;
  const n = parseFloat(v.replace(/^[ou]/i, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses one scoreboard response. Split from the fetch so the line collector
 * (scripts/capture-lines.ts) and its offline check read ESPN the same way the
 * page does. ESPN's `close` odds are the book's current number until the game
 * starts; `open` is the book's opener.
 */
export function parseEspnScoreboard(data: any, sport: string, dateInput = ''): EspnScoreboardResult {
  const games = (data.events || []).map((event: any) => {
    const comp = event.competitions?.[0] || {};
    const competitors = comp.competitors || [];
    const homeTeam = competitors.find((c: any) => c.homeAway === 'home');
    const awayTeam = competitors.find((c: any) => c.homeAway === 'away');
    const oddsObj = comp.odds?.[0] || {};

    return {
      id: event.id,
      date: event.date,
      shortName:
        event.shortName ||
        `${awayTeam?.team?.abbreviation} @ ${homeTeam?.team?.abbreviation}`,
      name: event.name,
      status: event.status?.type?.name, // e.g. "STATUS_FINAL", "STATUS_IN_PROGRESS", "STATUS_SCHEDULED"
      statusDetail: event.status?.type?.detail || 'Scheduled',
      homeTeam: {
        name: homeTeam?.team?.displayName || 'Home Team',
        abbrev: homeTeam?.team?.abbreviation || 'HOME',
        logo: homeTeam?.team?.logo,
        score: parseInt(homeTeam?.score || '0'),
        winner: homeTeam?.winner || false,
      },
      awayTeam: {
        name: awayTeam?.team?.displayName || 'Away Team',
        abbrev: awayTeam?.team?.abbreviation || 'AWAY',
        logo: awayTeam?.team?.logo,
        score: parseInt(awayTeam?.score || '0'),
        winner: awayTeam?.winner || false,
      },
      state: event.status?.type?.state, // "pre" | "in" | "post"
      odds: {
        details: oddsObj.details || 'N/A', // e.g. "KC -2.5" or "EVEN"
        overUnder: oddsObj.overUnder || null, // e.g. 45.5
        spread: num(oddsObj.spread), // the home team's spread; 0 is a pick'em, not missing
        provider: oddsObj.provider?.name || null,
        spreadOdds: {
          home: num(oddsObj.pointSpread?.home?.close?.odds),
          away: num(oddsObj.pointSpread?.away?.close?.odds),
        },
        moneyline: {
          home: num(oddsObj.moneyline?.home?.close?.odds),
          away: num(oddsObj.moneyline?.away?.close?.odds),
        },
      },
    };
  });

  return {
    sport,
    date: data.day?.date || dateInput,
    games,
  };
}
