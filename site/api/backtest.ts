import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { backtestRoute } from '../src/server/backtest.js';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Vercel parses the body lazily, so malformed JSON throws on this read. That
  // is the caller's mistake, not an engine failure.
  let body: unknown;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  const result = backtestRoute(body);
  res.status(result.status).json(result.body);
}
