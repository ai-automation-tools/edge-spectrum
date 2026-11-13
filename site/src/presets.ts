/**
 * The backtester's Quick Presets, kept out of the component so a check can
 * run them without a DOM (audit ARCH-06). Run by: npm run check:strategy-url
 */
import type { Strategy } from './types';

export interface Preset { name: string; strategy: Strategy }

export const PRESETS: Preset[] = [
  {
    name: 'NFL Underdog Trend Model',
    strategy: {
      sport: 'NFL',
      startYear: 2020,
      endYear: 2024,
      betType: 'moneyline',
      sideSelection: 'underdogs',
      streakFilter: 'any',
      oddsMin: 120,
      oddsMax: 350,
      unitSize: 100,
      startingBankroll: 10005 // standard baseline
    }
  },
  {
    name: 'NBA Cover Favorite Model',
    strategy: {
      sport: 'NBA',
      startYear: 2021,
      endYear: 2024,
      betType: 'spread',
      sideSelection: 'favorites',
      streakFilter: 'after_win',
      spreadMin: 3,
      spreadMax: 10,
      unitSize: 150,
      startingBankroll: 10000
    }
  },
  {
    name: 'MLB Underdog Moneyline Model',
    strategy: {
      sport: 'MLB',
      startYear: 2018,
      endYear: 2023,
      betType: 'moneyline',
      sideSelection: 'away_underdogs',
      streakFilter: 'any',
      oddsMin: 100,
      oddsMax: 220,
      unitSize: 100,
      startingBankroll: 10000
    }
  },
  {
    name: 'NHL Totals Over Model',
    strategy: {
      sport: 'NHL',
      startYear: 2015,
      endYear: 2024,
      betType: 'totals',
      sideSelection: 'over',
      streakFilter: 'any',
      totalMin: 5,
      totalMax: 6.5,
      unitSize: 100,
      startingBankroll: 10000
    }
  }
];

/**
 * The strategy a preset click puts on screen. Replace, never merge: a preset
 * that sets no odds filter must not inherit the last one's, which left the
 * next run with zero bets (audit BUG-05). A copy, so editing the form never
 * edits the preset.
 */
export const applyPreset = (preset: Preset): Strategy => ({ ...preset.strategy });
