/**
 * Server-side proxy for ESPN's public scoreboard API. Runs server-side to
 * avoid browser CORS restrictions. Shared by the local Express dev server
 * (`server.ts`) and the Vercel serverless function (`api/espn-scoreboard.ts`).
 */

import type { RouteResult } from './httpTypes.js';

interface EspnScoreboardResult {
  sport: string;
  date: string;
  games: any[];
}

/** Our sport code -> ESPN's sport/league path. The only sports the proxy serves. */
const ESPN_PATHS: Record<string, string> = {
  NFL: 'football/nfl',
  NBA: 'basketball/nba',
  MLB: 'baseball/mlb',
  NHL: 'hockey/nhl',
};

/** How long ESPN gets before the request is abandoned. */
export const ESPN_TIMEOUT_MS = 8000;

/** The caller asked for something the proxy does not serve: a 400, not a 500. */
export class EspnInputError extends Error {}

export async function fetchEspnScoreboard(
  sportRaw: string,
  dateInput = '',
  timeoutMs = ESPN_TIMEOUT_MS,
): Promise<EspnScoreboardResult> {
  const sport = (sportRaw || 'NFL').toUpperCase();
  // An unknown sport used to fall through to NFL and come back labelled with
  // the caller's string, one CDN cache entry per spelling.
  const path = ESPN_PATHS[sport];
  if (!path) throw new EspnInputError(`Unknown sport: expected one of ${Object.keys(ESPN_PATHS).join(', ')}`);

  let url = `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard?limit=100`;
  if (dateInput) {
    // Only YYYYMMDD or YYYYMMDD-YYYYMMDD reaches ESPN: anything else could add
    // its own query parameters and mint unlimited cache-key variants.
    if (!/^\d{8}(-\d{8})?$/.test(dateInput)) {
      throw new EspnInputError('Invalid date: expected YYYYMMDD or YYYYMMDD-YYYYMMDD');
    }
    url += `&dates=${dateInput}`;
  }

  // Without a signal a stalled upstream holds the function, and the line
  // collector's scheduled task, until something else kills it.
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) {
    throw new Error(`ESPN API returned status ${response.status}`);
  }
  return parseEspnScoreboard(await response.json(), sport, dateInput);
}

/**
 * GET /api/espn-scoreboard, minus the framework. `query` is whatever the
 * adapter parsed: a repeated parameter arrives as an array and is refused
 * here rather than crashing on `.toUpperCase()`.
 */
export async function espnScoreboardRoute(
  query: { sport?: unknown; date?: unknown },
  timeoutMs = ESPN_TIMEOUT_MS,
): Promise<RouteResult> {
  const sport = query.sport ?? 'NFL';
  const date = query.date ?? '';
  if (typeof sport !== 'string' || typeof date !== 'string') {
    return { status: 400, body: { error: 'sport and date take one value each' } };
  }
  try {
    return { status: 200, body: await fetchEspnScoreboard(sport, date, timeoutMs) };
  } catch (error) {
    if (error instanceof EspnInputError) return { status: 400, body: { error: error.message } };
    if ((error as Error)?.name === 'TimeoutError') {
      return { status: 504, body: { error: 'ESPN did not answer in time.' } };
    }
    console.error('Error fetching ESPN scoreboard:', error);
    return { status: 500, body: { error: 'Failed to retrieve real-time ESPN scoreboard games.' } };
  }
}

/** A final or running score. ESPN sends a string; anything unreadable is null, never NaN. */
function score(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : null;
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
        score: score(homeTeam?.score),
        winner: homeTeam?.winner || false,
      },
      awayTeam: {
        name: awayTeam?.team?.displayName || 'Away Team',
        abbrev: awayTeam?.team?.abbreviation || 'AWAY',
        logo: awayTeam?.team?.logo,
        score: score(awayTeam?.score),
        winner: awayTeam?.winner || false,
      },
      state: event.status?.type?.state, // "pre" | "in" | "post"
      // A postponed or cancelled game is "post" too; only this says a result exists.
      completed: event.status?.type?.completed === true,
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
