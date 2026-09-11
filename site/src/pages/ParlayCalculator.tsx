import React, { useState } from 'react';
import { Layers, Plus, X, Info, TrendingDown } from 'lucide-react';
import {
  type OddsFormat, type DevigMethod, FORMAT_LABEL, METHOD_LABEL,
  parseOdds, formatOdds, devig, parlay,
} from '../odds';
import { INPUT_CLS, pct, Select, Panel, Stat } from '../components/CalcUi';

const FORMATS = Object.keys(FORMAT_LABEL) as OddsFormat[];
const METHODS = Object.keys(METHOD_LABEL) as DevigMethod[];

interface Leg { id: number; label: string; side: string; other: string }
let nextId = 4;

const price = (d: number) => `${formatOdds(d, 'american')} · ${d.toFixed(3)}`;

export default function ParlayCalculator() {
  const [format, setFormat] = useState<OddsFormat>('american');
  const [method, setMethod] = useState<DevigMethod>('multiplicative');
  const [quoted, setQuoted] = useState('');
  const [legs, setLegs] = useState<Leg[]>([
    { id: 1, label: 'Leg 1', side: '-110', other: '-110' },
    { id: 2, label: 'Leg 2', side: '-110', other: '-110' },
    { id: 3, label: 'Leg 3', side: '-110', other: '-110' },
  ]);

  // Each leg is a two-way market: de-vig it to get the fair probability of the side taken.
  const parsed = legs.map((l) => {
    const side = parseOdds(l.side, format);
    const other = parseOdds(l.other, format);
    if (side === null || other === null) return null;
    const r = devig([side, other], method);
    return { decimal: side, fair: r.fair[0], implied: r.implied[0], legHold: r.hold };
  });
  const complete = parsed.every((p) => p !== null);
  const quotedDecimal = parseOdds(quoted, format);
  const quotedBad = quoted.trim() !== '' && quotedDecimal === null;
  const result = complete ? parlay(parsed as NonNullable<typeof parsed[number]>[], quotedDecimal ?? undefined) : null;
  // Running view: how the hold grows as legs are added (always at the naive product price).
  const ladder = complete
    ? parsed.map((_, k) => parlay((parsed as NonNullable<typeof parsed[number]>[]).slice(0, k + 1)))
    : [];
  const avgLegHold = complete ? parsed.reduce((a, p) => a + p!.legHold, 0) / parsed.length : 0;

  const update = (id: number, patch: Partial<Leg>) =>
    setLegs((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <header className="mb-10 max-w-3xl">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Calculator</span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
          Parlay &amp; <span className="text-amber-400">SGP</span> Hold Calculator
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Enter both sides of each leg. Each leg is de-vigged to its fair probability, the legs are
          multiplied into a true joint probability, and that is compared with what the book pays. The gap
          is the parlay's hold, and it grows with every leg.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <Panel
          icon={Layers}
          accent="amber"
          title="Legs"
          blurb="Your side is the price you're taking; the other side is the opposite price on the same market, used to strip the vig."
        >
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Odds format</span>
              <Select value={format} onChange={setFormat} options={FORMATS} labels={FORMAT_LABEL} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">De-vig method</span>
              <Select value={method} onChange={setMethod} options={METHODS} labels={METHOD_LABEL} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Book's quoted parlay price</span>
              <input
                value={quoted}
                onChange={(e) => setQuoted(e.target.value)}
                placeholder="optional"
                inputMode="decimal"
                className={`${INPUT_CLS} ${quotedBad ? 'border-rose-500/60' : ''}`}
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  <th className="pb-2 pr-3 font-medium">Leg</th>
                  <th className="pb-2 pr-3 font-medium">Your side</th>
                  <th className="pb-2 pr-3 font-medium">Other side</th>
                  <th className="pb-2 pr-3 text-right font-medium">Implied</th>
                  <th className="pb-2 pr-3 text-right font-medium">Fair prob</th>
                  <th className="pb-2 text-right font-medium">Leg hold</th>
                  <th />
                </tr>
              </thead>
              <tbody className="font-mono">
                {legs.map((leg, i) => {
                  const p = parsed[i];
                  const badSide = leg.side.trim() !== '' && parseOdds(leg.side, format) === null;
                  const badOther = leg.other.trim() !== '' && parseOdds(leg.other, format) === null;
                  return (
                    <tr key={leg.id} className="border-t border-zinc-800/60">
                      <td className="py-2 pr-3">
                        <input value={leg.label} onChange={(e) => update(leg.id, { label: e.target.value })} className={`${INPUT_CLS} h-9 w-28 font-sans`} />
                      </td>
                      <td className="py-2 pr-3">
                        <input value={leg.side} onChange={(e) => update(leg.id, { side: e.target.value })} inputMode="decimal" className={`${INPUT_CLS} h-9 w-24 ${badSide ? 'border-rose-500/60' : ''}`} />
                      </td>
                      <td className="py-2 pr-3">
                        <input value={leg.other} onChange={(e) => update(leg.id, { other: e.target.value })} inputMode="decimal" className={`${INPUT_CLS} h-9 w-24 ${badOther ? 'border-rose-500/60' : ''}`} />
                      </td>
                      <td className="py-2 pr-3 text-right text-zinc-400">{p ? pct(p.implied) : '—'}</td>
                      <td className="py-2 pr-3 text-right text-zinc-100">{p ? pct(p.fair) : '—'}</td>
                      <td className="py-2 text-right text-rose-400/80">{p ? pct(p.legHold) : '—'}</td>
                      <td className="py-2 pl-2 text-right">
                        <button
                          onClick={() => setLegs((ls) => ls.filter((l) => l.id !== leg.id))}
                          disabled={legs.length <= 1}
                          aria-label="Remove leg"
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
            onClick={() => setLegs((ls) => [...ls, { id: nextId++, label: `Leg ${ls.length + 1}`, side: '', other: '' }])}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add leg
          </button>
        </Panel>

        {result && (
          <Panel
            icon={TrendingDown}
            accent="amber"
            title="True odds vs. the book"
            blurb={quotedDecimal ? "Using the book's quoted parlay price." : 'Book price is the product of the leg prices — the standard parlay payout.'}
          >
            <dl className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
              <Stat label="True joint probability" value={pct(result.jointProb)} hint="Π fair leg probabilities" />
              <Stat label="Fair parlay price" value={price(result.fairDecimal)} />
              <Stat label="Book parlay price" value={price(result.bookDecimal)} hint={`implies ${pct(1 / result.bookDecimal)}`} />
              <Stat label="Parlay hold" value={pct(result.hold)} hint={`EV ${result.ev >= 0 ? '+' : '−'}$${Math.abs(result.ev * 100).toFixed(2)} per $100`} />
              <Stat label="Avg single-leg hold" value={pct(avgLegHold)} hint="what one straight bet costs" />
              <Stat label="Margin multiplier" value={avgLegHold > 0 ? `${(result.hold / avgLegHold).toFixed(2)}×` : '—'} hint="parlay hold ÷ single-leg hold" />
            </dl>

            {ladder.length > 1 && (
              <div className="mt-6 border-t border-zinc-800/60 pt-5">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">How the hold compounds</p>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-sans font-medium uppercase tracking-wider text-zinc-500">
                        <th className="pb-2 pr-3 font-medium">Legs</th>
                        <th className="pb-2 pr-3 text-right font-medium">True prob</th>
                        <th className="pb-2 pr-3 text-right font-medium">Fair price</th>
                        <th className="pb-2 pr-3 text-right font-medium">Book price</th>
                        <th className="pb-2 text-right font-medium">Hold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ladder.map((r, k) => (
                        <tr key={k} className="border-t border-zinc-800/60">
                          <td className="py-1.5 pr-3 text-zinc-300">{k + 1}</td>
                          <td className="py-1.5 pr-3 text-right text-zinc-100">{pct(r.jointProb)}</td>
                          <td className="py-1.5 pr-3 text-right text-emerald-400">{formatOdds(r.fairDecimal, 'american')}</td>
                          <td className="py-1.5 pr-3 text-right text-zinc-400">{formatOdds(r.bookDecimal, 'american')}</td>
                          <td className="py-1.5 text-right text-rose-400/80">{pct(r.hold)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="mt-5 flex gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" />
              Legs are treated as independent. Same-game parlay legs are usually correlated, so the true joint
              probability can be higher (positively correlated legs) or lower than shown — which is exactly why
              books quote SGPs at prices that differ from the product of the legs. Paste the quoted price above to
              measure the hold against what you'd actually be paid.
            </p>
          </Panel>
        )}
      </div>
    </main>
  );
}
