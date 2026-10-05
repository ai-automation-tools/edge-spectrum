import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { Accent } from '../tools';
import { Card } from './ui';

/** Shared building blocks for the standalone calculator pages. */

export const INPUT_CLS =
  'h-10 w-full rounded-lg border border-zinc-800 bg-[#0a0a0c] px-3 font-mono text-sm text-zinc-100 transition-all hover:border-zinc-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20';
const SELECT_CLS =
  'peer h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-[#0a0a0c] pl-3 pr-9 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer';

export const pct = (p: number, dp = 2) => `${(p * 100).toFixed(dp)}%`;

export function Select<T extends string>({
  value, onChange, options, labels,
}: { value: T; onChange: (v: T) => void; options: T[]; labels: Record<T, string> }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={SELECT_CLS}>
        {options.map((o) => <option key={o} value={o}>{labels[o]}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 peer-focus:text-sky-400" />
    </div>
  );
}

export function Panel({ icon: Icon, title, blurb, accent = 'violet', children }: {
  icon: React.ElementType; title: string; blurb: string; accent?: Accent; children: React.ReactNode;
}) {
  return (
    <Card accent={accent} still className="p-6">
      <section>
        <div className="mb-5 flex items-start gap-3">
          <span className="glyph"><Icon className="h-5 w-5" strokeWidth={1.6} /></span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{blurb}</p>
          </div>
        </div>
        {children}
      </section>
    </Card>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-[#060606]/50 px-3 py-2.5">
      <dt className="font-mono text-[10.5px] uppercase tracking-[.1em] text-zinc-500">{label}</dt>
      <dd className="mt-0.5 font-mono text-[17px] text-zinc-100">{value}</dd>
      {hint && <dd className="text-[11px] text-zinc-600">{hint}</dd>}
    </div>
  );
}
