import 'dotenv/config';
import express from 'express';
import path from 'path';
import { readFileSync } from 'node:fs';
import { createServer as createViteServer } from 'vite';
import { backtestRoute } from './src/server/backtest';
import { espnScoreboardRoute } from './src/server/espn';
import { advisorRoute } from './src/server/advisor';
import {
  attemptUnlock,
  clientIp,
  logout,
  sessionStatus,
} from './src/server/auth';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

// API Routes — these mirror the Vercel serverless functions in `api/`.
// Shared request logic lives in `src/server/*` so the two stay in sync.

// 1. Backtest Engine Endpoint
app.post('/api/backtest', (req, res) => {
  const result = backtestRoute(req.body);
  res.status(result.status).json(result.body);
});

// 2. ESPN Live Scoreboard Proxied Endpoint
app.get('/api/espn-scoreboard', async (req, res) => {
  const result = await espnScoreboardRoute(req.query);
  res.status(result.status).json(result.body);
});

// 3. AI Advisor Session Endpoint (passcode gate)
app.get('/api/advisor-auth', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const result = sessionStatus(req.headers.cookie);
  res.status(result.status).json(result.body);
});

app.post('/api/advisor-auth', (req, res) => {
  const { passcode, action } = req.body || {};
  const result = action === 'logout' ? logout() : attemptUnlock(passcode, clientIp(req));
  if (result.setCookie) res.setHeader('Set-Cookie', result.setCookie);
  res.status(result.status).json(result.body);
});

// 4. AI Advisor Endpoint — gated, since it spends the Gemini key
app.post('/api/strategy-advisor', async (req, res) => {
  const result = await advisorRoute(req.headers.cookie, req.body, clientIp(req));
  res.status(result.status).json(result.body);
});

// Start Express Server / Connect Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // The SPA shell for every path, but only the routes it serves are a 200:
    // the rest render its not-found page with a 404 (same list as vercel.json).
    const CLIENT_ROUTES = ['/', '/backtester', '/odds', '/parlay', '/kelly', '/setup'];
    // Read once: the shell never changes while the server runs, so no request touches the disk for it.
    const shell = readFileSync(path.join(distPath, 'index.html'), 'utf8');
    // Express 5 (path-to-regexp 8) needs a named wildcard; the braces let it match "/" too.
    app.get('/{*splat}', (req, res) => {
      const known = CLIENT_ROUTES.includes(req.path.replace(/\/+$/, '') || '/');
      res.status(known ? 200 : 404).type('html').send(shell);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
