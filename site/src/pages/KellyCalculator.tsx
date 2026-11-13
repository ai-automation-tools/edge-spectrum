import { useRef, useState } from 'react';
import { Scale, Plus, X, Info, TrendingDown } from 'lucide-react';
import { type OddsFormat, FORMAT_LABEL, parseOdds, oddsError } from '../odds';
import { kellyFraction, edge, growthRate, drawdownChance, simultaneousKelly, MAX_SIMULTANEOUS } from '../kelly';
import { INPUT_CLS, pct, Select, Panel, Stat, PriceInput, FixPrices } from '../components/CalcUi';
import { PageHead, Accented } from '../components/ui';
import SiteFooter, { RgLine } from '../components/SiteFooter';

const FORMATS = Object.keys(FORMAT_LABEL) as OddsFormat[];
const MULTIPLES = { '1': 'Full Kelly', '0.5': 'Half Kelly', '0.25': 'Quarter Kelly', '0.1': 'Tenth Kelly' } as const;
type Multiple = keyof typeof MULTIPLES;
const LEVELS = [0.75, 0.5, 0.25];

interface Row { id: number; label: string; price: string; prob: string }

/** A win probability typed as a percent, or why it can't be one. */
function probError(text: string): string | null {
  const v = Number(text);
  if (!text.trim() || !Number.isFinite(v)) return 'Enter your win probability as a percent, e.g. 55.';
  if (v <= 0 || v >= 100) return 'A probability is between 0 and 100%, exclusive.';
  return null;
}

const money = (x: number) => `$${x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function KellyCalculator() {
  const [format, setFormat] = useState<OddsFormat>('american');
  const [multiple, setMultiple] = useState<Multiple>('0.5');
  const [bankroll, setBankroll] = useState('1000');
  const nextId = useRef(2);
  const [rows, setRows] = useState<Row[]>([{ id: 1, label: 'Bet 1', price: '-110', prob: '55' }]);

  const bets = rows.map((r) => {
    const d = parseOdds(r.price, format);
    return d === null || probError(r.prob) ? null : { p: Number(r.prob) / 100, d };
  });
  const complete = bets.every((b) => b !== null);
  const bank = Number(bankroll);
  const bankError = Number.isFinite(bank) && bank > 0 ? null : 'Enter a bankroll above zero.';
  const m = Number(multiple);
  const valid = complete ? (bets as NonNullable<(typeof bets)[number]>[]) : [];
  const together = valid.length > 1 ? simultaneousKelly(valid) : null;
  const single = valid.length === 1 ? valid[0] : null;
  const full = single ? kellyFraction(single) : 0;

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <>
    <main className="mx-auto max-w-5xl px-5 py-12 md:py-16">
      <PageHead
        eyebrow="Calculator · client-side"
        accent="teal"
        title={<>Kelly &amp; <Accented accent="teal">Bankroll</Accented> Sizing</>}
        lede="Enter the price and your honest estimate of the win probability. Kelly gives the stake that grows a bankroll fastest over many bets; most people stake a fraction of it, because a wrong estimate overbets and full Kelly's swings are large."
      >
        <RgLine />
      </PageHead>

      <div className="flex flex-col gap-6">
        <Panel icon={Scale} accent="teal" title="Bets" blurb={`One bet, or up to ${MAX_SIMULTANEOUS} independent bets settled at the same time.`}>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Odds format</span>
              <Select value={format} onChange={setFormat} options={FORMATS} labels={FORMAT_LABEL} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Stake</span>
              <Select value={multiple} onChange={setMultiple} options={Object.keys(MULTIPLES) as Multiple[]} labels={MULTIPLES} />
            </label>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="kelly-bankroll" className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Bankroll ($)</label>
              <PriceInput id="kelly-bankroll" error={bankError} value={bankroll} onChange={(e) => setBankroll(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm max-sm:min-w-[520px]">
              <thead>
                <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  <th className="pb-2 pr-3 font-medium">Bet</th>
                  <th className="pb-2 pr-3 font-medium">Price</th>
                  <th className="pb-2 pr-3 font-medium">Win prob (%)</th>
                  <th className="pb-2 pr-3 text-right font-medium">Edge</th>
                  <th className="pb-2 text-right font-medium">Full Kelly</th>
                  <th />
                </tr>
              </thead>
              <tbody className="font-mono">
                {rows.map((row, i) => {
                  const b = bets[i];
                  const name = row.label || `Bet ${i + 1}`;
                  return (
                    <tr key={row.id} className="border-t border-zinc-800/60">
                      <td className="py-2 pr-3">
                        <input aria-label={`Bet ${i + 1} name`} value={row.label} onChange={(e) => update(row.id, { label: e.target.value })} className={`${INPUT_CLS} h-9 w-28 font-sans`} />
                      </td>
                      <td className="py-2 pr-3 align-top">
                        <PriceInput aria-label={`${name} price`} error={oddsError(row.price, format)} value={row.price} onChange={(e) => update(row.id, { price: e.target.value })} className="h-9 w-24" />
                      </td>
                      <td className="py-2 pr-3 align-top">
                        <PriceInput aria-label={`${name} win probability`} error={probError(row.prob)} value={row.prob} onChange={(e) => update(row.id, { prob: e.target.value })} className="h-9 w-24" />
                      </td>
                      <td className={`py-2 pr-3 text-right ${b && edge(b) > 0 ? 'text-emerald-400' : 'text-rose-400/80'}`}>{b ? pct(edge(b)) : '—'}</td>
                      <td className="py-2 text-right text-zinc-100">{b ? pct(kellyFraction(b)) : '—'}</td>
                      <td className="py-2 pl-2 text-right">
                        <button
                          onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
                          disabled={rows.length <= 1}
                          aria-label="Remove bet"
                          className="rounded p-1 max-sm:p-2.5 text-zinc-600 transition-colors hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
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
            onClick={() => setRows((rs) => [...rs, { id: nextId.current++, label: `Bet ${rs.length + 1}`, price: '', prob: '' }])}
            disabled={rows.length >= MAX_SIMULTANEOUS}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add a simultaneous bet
          </button>
          {(!complete || bankError) && <FixPrices what="the stakes" />}
        </Panel>

        {complete && !bankError && single && (
          <Panel icon={TrendingDown} accent="teal" title="Your stake" blurb={full > 0 ? `${MULTIPLES[multiple]} of a ${money(bank)} bankroll.` : 'No edge at these numbers, so Kelly says not to bet.'}>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
              <Stat label="Stake" value={money(bank * full * m)} hint={`${pct(full * m)} of bankroll`} />
              <Stat label="Full Kelly" value={pct(full)} hint={money(bank * full)} />
              <Stat label="Edge" value={pct(edge(single))} hint="expected return per $1 staked" />
              <Stat label="Growth per bet" value={pct(growthRate(single, full * m), 3)} hint="expected log growth of the bankroll" />
              <Stat label="Growth vs. full Kelly" value={full > 0 ? pct(growthRate(single, full * m) / growthRate(single, full), 0) : '—'} hint="of the fastest possible" />
              <Stat label="Bets to double" value={full > 0 ? Math.ceil(Math.LN2 / growthRate(single, full * m)).toLocaleString() : '—'} hint="at the expected growth rate" />
            </dl>
            {full > 0 && <DrawdownTable selected={m} />}
          </Panel>
        )}

        {complete && !bankError && together && (
          <Panel icon={TrendingDown} accent="teal" title="Stakes when settled together" blurb={`${MULTIPLES[multiple]} of the stakes that maximise expected log growth across every win and loss combination, treating the bets as independent.`}>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="text-left font-sans text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    <th className="pb-2 pr-3 font-medium">Bet</th>
                    <th className="pb-2 pr-3 text-right font-medium">Alone</th>
                    <th className="pb-2 pr-3 text-right font-medium">Together</th>
                    <th className="pb-2 text-right font-medium">Stake</th>
                  </tr>
                </thead>
                <tbody>
                  {together.map((f, i) => (
                    <tr key={rows[i].id} className="border-t border-zinc-800/60">
                      <td className="py-1.5 pr-3 font-sans text-zinc-300">{rows[i].label || `Bet ${i + 1}`}</td>
                      <td className="py-1.5 pr-3 text-right text-zinc-400">{pct(kellyFraction(valid[i]))}</td>
                      <td className="py-1.5 pr-3 text-right text-zinc-100">{pct(f)}</td>
                      <td className="py-1.5 text-right text-emerald-400">{money(bank * f * m)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-zinc-700">
                    <td className="py-1.5 pr-3 font-sans text-zinc-300">Total</td>
                    <td />
                    <td className="py-1.5 pr-3 text-right text-zinc-100">{pct(together.reduce((a, f) => a + f, 0))}</td>
                    <td className="py-1.5 text-right text-emerald-400">{money(bank * m * together.reduce((a, f) => a + f, 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-5 flex gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400/70" />
              Bets that settle together share one bankroll, so each gets less than it would alone. Correlated bets,
              such as legs of the same game, need less still; this treats them as independent.
            </p>
          </Panel>
        )}

        <p className="flex gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400/70" />
          Kelly is only as good as the probability you type. Against a fair book price the edge is negative and
          the answer is to bet nothing; the stake appears only when your estimate beats the price.
        </p>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}

/** How likely the bankroll is ever to fall to each level, by Kelly multiple (Thorp's approximation). */
function DrawdownTable({ selected }: { selected: number }) {
  const multiples = [...new Set([1, 0.5, 0.25, selected, 2])].sort((a, b) => b - a);
  return (
    <div className="mt-6 border-t border-zinc-800/60 pt-5">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Chance the bankroll ever falls to…</p>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="text-left font-sans text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="pb-2 pr-3 font-medium">Stake</th>
              {LEVELS.map((l) => <th key={l} className="pb-2 pr-3 text-right font-medium">{pct(l, 0)}</th>)}
            </tr>
          </thead>
          <tbody>
            {multiples.map((k) => (
              <tr key={k} className={`border-t border-zinc-800/60 ${k === selected ? 'text-zinc-100' : 'text-zinc-400'}`}>
                <td className="py-1.5 pr-3 font-sans">{k}× Kelly{k === selected ? ' (yours)' : ''}</td>
                {LEVELS.map((l) => <td key={l} className="py-1.5 pr-3 text-right">{pct(drawdownChance(l, k), 1)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">Staking a fraction of the bankroll never reaches zero, so the drawdown is the risk to read. At 2× Kelly every drawdown is certain and growth is about zero.</p>
    </div>
  );
}
