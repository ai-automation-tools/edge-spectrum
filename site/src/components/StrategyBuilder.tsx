import React, { useEffect, useState } from 'react';
import { Strategy, SportType, BetType, SideSelectionType } from '../types';
import {
  MIN_SEASON, MAX_SEASON, MAX_UNIT_SIZE, MAX_STARTING_BANKROLL,
  MAX_AMERICAN_ODDS, MAX_SPREAD_POINTS, MAX_TOTAL_POINTS, rangeIssues,
} from '../strategyBounds';
import { strategyToQuery } from '../strategyUrl';
import {
  Play, AlertTriangle, Lightbulb, Sliders, DollarSign,
  ChevronDown, Globe, Target, Wallet, ArrowRight, Activity, Link2, Check,
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
  value, onChange, children, disabled, id, label,
}: {
  id?: string;
  /** Accessible name, for a select with no visible label of its own. */
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        aria-label={label}
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

// Tiny field label. `htmlFor` ties it to a control; `id` lets a button group
// name itself with aria-labelledby.
function FieldLabel({ children, htmlFor, id }: { children: React.ReactNode; htmlFor?: string; id?: string }) {
  return <label htmlFor={htmlFor} id={id} className="text-[11px] font-medium text-zinc-400">{children}</label>;
}

/**
 * Dollar field. Holds what was typed and only commits a value that is
 * already in range, so the field can be emptied and retyped: clamping each
 * keystroke turned "clear, type 250" into 1250 and ran a $1 backtest between.
 * Anything else is settled on blur, with a hint saying what happened.
 */
function MoneyInput({ id, value, max, onCommit, className }: {
  id: string; value: number; max: number; onCommit: (v: number) => void; className: string;
}) {
  const [text, setText] = useState(String(value));
  const [adjusted, setAdjusted] = useState(false);
  // A preset or a share link changed the value from outside.
  useEffect(() => { setText((t) => (Number(t) === value ? t : String(value))); }, [value]);

  const inRange = (raw: string) => {
    const v = Number(raw);
    return raw.trim() !== '' && v >= 1 && v <= max; // NaN fails both comparisons
  };
  const valid = inRange(text);
  const hint = valid && !adjusted ? '' : `${adjusted ? 'Adjusted. ' : ''}Enter 1 to ${max.toLocaleString()}.`;

  return (
    <>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={text}
        aria-invalid={!valid}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => {
          setText(e.target.value);
          setAdjusted(false);
          if (inRange(e.target.value)) onCommit(Number(e.target.value));
        }}
        onBlur={() => {
          if (valid) return;
          const n = Number(text);
          const fixed = text.trim() !== '' && Number.isFinite(n) ? clamp(n, 1, max) : value;
          setText(String(fixed));
          setAdjusted(true);
          onCommit(fixed);
        }}
        className={className}
      />
      {hint && <p id={`${id}-hint`} role="status" className="absolute left-0 top-full mt-0.5 text-[10px] text-amber-400">{hint}</p>}
    </>
  );
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

export default function StrategyBuilder({ currentStrategy, onChange, onRunBacktest, isLoading, }: StrategyBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  // A min above its max: said here and never sent, since the endpoint would answer 400.
  const issues = rangeIssues(currentStrategy);
  const invalid = (field: string) => issues.some((i) => i.field === field) || undefined;

  // Built from the strategy itself rather than read off the address bar, which
  // only catches up once the debounced rerun fires.
  const copyShareLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${strategyToQuery(currentStrategy)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  // Helper trigger
  const updateField = (field: keyof Strategy, value: any) => {
    onChange({
      ...currentStrategy,
      [field]: value,
    });
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    // Replace, never merge: a preset that sets no odds filter must not inherit
    // the last preset's, which left the next one with zero bets (audit BUG-05).
    onChange({ ...preset.strategy });
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
    <div className="panel p-5 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="glyph"><Sliders className="w-5 h-5" strokeWidth={1.6} /></span>
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
              className="group flex items-center gap-2.5 px-3 py-2.5 bg-(--bg-2)/60 border border-zinc-800 hover:border-sky-500/40 hover:bg-sky-500/[0.04] text-left rounded-xl transition-all duration-200"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-800/40">
        {/* MARKET */}
        <section className="lg:col-span-5 bg-(--bg-3)/90 p-4 flex flex-col gap-4">
          <Eyebrow icon={Globe} text="Market" />

          <div className="flex flex-col gap-1.5">
            <FieldLabel id="sb-sport">Target Sport</FieldLabel>
            <div role="group" aria-labelledby="sb-sport" className="grid grid-cols-4 gap-1 p-1 bg-(--bg-2) rounded-lg border border-zinc-800">
              {(['NFL', 'NBA', 'MLB', 'NHL'] as SportType[]).map((sport) => {
                const active = currentStrategy.sport === sport;
                return (
                  <button
                    key={sport}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateField('sport', sport)}
                    className={`py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 ${
                      active
                        ? 'bg-sky-500/20 text-sky-300 light:text-sky-200 shadow-sm shadow-sky-500/10'
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
            <FieldLabel id="sb-seasons">Season Range</FieldLabel>
            <div role="group" aria-labelledby="sb-seasons" className="flex items-center gap-2">
              <Select
                label="First season"
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
                label="Last season"
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
        <section className="lg:col-span-4 bg-(--bg-3)/90 p-4 flex flex-col gap-4">
          <Eyebrow icon={Target} text="Wager" />

          <div className="flex flex-col gap-1.5">
            <FieldLabel id="sb-bet-type">Wager Target</FieldLabel>
            <div role="group" aria-labelledby="sb-bet-type" className="grid grid-cols-3 gap-1 p-1 bg-(--bg-2) rounded-lg border border-zinc-800">
              {(['moneyline', 'spread', 'totals'] as BetType[]).map((type) => {
                const active = currentStrategy.betType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      // Apply betType + sanitized sideSelection in a single update.
                      // Two separate updateField calls would each spread the same
                      // stale currentStrategy, so the second would clobber the first
                      // and betType would never actually change.
                      const sideSelection: SideSelectionType =
                        type === 'totals' ? 'over' : 'favorites';
                      // A total backs no team, so it takes no streak filter.
                      const streakFilter = type === 'totals' ? 'any' : currentStrategy.streakFilter;
                      onChange({ ...currentStrategy, betType: type, sideSelection, streakFilter });
                    }}
                    className={`py-1.5 text-[11px] font-semibold capitalize rounded-md transition-all duration-200 ${
                      active
                        ? 'bg-sky-500/20 text-sky-300 light:text-sky-200 shadow-sm shadow-sky-500/10'
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
            <FieldLabel htmlFor="sb-side">Selection Choice</FieldLabel>
            <Select
              id="sb-side"
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
                Each side is priced from the simulated score distribution, not a flat −110.
              </p>
            )}
          </div>
        </section>

        {/* CAPITAL */}
        <section className="lg:col-span-3 bg-(--bg-3)/90 p-4 flex flex-col gap-4">
          <Eyebrow icon={Wallet} text="Capital" />

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="sb-bankroll">Starting Bankroll</FieldLabel>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <MoneyInput
                id="sb-bankroll"
                max={MAX_STARTING_BANKROLL}
                value={currentStrategy.startingBankroll}
                onCommit={(v) => updateField('startingBankroll', v)}
                className="h-9 w-full pl-8 pr-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono font-medium tabular-nums text-zinc-200 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="sb-unit">Unit Size</FieldLabel>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sky-400" />
              <MoneyInput
                id="sb-unit"
                max={MAX_UNIT_SIZE}
                value={currentStrategy.unitSize}
                onCommit={(v) => updateField('unitSize', v)}
                className="h-9 w-full pl-8 pr-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono font-medium tabular-nums text-sky-300 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
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
          aria-expanded={showAdvanced}
          className="group flex items-center gap-1.5 max-sm:py-2 text-[11px] font-mono font-medium uppercase tracking-[0.12em] text-sky-400 hover:text-sky-300 transition-colors duration-150"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          Advanced Screening — Odds{currentStrategy.betType === 'totals' ? ' · Line' : ' · Streaks'}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-(--bg-2)/50 rounded-xl border border-zinc-800 transition-all duration-300 animate-fadeIn">
            {/* Streak Filtering: a total backs no team, so there is no streak to filter on */}
            {currentStrategy.betType !== 'totals' && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="sb-streak">Streak Preconditions</FieldLabel>
              <Select
                id="sb-streak"
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
            )}

            {/* Decimal/American odds parameters */}
            <div className={`col-span-1 md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-3 ${currentStrategy.betType === 'totals' ? '' : 'border-t border-zinc-800 pt-3 mt-1'}`}>
              <div className="flex flex-col gap-1">
                <label htmlFor="sb-oddsMin" className="text-[10px] uppercase font-semibold text-zinc-400">Min Odds (American)</label>
                <input
                  id="sb-oddsMin"
                  type="number"
                  placeholder="e.g. -150 or 110"
                  min={-MAX_AMERICAN_ODDS}
                  max={MAX_AMERICAN_ODDS}
                  value={currentStrategy.oddsMin ?? ''}
                  onChange={(e) => updateField('oddsMin', boundedOptional(e.target.value, -MAX_AMERICAN_ODDS, MAX_AMERICAN_ODDS, parseInt))}
                  className="h-9 px-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="sb-oddsMax" className="text-[10px] uppercase font-semibold text-zinc-400">Max Odds (American)</label>
                <input
                  id="sb-oddsMax"
                  type="number"
                  placeholder="e.g. +250 or -110"
                  min={-MAX_AMERICAN_ODDS}
                  max={MAX_AMERICAN_ODDS}
                  value={currentStrategy.oddsMax ?? ''}
                  aria-invalid={invalid('oddsMax')}
                  onChange={(e) => updateField('oddsMax', boundedOptional(e.target.value, -MAX_AMERICAN_ODDS, MAX_AMERICAN_ODDS, parseInt))}
                  className="h-9 px-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                />
              </div>

              {currentStrategy.betType === 'spread' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sb-spreadMin" className="text-[10px] uppercase font-semibold text-zinc-400">Min Spread Points</label>
                    <input
                      id="sb-spreadMin"
                      type="number"
                      step="0.5"
                      placeholder="e.g. 3.0"
                      min={0}
                      max={MAX_SPREAD_POINTS}
                      value={currentStrategy.spreadMin ?? ''}
                      onChange={(e) => updateField('spreadMin', boundedOptional(e.target.value, 0, MAX_SPREAD_POINTS, parseFloat))}
                      className="h-9 px-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sb-spreadMax" className="text-[10px] uppercase font-semibold text-zinc-400">Max Spread Points</label>
                    <input
                      id="sb-spreadMax"
                      type="number"
                      step="0.5"
                      placeholder="e.g. 7.5"
                      min={0}
                      max={MAX_SPREAD_POINTS}
                      value={currentStrategy.spreadMax ?? ''}
                      aria-invalid={invalid('spreadMax')}
                      onChange={(e) => updateField('spreadMax', boundedOptional(e.target.value, 0, MAX_SPREAD_POINTS, parseFloat))}
                      className="h-9 px-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                </>
              )}

              {currentStrategy.betType === 'totals' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sb-totalMin" className="text-[10px] uppercase font-semibold text-zinc-400">Min O/U Line Points</label>
                    <input
                      id="sb-totalMin"
                      type="number"
                      step="0.5"
                      placeholder="e.g. 42.5"
                      min={0}
                      max={MAX_TOTAL_POINTS}
                      value={currentStrategy.totalMin ?? ''}
                      onChange={(e) => updateField('totalMin', boundedOptional(e.target.value, 0, MAX_TOTAL_POINTS, parseFloat))}
                      className="h-9 px-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sb-totalMax" className="text-[10px] uppercase font-semibold text-zinc-400">Max O/U Line Points</label>
                    <input
                      id="sb-totalMax"
                      type="number"
                      step="0.5"
                      placeholder="e.g. 54.5"
                      min={0}
                      max={MAX_TOTAL_POINTS}
                      value={currentStrategy.totalMax ?? ''}
                      aria-invalid={invalid('totalMax')}
                      onChange={(e) => updateField('totalMax', boundedOptional(e.target.value, 0, MAX_TOTAL_POINTS, parseFloat))}
                      className="h-9 px-3 bg-(--bg-2) border border-zinc-800 rounded-lg text-xs font-mono tabular-nums text-zinc-300 placeholder:text-zinc-600 hover:border-zinc-700 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <p role="alert" className="flex items-center gap-1.5 text-[11px] text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {issues.map((i) => i.message).join('. ')}. Fix it under Advanced Screening to run the backtest.
        </p>
      )}

      {/* Action bar — live recipe + execute */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-800 pt-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-500 shrink-0">Active</span>
          <span className="text-[11px] font-mono text-zinc-300 truncate">{recipe}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={copyShareLink}
          title="Copy a link that reopens this exact strategy"
          className="px-3 py-2.5 bg-(--bg-2)/60 border border-zinc-800 hover:border-sky-500/40 text-zinc-300 hover:text-sky-200 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy link'}</span>
        </button>
        <button
          type="button"
          disabled={isLoading || issues.length > 0}
          onClick={() => onRunBacktest(currentStrategy)}
          className="group px-6 py-2.5 bg-sky-700 hover:bg-sky-600 disabled:bg-sky-800 text-white light:disabled:text-zinc-100 font-semibold rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 active:scale-95 text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none shrink-0"
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
    </div>
  );
}
