import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { advisorRoute } from '../src/server/advisor.js';
import { clientIp } from '../src/server/auth.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let body: unknown;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  const result = await advisorRoute(req.headers.cookie, body, clientIp(req));
  res.status(result.status).json(result.body);
}
