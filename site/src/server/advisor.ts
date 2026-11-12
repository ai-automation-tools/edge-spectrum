import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import type { AdvisorResponse, Strategy } from '../types.js';
import { deploymentMode } from './deployment.js';
import { guardAdvisorRequest } from './auth.js';
import type { RouteResult } from './httpTypes.js';
import {
  BET_TYPES, MAX_AMERICAN_ODDS, MAX_SPREAD_POINTS, MAX_TOTAL_POINTS, SIDE_SELECTIONS, SPORTS,
  STREAK_FILTERS, TOTALS_SIDES,
} from '../strategyBounds.js';

/**
 * Gemini-powered strategy advisor. Shared by the local Express dev server
 * (`server.ts`) and the Vercel serverless function (`api/strategy-advisor.ts`).
 *
 * The client is created lazily so `process.env.GEMINI_API_KEY` is read at
 * call time — important on Vercel, where env vars are injected per-invocation.
 */
let client: GoogleGenAI | null = null;

/**
 * Model ids retire on Google's schedule, not ours, so a self-hoster can move
 * with `GEMINI_MODEL` instead of waiting for a release. The default is the
 * model `gemini-2.5-flash` requests are routed to from 2026-12-01; see
 * docs/UPSTREAMS.md for when it was last checked.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const geminiModel = () => process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
- 'analysis': A well-articulated expert review in Markdown. Include bullet points and suggestions of other angles worth testing.
- 'suggestedTemplates': A list of 1 to 2 strategy configurations matching your expert recommendations, so the user can test them immediately. Use the following structured options for 'sideSelection': 'favorites'|'underdogs'|'home'|'away'|'home_favorites'|'away_favorites'|'home_underdogs'|'away_underdogs'|'over'|'under'`;

/** How long the model gets, and how much it may write: both bound what one call can cost. */
export const ADVISOR_TIMEOUT_MS = 20_000;
const MAX_OUTPUT_TOKENS = 4096;

/** The model's reply was empty, not JSON, or not the shape asked for: a 502, never forwarded. */
export class AdviceFormatError extends Error {}

const optional = (max: number, min = 0) => z.number().finite().min(min).max(max).optional().catch(undefined);
const templateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).catch(''),
  sport: z.enum(SPORTS),
  betType: z.enum(BET_TYPES),
  sideSelection: z.enum(SIDE_SELECTIONS),
  streakFilter: z.enum(STREAK_FILTERS).catch('any'),
  oddsMin: optional(MAX_AMERICAN_ODDS, -MAX_AMERICAN_ODDS),
  oddsMax: optional(MAX_AMERICAN_ODDS, -MAX_AMERICAN_ODDS),
  spreadMin: optional(MAX_SPREAD_POINTS),
  spreadMax: optional(MAX_SPREAD_POINTS),
  totalMin: optional(MAX_TOTAL_POINTS),
  totalMax: optional(MAX_TOTAL_POINTS),
});

/**
 * Check the model's text before it reaches a browser. The analysis must be
 * there; a suggested template the backtest schema would reject (an unknown
 * value, a totals bet on a team side, a min above its max) is dropped rather
 * than failing the reply, so "Apply" can never put the form in a bad state.
 */
export function parseAdvice(text: string): AdvisorResponse {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new AdviceFormatError('reply is not JSON'); }
  const analysis = (raw as { analysis?: unknown } | null)?.analysis;
  if (typeof analysis !== 'string' || analysis.trim() === '') throw new AdviceFormatError('reply has no analysis');

  const offered = (raw as { suggestedTemplates?: unknown }).suggestedTemplates;
  const ordered = (min?: number, max?: number) => min === undefined || max === undefined || min <= max;
  const suggestedTemplates = (Array.isArray(offered) ? offered : []).flatMap((item) => {
    const parsed = templateSchema.safeParse(item);
    if (!parsed.success) return [];
    const t = parsed.data;
    const totalsSide = (TOTALS_SIDES as readonly string[]).includes(t.sideSelection!);
    if ((t.betType === 'totals') !== totalsSide) return [];
    if (!ordered(t.oddsMin, t.oddsMax) || !ordered(t.spreadMin, t.spreadMax) || !ordered(t.totalMin, t.totalMax)) return [];
    return [t as AdvisorResponse['suggestedTemplates'][number]];
  }).slice(0, 2);

  return { analysis, suggestedTemplates };
}

/**
 * POST /api/strategy-advisor, minus the framework. The gate runs first: this
 * endpoint spends real money on the Gemini key, so it is enforced here and
 * not only in the UI.
 */
export async function advisorRoute(cookieHeader: string | undefined, body: unknown, ip: string): Promise<RouteResult> {
  const { prompt, currentStrategy } = (body ?? {}) as { prompt?: unknown; currentStrategy?: Partial<Strategy> };
  const denied = guardAdvisorRequest(cookieHeader, prompt, ip);
  if (denied) return denied;
  try {
    return { status: 200, body: await generateAdvice(prompt as string, currentStrategy) };
  } catch (error) {
    const name = (error as Error)?.name;
    if (name === 'TimeoutError' || name === 'AbortError') {
      return { status: 504, body: { error: 'The model took too long to answer. Try again, or ask something shorter.' } };
    }
    console.error('Error in strategy advisor:', error);
    if (error instanceof AdviceFormatError) {
      return { status: 502, body: { error: 'The model returned an answer the advisor could not read. Try again.' } };
    }
    return { status: 500, body: { error: 'The advisor could not reach the model. Check the Gemini key and model on this deployment.' } };
  }
}

/** Ask the model for advice and return it validated (see parseAdvice). */
export async function generateAdvice(
  prompt: string,
  currentStrategy: Partial<Strategy> | undefined,
): Promise<AdvisorResponse> {
  if (deploymentMode() !== 'full') {
    throw new Error('Live AI is disabled in demo mode.');
  }
  // currentStrategy comes straight from the request body: clip every field so
  // it can't carry text past the prompt's 1000-character cap.
  const s = (v: unknown, d: string) => String(v || d).slice(0, 20);
  const n = (v: unknown, d: number) => Number(v) || d;
  const cs = currentStrategy ?? {};
  const modelPrompt = `
User Query: "${prompt}"

Their currently selected backtest setup is:
Sport: ${s(cs.sport, 'NFL')}
Years: ${n(cs.startYear, 2020)} - ${n(cs.endYear, 2024)}
Bet Type: ${s(cs.betType, 'moneyline')}
Side: ${s(cs.sideSelection, 'favorites')}
Unit: $${n(cs.unitSize, 100)}

Please provide your analysis and suggest 1-2 alternative strategies or variations to backtest.`;

  const response = await getClient().models.generateContent({
    model: geminiModel(),
    contents: modelPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      abortSignal: AbortSignal.timeout(ADVISOR_TIMEOUT_MS),
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
                oddsMin: { type: Type.NUMBER, description: 'Minimum American odds filter (optional)' },
                oddsMax: { type: Type.NUMBER, description: 'Maximum American odds filter (optional)' },
                spreadMin: { type: Type.NUMBER, description: 'Minimum point spread filter (optional)' },
                spreadMax: { type: Type.NUMBER, description: 'Maximum point spread filter (optional)' },
                totalMin: { type: Type.NUMBER, description: 'Minimum O/U point line filter (optional)' },
                totalMax: { type: Type.NUMBER, description: 'Maximum O/U point line filter (optional)' },
              },
              required: ['name', 'description', 'sport', 'betType', 'sideSelection', 'streakFilter'],
            },
          },
        },
        required: ['analysis'],
      },
    },
  });

  return parseAdvice(response.text ?? '');
}
