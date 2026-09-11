import React, { useState } from 'react';
import { Calculator, Scale, Plus, X, Info } from 'lucide-react';
import { INPUT_CLS, pct, Select, Panel, Stat } from '../components/CalcUi';
import {
  type OddsFormat, type DevigMethod, FORMAT_LABEL, METHOD_LABEL, METHOD_BLURB,
  parseOdds, formatOdds, devig,
} from '../odds';

const FORMATS = Object.keys(FORMAT_LABEL) as OddsFormat[];
const METHODS = Object.keys(METHOD_LABEL) as DevigMethod[];

// ── Converter ────────────────────────────────────────────────────────────

function Converter() {
  // The field being typed in keeps its raw text; every other field is derived.
  const [src, setSrc] = useState<{ format: OddsFormat; text: string }>({ format: 'american', text: '-110' });
  const decimal = parseOdds(src.text, src.format);

  return (
    <Panel
      icon={Calculator}
      title="Odds Converter"
      blurb="Type into any box — the rest update. Implied % is the bookmaker's price including margin, not a fair probability."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {FORMATS.map((f) => {
          const active = f === src.format;
          const value = active ? src.text : decimal ? formatOdds(decimal, f) : '';
          const bad = active && src.text.trim() !== '' && decimal === null;
          return (
            <label key={f} className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{FORMAT_LABEL[f]}</span>
              <input
                value={value}
                onChange={(e) => setSrc({ format: f, text: e.target.value })}
                placeholder={{ american: '-110', decimal: '1.909', fractional: '10/11', implied: '52.38' }[f]}
                inputMode="decimal"
                className={`${INPUT_CLS} ${bad ? 'border-rose-500/60' : ''} ${active ? '' : 'text-zinc-300'}`}
              />
            </label>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-xs text-zinc-500">
        {decimal
          ? <>$100 stake returns <span className="text-zinc-200">${(decimal * 100).toFixed(2)}</span> · profit <span className="text-zinc-200">${((decimal - 1) * 100).toFixed(2)}</span> · break-even win rate <span className="text-zinc-200">{pct(1 / decimal)}</span></>
          : 'Enter a valid price (American |odds| ≥ 100, decimal > 1, fraction like 10/11, or a percentage).'}
      </p>
    </Panel>
  );
}

// ── No-vig ───────────────────────────────────────────────────────────────

interface Leg { id: number; label: string; text: string }
let nextId = 3;

function NoVig() {
  const [format, setFormat] = useState<OddsFormat>('american');
  const [method, setMethod] = useState<DevigMethod>('multiplicative');
  const [legs, setLegs] = useState<Leg[]>([
    { id: 1, label: 'Home', text: '-110' },
    { id: 2, label: 'Away', text: '-110' },
  ]);

  const decimals = legs.map((l) => parseOdds(l.text, format));
  const complete = decimals.every((d): d is number => d !== null);
  const result = complete ? devig(decimals, method) : null;

  const update = (id: number, patch: Partial<Leg>) =>
    setLegs((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <Panel
      icon={Scale}
      title="No-Vig Fair Price"
      blurb="Enter every side of a market to strip the bookmaker's margin and see the fair probability and price of each outcome."
    >
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Odds format</span>
          <Select value={format} onChange={setFormat} options={FORMATS} labels={FORMAT_LABEL} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">De-vig method</span>
          <Select value={method} onChange={setMethod} options={METHODS} labels={METHOD_LABEL} />
        </label>
      </div>
      <p className="mb-5 flex gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400/70" />
        {METHOD_BLURB[method]}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="pb-2 pr-3 font-medium">Outcome</th>
              <th className="pb-2 pr-3 font-medium">Book price</th>
              <th className="pb-2 pr-3 text-right font-medium">Implied</th>
              <th className="pb-2 pr-3 text-right font-medium">Fair prob</th>
              <th className="pb-2 pr-3 text-right font-medium">Fair price</th>
              <th className="pb-2 text-right font-medium">Vig in leg</th>
              <th />
            </tr>
          </thead>
          <tbody className="font-mono">
            {legs.map((leg, i) => {
              const d = decimals[i];
              const bad = leg.text.trim() !== '' && d === null;
              return (
                <tr key={leg.id} className="border-t border-zinc-800/60">
                  <td className="py-2 pr-3">
                    <input value={leg.label} onChange={(e) => update(leg.id, { label: e.target.value })} className={`${INPUT_CLS} h-9 w-28 font-sans`} />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      value={leg.text}
                      onChange={(e) => update(leg.id, { text: e.target.value })}
                      inputMode="decimal"
                      className={`${INPUT_CLS} h-9 w-28 ${bad ? 'border-rose-500/60' : ''}`}
                    />
                  </td>
                  <td className="py-2 pr-3 text-right text-zinc-400">{d ? pct(1 / d) : '—'}</td>
                  <td className="py-2 pr-3 text-right text-zinc-100">{result ? pct(result.fair[i]) : '—'}</td>
                  <td className="py-2 pr-3 text-right text-emerald-400">
                    {result ? `${formatOdds(1 / result.fair[i], 'american')} · ${(1 / result.fair[i]).toFixed(3)}` : '—'}
                  </td>
                  <td className="py-2 text-right text-rose-400/80">
                    {result && d ? pct(1 / d - result.fair[i]) : '—'}
                  </td>
                  <td className="py-2 pl-2 text-right">
                    <button
                      onClick={() => setLegs((ls) => ls.filter((l) => l.id !== leg.id))}
                      disabled={legs.length <= 2}
                      aria-label="Remove outcome"
                      className="rounded p-1 text-zinc-600 transition-colors hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => setLegs((ls) => [...ls, { id: nextId++, label: `Outcome ${ls.length + 1}`, text: '' }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
      >
        <Plus className="h-3.5 w-3.5" /> Add outcome
      </button>

      {result && (
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-zinc-800/60 pt-5 sm:grid-cols-4">
          <Stat label="Overround" value={pct(result.overround)} hint="Σ implied − 100%" />
          <Stat label="Book hold" value={pct(result.hold)} hint="expected take per $ wagered" />
          <Stat label="Total implied" value={pct(1 + result.overround)} />
          {result.param !== undefined && (
            <Stat
              label={method === 'shin' ? 'Insider share z' : 'Exponent k'}
              value={method === 'shin' ? pct(result.param) : result.param.toFixed(4)}
            />
          )}
        </dl>
      )}
    </Panel>
  );
}

export default function OddsConverter() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <header className="mb-10 max-w-3xl">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Calculator</span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
          Odds Converter &amp; <span className="text-violet-400">No-Vig</span> Fair Price
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Convert between American, decimal, fractional and implied-probability odds, then remove the
          bookmaker's margin from any two-way or multi-way market using the multiplicative, power, or Shin method.
        </p>
      </header>
      <div className="flex flex-col gap-6">
        <Converter />
        <NoVig />
      </div>
    </main>
  );
}
