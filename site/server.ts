import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runValidatedBacktest, BadRequestError } from './src/server/backtest';
import { fetchEspnScoreboard } from './src/server/espn';
import { generateAdvice } from './src/server/advisor';
import {
  attemptUnlock,
  clientIp,
  guardAdvisorRequest,
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
  try {
    const result = runValidatedBacktest(req.body);
    res.json(result);
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: error.message, details: error.details });
    }
    console.error('Error running backtest:', error);
    res.status(500).json({ error: 'Internal Backtest Engine Error' });
  }
});

// 2. ESPN Live Scoreboard Proxied Endpoint
app.get('/api/espn-scoreboard', async (req, res) => {
  try {
    const sport = (req.query.sport as string) || 'NFL';
    const date = (req.query.date as string) || ''; // YYYYMMDD
    const result = await fetchEspnScoreboard(sport, date);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching ESPN scoreboard:', error);
    res.status(500).json({ error: 'Failed to retrieve real-time ESPN scoreboard games.' });
  }
});

// 3. AI Advisor Session Endpoint (passcode gate)
app.get('/api/advisor-auth', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const result = sessionStatus(req.headers.cookie);
  res.status(result.status).json(result.body);
});

app.post('/api/advisor-auth', (req, res) => {
  const { passcode, action } = req.body || {};
  const result = action === 'logout' ? logout() : attemptUnlock(passcode, clientIp(req.headers));
  if (result.setCookie) res.setHeader('Set-Cookie', result.setCookie);
  res.status(result.status).json(result.body);
});

// 4. AI Advisor Endpoint — gated, since it spends the Gemini key
app.post('/api/strategy-advisor', async (req, res) => {
  const { prompt, currentStrategy } = req.body || {};

  const denied = guardAdvisorRequest(req.headers.cookie, prompt);
  if (denied) {
    return res.status(denied.status).json(denied.body);
  }

  try {
    const text = await generateAdvice(prompt, currentStrategy);
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch (error: any) {
    console.error('Error in strategy advisor:', error);
    res.status(500).json({ error: 'Strategy Advisor was unable to generate response. Check your Gemini API connection.' });
  }
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
