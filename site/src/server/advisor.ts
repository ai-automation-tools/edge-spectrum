import { GoogleGenAI, Type } from '@google/genai';
import type { Strategy } from '../types.js';
import { deploymentMode } from './deployment.js';

/**
 * Gemini-powered strategy advisor. Shared by the local Express dev server
 * (`server.ts`) and the Vercel serverless function (`api/strategy-advisor.ts`).
 *
 * The client is created lazily so `process.env.GEMINI_API_KEY` is read at
 * call time — important on Vercel, where env vars are injected per-invocation.
 */
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return client;
}

const SYSTEM_PROMPT = `You are a world-class Quantitative Sports Betting Portfolio Manager with 25 years of algorithmic sports trading expertise across MLB, NFL, NBA, and NHL.
Your job is to provide sharp, objective, and realistic analysis of betting strategies.

IMPORTANT CONTEXT: the user is driving a *simulator*, not real historical data. Its 26 synthetic
seasons are generated so that every line is priced off the same distribution the scores are drawn
from, which means the book's hold (about 4.5%) is the only edge present. Never imply a strategy is
profitable in the real world because it backtested well here, and when a run looks like a winner,
say plainly that it is variance. Do teach what the strategy would face in a real market.
Help the user parse their natural language ideas, critique their current backtest parameters, and provide concrete recommendations.
Warn them about standard traps (e.g., heavily favored moneylines have huge vig/juice; point spread favorites cover less than expected; betting over/under trends usually regress to the mean).

ALWAYS formulate your output in JSON conforming exactly to the response schema:
- 'analysis': A well-articulated expert review in Markdown. Include bullet points, historical truths (e.g. why 2007 Patriots, 2016 Warriors, or early 2010s Giants are great simulation testbeds), and suggestions of alternative profitable metrics.
- 'suggestedTemplates': A list of 1 to 2 strategy configurations matching your expert recommendations, so the user can test them immediately. Use the following structured options for 'sideSelection': 'favorites'|'underdogs'|'home'|'away'|'home_favorites'|'away_favorites'|'home_underdogs'|'away_underdogs'|'over'|'under'`;

/**
 * Generate strategy advice as a JSON string conforming to AdvisorResponse.
 * Returns the raw model text (already JSON) for the caller to forward verbatim.
 */
export async function generateAdvice(
  prompt: string,
  currentStrategy: Partial<Strategy> | undefined,
): Promise<string> {
  if (deploymentMode() !== 'full') {
    throw new Error('Live AI is disabled in demo mode.');
  }
  const modelPrompt = `
User Query: "${prompt}"

Their currently selected backtest setup is:
Sport: ${currentStrategy?.sport || 'NFL'}
Years: ${currentStrategy?.startYear || 2020} - ${currentStrategy?.endYear || 2024}
Bet Type: ${currentStrategy?.betType || 'moneyline'}
Side: ${currentStrategy?.sideSelection || 'favorites'}
Unit: $${currentStrategy?.unitSize || 100}

Please provide your analysis and suggest 1-2 profitable alternative strategies or variations to backtest.`;

  const response = await getClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: modelPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: {
            type: Type.STRING,
            description:
              'Formated markdown text critiquing the strategy and providing historical insights.',
          },
          suggestedTemplates: {
            type: Type.ARRAY,
            description: 'A list of 1 or 2 distinct recommended strategies.',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Descriptive title of the template preset' },
                description: { type: Type.STRING, description: 'Summary explaining why this should be backtested' },
                sport: { type: Type.STRING, enum: ['NFL', 'NBA', 'MLB', 'NHL'] },
                betType: { type: Type.STRING, enum: ['moneyline', 'spread', 'totals'] },
                sideSelection: {
                  type: Type.STRING,
                  enum: ['favorites', 'underdogs', 'home', 'away', 'home_favorites', 'away_favorites', 'home_underdogs', 'away_underdogs', 'over', 'under'],
                },
                streakFilter: { type: Type.STRING, enum: ['any', 'after_win', 'after_loss', 'hot_streak_3plus', 'cold_streak_3plus'] },
                streakTarget: { type: Type.STRING, enum: ['bet_team', 'opponent'] },
                starPlayerFilter: { type: Type.STRING, enum: ['any', 'healthy_only', 'star_injured'] },
                oddsMin: { type: Type.NUMBER, description: 'Minimum American odds filter (optional)' },
                oddsMax: { type: Type.NUMBER, description: 'Maximum American odds filter (optional)' },
                spreadMin: { type: Type.NUMBER, description: 'Minimum point spread filter (optional)' },
                spreadMax: { type: Type.NUMBER, description: 'Maximum point spread filter (optional)' },
                totalMin: { type: Type.NUMBER, description: 'Minimum O/U point line filter (optional)' },
                totalMax: { type: Type.NUMBER, description: 'Maximum O/U point line filter (optional)' },
              },
              required: ['name', 'description', 'sport', 'betType', 'sideSelection', 'streakFilter', 'streakTarget', 'starPlayerFilter'],
            },
          },
        },
        required: ['analysis'],
      },
    },
  });

  return response.text ?? '';
}
