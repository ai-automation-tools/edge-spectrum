import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { espnScoreboardRoute } from '../src/server/espn.js';
import { publicLimit, retryAfter } from '../src/server/publicLimit.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Cached 200s never reach here, so only cache misses count against the cap.
  const limited = publicLimit('espn', req);
  if (limited) {
    res.setHeader('Retry-After', retryAfter());
    return res.status(limited.status).json(limited.body);
  }
  const result = await espnScoreboardRoute(req.query ?? {});
  if (result.status === 200) res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  res.status(result.status).json(result.body);
}
