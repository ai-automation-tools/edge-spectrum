import React, { useState } from 'react';
import { Strategy, SportType, BetType, SideSelectionType } from '../types';
import {
  MIN_SEASON, MAX_SEASON, MAX_UNIT_SIZE, MAX_STARTING_BANKROLL,
  MAX_AMERICAN_ODDS, MAX_SPREAD_POINTS, MAX_TOTAL_POINTS,
} from '../strategyBounds';
import {
  Play, AlertTriangle, Lightbulb, Sliders, DollarSign,
  ChevronDown, Globe, Target, Wallet, ArrowRight, Activity,
} from 'lucide-react';

interface StrategyBuilderProps {
  currentStrategy: Strategy;
  onChange: (strategy: Strategy) => void;
  onRunBacktest: (strat: Strategy) => void;
  isLoading: boolean;
}

// ── Shared control styling so every field speaks one visual language ──
const SELECT_CLS =
  'peer h-9 w-full appearance-none rounded-lg bg-zinc-950 border border-zinc-800 pl-3 pr-9 text-xs font-medium text-zinc-200 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 cursor-pointer';

// Eyebrow / cluster heading
function Eyebrow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium uppercase tracking-[0.18em] text-zinc-500">
      <Icon className="w-3.5 h-3.5 text-sky-400/70" />
      {text}
    </div>
  );
}

// Native select wrapped with a consistent custom chevron
function Select({
  value, onChange, children, disabled,
}: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${SELECT_CLS} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 peer-focus:text-sky-400 transition-colors" />
    </div>
  );
}

// Keep every numeric control inside the bounds the backtest schema enforces,
// so the form can never build a strategy the endpoint will reject.
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Optional screening filter: empty input clears it, anything else is bounded. */
const boundedOptional = (raw: string, min: number, max: number, parse: (v: string) => number) =>
  raw === '' ? undefined : clamp(parse(raw) || 0, min, max);

// Tiny field label
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] font-medium text-zinc-400">{children}</label>;
}

// Human-readable labels for the live strategy "recipe" line
const SIDE_LABELS: Record<string, string> = {
  favorites: 'All Favorites', underdogs: 'All Underdogs', home: 'All Home', away: 'All Away',
  home_favorites: 'Home Favorites', away_favorites: 'Away Favorites',
  home_underdogs: 'Home Underdogs', away_underdogs: 'Away Underdogs',
  after_win: 'Off a Win', after_loss: 'Off a Loss', hot_streak: 'Hot Streak',
  cold_streak: 'Cold Streak', rest_advantage: 'Rest Edge', rest_disadvantage: 'Rest Deficit',
  over: 'Overs', under: 'Unders',
};

// Decorative per-sport accent dot (matches the apex landing-page tile palette)
const SPORT_DOT: Record<SportType, string> = {
  NFL: 'bg-emerald-400', NBA: 'bg-amber-400', MLB: 'bg-sky-400', NHL: 'bg-violet-400',
};

const PRESETS: { name: string; strategy: Strategy }[] = [
  {
    name: 'NFL Underdog Trend Model',
    strategy: {
      sport: 'NFL',
      startYear: 2020,
      endYear: 2024,
      betType: 'moneyline',
      sideSelection: 'underdogs',
      streakFilter: 'any',
      streakTarget: 'bet_team',
      starPlayerFilter: 'any',
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
      streakTarget: 'bet_team',
      starPlayerFilter: 'healthy_only',
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
      streakTarget: 'bet_team',
      starPlayerFilter: 'any',
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
      streakTarget: 'bet_team',
      starPlayerFilter: 'any',
      totalMin: 5,
      totalMax: 6.5,
      unitSize: 100,
      startingBankroll: 10000
    }
  }
];

export default function StrategyBuilder({ currentStrategy, onChange, onRunBacktest, isLoading, }: StrategyBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Helper trigger
  const updateField = (field: keyof Strategy, value: any) => {
    onChange({
      ...currentStrategy,
      [field]: value,
    });
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    onChange({
      ...currentStrategy,
      ...preset.strategy
    });
  };

  // Keep year options clean — driven by the schema's season bounds
  const years = Array.from({ length: MAX_SEASON - MIN_SEASON + 1 }, (_, i) => MIN_SEASON + i);

  // Live, human-readable summary of the active configuration
  const seasonLabel = currentStrategy.startYear === currentStrategy.endYear
    ? `${currentStrategy.startYear}`
    : `${currentStrategy.startYear}–${currentStrategy.endYear}`;
  const recipe = [
    currentStrategy.sport,
    currentStrategy.betType.charAt(0).toUpperCase() + currentStrategy.betType.slice(1),
    SIDE_LABELS[currentStrategy.sideSelection] ?? currentStrategy.sideSelection,
    seasonLabel,
  ].join('  ·  ');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-zinc-100 tracking-tight text-[15px] leading-none">
              Strategy Portfolio Designer
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1">Compose, screen &amp; backtest a wagering thesis</p>
          </div>
        </div>
        <span className="text-[10px] bg-sky-500/10 text-sky-300 font-mono uppercase tracking-wider px-2 py-1 rounded-md border border-sky-500/20">
          v2.5
        </span>
      </div>

      {/* Strategy Presets */}
      <div className="flex flex-col gap-2.5">
        <Eyebrow icon={Lightbulb} text="Quick Presets" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(p)}
              className="group flex items-center gap-2.5 px-3 py-2.5 bg-zinc-950/60 border border-zinc-800 hover:border-sky-500/40 hover:bg-sky-500/[0.04] text-left rounded-xl transition-all duration-200"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SPORT_DOT[p.strategy.sport]} shadow-[0_0_8px] shadow-current opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-zinc-200 truncate group-hover:text-sky-100 transition-colors">{p.name}</div>
                <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">{p.strategy.sport} · {p.strategy.betType}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Control deck: three labeled clusters split by hairline dividers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px rounded-xl overflow-hidden border border-zinc-800 bg-zinc-800/50">
        {/* MARKET */}
        <section className="lg:col-span-5 bg-zinc-900/80 p-4 flex flex-col gap-4">
          <Eyebrow icon={Globe} text="Market" />

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Target Sport</FieldLabel>
            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
              {(['NFL', 'NBA', 'MLB', 'NHL'] as SportType[]).map((sport) => {
                const active = currentStrategy.sport === sport;
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => updateField('sport', sport)}
                    className={`py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 ${
                      active
                        ? 'bg-sky-500/20 text-sky-300 shadow-sm shadow-sky-500/10'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    {sport}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Season Range</FieldLabel>
            <div className="flex items-center gap-2">
              <Select
                value={currentStrategy.startYear}
                onChange={(e) => {
                  const yr = parseInt(e.target.value);
                  if (currentStrategy.endYear < yr) {
                    onChange({ ...currentStrategy, startYear: yr, endYear: yr });
                  } else {
                    updateField('startYear', yr);
                  }
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <Select
                value={currentStrategy.endYear}
                onChange={(e) => updateField('endYear', parseInt(e.target.value))}
              >
                {years.filter((y) => y >= currentStrategy.startYear).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        {/* WAGER */}
        <section className="lg:col-span-4 bg-zinc-900/80 p-4 flex flex-col gap-4">
          <Eyebrow icon={Target} text="Wager" />

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Wager Target</FieldLabel>
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
              {(['moneyline', 'spread', 'totals'] as BetType[]).map((type) => {
                const active = currentStrategy.betType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      // Apply betType + sanitized sideSelection in a single update.
                      // Two separate updateField calls would each spread the same
                      // stale currentStrategy, so the second would clobber the first
                      // and betType would never actually change.
                      const sideSelection: SideSelectionType =
                        type === 'totals' ? 'over' : 'favorites';
                      onChange({ ...currentStrategy, betType: type, sideSelection });
                    }}
                    className={`py-1.5 text-[11px] font-semibold capitalize rounded-md transition-all duration-200 ${
                      active
                        ? 'bg-sky-500/20 text-sky-300 shadow-sm shadow-sky-500/10'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Selection Choice</FieldLabel>
            <Select
              value={currentStrategy.sideSelection}
              onChange={(e) => updateField('sideSelection', e.target.value as SideSelectionType)}
            >
              {currentStrategy.betType === 'totals' ? (
                <>
                  <option value="over">Bet Overs Only</option>
                  <option value="under">Bet Unders Only</option>
                </>
              ) : (
                <>
                  <optgroup label="Core">
                    <option value="favorites">All Favorites</option>
                    <option value="underdogs">All Underdogs</option>
                    <option value="home">All Home Teams</option>
                    <option value="away">All Away Teams</option>
                  </optgroup>
                  <optgroup label="Situational">
                    <option value="home_favorites">Home Favorites Only</option>
                    <option value="away_favorites">Away Favorites Only</option>
                    <option value="home_underdogs">Home Underdogs Only</option>
                    <option value="away_underdogs">Away Underdogs Only</option>
                  </optgroup>
                  <optgroup label="Streaks &amp; Rest">
                    <option value="after_win">Teams coming off a Win</option>
                    <option value="after_loss">Teams coming off a Loss</option>
                    <option value="hot_streak">Hot Streak (3+ Wins)</option>
                    <option value="cold_streak">Cold Streak (3+ Losses)</option>
                    <option value="rest_advantage">Team with More Rest</option>
                    <option value="rest_disadvantage">Team with Least Rest</option>
                  </optgroup>
                </>
              )}
            </Select>
            {currentStrategy.betType !== 'moneyline' && (
              <p className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-500/70 shrink-0" />
                Priced at standard −110 house lines.
              </p>
            )}
          </div>
        </section>

        {/* CAPITAL */}
        <section className="lg:col-span-3 bg-zinc-900/80 p-4 flex flex-col gap-4">
          <Eyebrow icon={Wallet} text="Capital" />

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Starting Bankroll</FieldLabel>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="number"
                min={1}
                max={MAX_STARTING_BANKROLL}
                value={currentStrategy.startingBankroll}
                onChange={(e) => updateField('startingBankroll', clamp(parseInt(e.target.value) || 0, 1, MAX_STARTING_BANKROLL))}
                className="h-9 w-full pl-8 pr-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono font-medium tabular-nums text-zinc-200 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Unit Size</FieldLabel>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sky-400" />
              <input
                type="number"
                min={1}
                max={MAX_UNIT_SIZE}
                value={currentStrategy.unitSize}
                onChange={(e) => updateField('unitSize', clamp(parseInt(e.target.value) || 0, 1, MAX_UNIT_SIZE))}
                className="h-9 w-full pl-8 pr-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono font-medium tabular-nums text-sky-300 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Advanced Filter Collapse Switch */}
      <div className="border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="group flex items-center gap-1.5 text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-sky-400 hover:text-sky-300 transition-colors duration-150"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          Advanced Screening — Odds · Streaks · Injuries
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-zinc-950/40 rounded-xl border border-zinc-800 transition-all duration-300 animate-fadeIn">
            {/* Streak Filtering */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Streak Preconditions</FieldLabel>
              <Select
                value={currentStrategy.streakFilter}
                onChange={(e) => updateField('streakFilter', e.target.value)}
              >
                <option value="any">Any - No Streak Filter</option>
                <option value="after_win">Bet Only After Prior Game Win</option>
                <option value="after_loss">Bet Only After Prior Game Loss</option>
                <option value="hot_streak_3plus">Hot Streak (3+ Consecutive Wins)</option>
                <option value="cold_streak_3plus">Cold Streak (3+ Consecutive Losses)</option>
              </Select>
            </div>

            {/* Streak Target */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Streak Target Team</FieldLabel>
              <Select
                value={currentStrategy.streakTarget}
                onChange={(e) => updateField('streakTarget', e.target.value)}
                disabled={currentStrategy.streakFilter === 'any'}
              >
                <option value="bet_team">Evaluate Wager Target Team</option>
                <option value="opponent">Evaluate Opponent Team</option>
              </Select>
            </div>

            {/* Star Player Injury Impact Filter */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Key Roster Status Filter</FieldLabel>
              <Select
                value={currentStrategy.starPlayerFilter}
                onChange={(e) => updateField('starPlayerFilter', e.target.value)}
              >
                <option value="any">Any - Disregard Injuries</option>
                <option value="healthy_only">Target Team Marquee Player Healthy</option>
                <option value="star_injured">Target Team Marquee Player Injured (Fade Model)</option>
              </Select>
            </div>

            {/* Decimal/American odds parameters */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-3 border-t border-zinc-800 pt-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-semibold text-zinc-400">Min Odds (American)</label>
                <input
                  type="number"
                  placeholder="e.g. -150 or 110"
                  min={-MAX_AMERICAN_ODDS}
                  max={MAX_AMERICAN_ODDS}
                  value={currentStrategy.oddsMin ?? ''}
                  onChange={(e) => updateField('oddsMin', boundedOptional(e.target.value, -MAX_AMERICAN_ODDS, MAX_AMERICAN_ODDS, parseInt))}
                  className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-semibold text-zinc-400">Max Odds (American)</label>
                <input
                  type="number"
                  placeholder="e.g. +250 or -110"
                  min={-MAX_AMERICAN_ODDS}
                  max={MAX_AMERICAN_ODDS}
                  value={currentStrategy.oddsMax ?? ''}
                  onChange={(e) => updateField('oddsMax', boundedOptional(e.target.value, -MAX_AMERICAN_ODDS, MAX_AMERICAN_ODDS, parseInt))}
                  className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                />
              </div>

              {currentStrategy.betType === 'spread' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-semibold text-zinc-400">Min Spread Points</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 3.0"
                      min={0}
                      max={MAX_SPREAD_POINTS}
                      value={currentStrategy.spreadMin ?? ''}
                      onChange={(e) => updateField('spreadMin', boundedOptional(e.target.value, 0, MAX_SPREAD_POINTS, parseFloat))}
                      className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-semibold text-zinc-400">Max Spread Points</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 7.5"
                      min={0}
                      max={MAX_SPREAD_POINTS}
                      value={currentStrategy.spreadMax ?? ''}
                      onChange={(e) => updateField('spreadMax', boundedOptional(e.target.value, 0, MAX_SPREAD_POINTS, parseFloat))}
                      className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                </>
              )}

              {currentStrategy.betType === 'totals' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-semibold text-zinc-400">Min O/U Line Points</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 42.5"
                      min={0}
                      max={MAX_TOTAL_POINTS}
                      value={currentStrategy.totalMin ?? ''}
                      onChange={(e) => updateField('totalMin', boundedOptional(e.target.value, 0, MAX_TOTAL_POINTS, parseFloat))}
                      className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-semibold text-zinc-400">Max O/U Line Points</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 54.5"
                      min={0}
                      max={MAX_TOTAL_POINTS}
                      value={currentStrategy.totalMax ?? ''}
                      onChange={(e) => updateField('totalMax', boundedOptional(e.target.value, 0, MAX_TOTAL_POINTS, parseFloat))}
                      className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action bar — live recipe + execute */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-800 pt-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 shrink-0">Active</span>
          <span className="text-[11px] font-mono text-zinc-300 truncate">{recipe}</span>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => onRunBacktest(currentStrategy)}
          className="group px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-zinc-100 font-semibold rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 active:scale-95 text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none shrink-0"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play className="w-3.5 h-3.5 fill-current text-zinc-100 group-hover:scale-110 transition-transform" />
          )}
          <span>{isLoading ? 'Simulating Era…' : 'Execute Backtest'}</span>
        </button>
      </div>
    </div>
  );
}
