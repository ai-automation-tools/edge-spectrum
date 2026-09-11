import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { generateAdvice } from '../src/server/advisor.js';
import { guardAdvisorRequest } from '../src/server/auth.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, currentStrategy } = req.body || {};

  // This endpoint spends real money on the Gemini key, so the passcode gate is
  // enforced here rather than only in the UI.
  const denied = guardAdvisorRequest(req.headers.cookie, prompt);
  if (denied) {
    return res.status(denied.status).json(denied.body);
  }

  try {
    const text = await generateAdvice(prompt, currentStrategy);
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch (error) {
    console.error('Error in strategy advisor:', error);
    res.status(500).json({ error: 'Strategy Advisor was unable to generate response. Check your Gemini API connection.' });
  }
}
