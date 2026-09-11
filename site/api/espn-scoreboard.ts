import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { fetchEspnScoreboard } from '../src/server/espn.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const sport = (req.query.sport as string) || 'NFL';
    const date = (req.query.date as string) || ''; // YYYYMMDD
    const result = await fetchEspnScoreboard(sport, date);
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    res.json(result);
  } catch (error) {
    console.error('Error fetching ESPN scoreboard:', error);
    res.status(500).json({ error: 'Failed to retrieve real-time ESPN scoreboard games.' });
  }
}
