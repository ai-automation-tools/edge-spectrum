import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { espnScoreboardRoute } from '../src/server/espn.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const result = await espnScoreboardRoute(req.query ?? {});
  if (result.status === 200) res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  res.status(result.status).json(result.body);
}
