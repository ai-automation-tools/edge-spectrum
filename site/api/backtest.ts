import type { ApiRequest, ApiResponse } from '../src/server/httpTypes.js';
import { runValidatedBacktest, BadRequestError } from '../src/server/backtest.js';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const result = runValidatedBacktest(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: error.message, details: error.details });
    }
    console.error('Error running backtest:', error);
    res.status(500).json({ error: 'Internal Backtest Engine Error' });
  }
}
