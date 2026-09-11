/**
 * Server-side proxy for ESPN's public scoreboard API. Runs server-side to
 * avoid browser CORS restrictions. Shared by the local Express dev server
 * (`server.ts`) and the Vercel serverless function (`api/espn-scoreboard.ts`).
 */

interface EspnScoreboardResult {
  sport: string;
  date: string;
  games: unknown[];
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
    url += `&dates=${dateInput}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ESPN API returned status ${response.status}`);
  }
  const data = (await response.json()) as any;

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
      odds: {
        details: oddsObj.details || 'N/A', // e.g. "KC -2.5" or "EVEN"
        overUnder: oddsObj.overUnder || null, // e.g. 45.5
        spread: oddsObj.spread || null,
      },
    };
  });

  return {
    sport,
    date: data.day?.date || dateInput,
    games,
  };
}
