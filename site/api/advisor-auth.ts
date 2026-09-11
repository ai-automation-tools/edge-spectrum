import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { attemptUnlock, clientIp, logout, sessionStatus } from '../src/server/auth.js';

/**
 * Session endpoint for the passcode-gated AI advisor.
 *   GET  → { configured, authed }
 *   POST { passcode }          → sets the session cookie
 *   POST { action: 'logout' }  → clears it
 *
 * Mirrors the Express routes in `server.ts`; the decision logic itself lives in
 * `src/server/auth.ts` so the two stay in sync.
 */
export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const cookieHeader = req.headers.cookie;

  const result = (() => {
    if (req.method === 'GET') return sessionStatus(cookieHeader);
    if (req.method === 'POST') {
      const { passcode, action } = (req.body || {}) as {
        passcode?: unknown;
        action?: unknown;
      };
      if (action === 'logout') return logout();
      return attemptUnlock(passcode, clientIp(req.headers));
    }
    return { status: 405, body: { error: 'Method not allowed' } };
  })();

  if (result.setCookie) res.setHeader('Set-Cookie', result.setCookie);
  res.status(result.status).json(result.body);
}
