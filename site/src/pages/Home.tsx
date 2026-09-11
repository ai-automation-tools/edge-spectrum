import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { TOOLS, type Tool, type Accent, type ToolStatus } from '../tools';

/** Concrete Tailwind classes per accent (kept literal so the JIT compiler emits them). */
const ACCENT: Record<Accent, { icon: string; corner: string; hoverBorder: string }> = {
  sky: { icon: 'text-sky-400 bg-sky-500/10 border-sky-500/20', corner: 'text-sky-500/25 group-hover:text-sky-500/50', hoverBorder: 'hover:border-sky-500/40' },
  emerald: { icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', corner: 'text-emerald-500/25 group-hover:text-emerald-500/50', hoverBorder: 'hover:border-emerald-500/40' },
  violet: { icon: 'text-violet-400 bg-violet-500/10 border-violet-500/20', corner: 'text-violet-500/25 group-hover:text-violet-500/50', hoverBorder: 'hover:border-violet-500/40' },
  amber: { icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20', corner: 'text-amber-500/25 group-hover:text-amber-500/50', hoverBorder: 'hover:border-amber-500/40' },
  rose: { icon: 'text-rose-400 bg-rose-500/10 border-rose-500/20', corner: 'text-rose-500/25 group-hover:text-rose-500/50', hoverBorder: 'hover:border-rose-500/40' },
  teal: { icon: 'text-teal-400 bg-teal-500/10 border-teal-500/20', corner: 'text-teal-500/25 group-hover:text-teal-500/50', hoverBorder: 'hover:border-teal-500/40' },
  cyan: { icon: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', corner: 'text-cyan-500/25 group-hover:text-cyan-500/50', hoverBorder: 'hover:border-cyan-500/40' },
};

const STATUS: Record<ToolStatus, { label: string; cls: string }> = {
  live: { label: 'Live', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  wip: { label: 'WIP', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  soon: { label: 'Soon', cls: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
};

function ToolCard({ tool }: { tool: Tool }) {
  const accent = ACCENT[tool.accent];
  const status = STATUS[tool.status];
  const Icon = tool.icon;

  const inner = (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 transition-all duration-200 hover:bg-zinc-900/70 ${accent.hoverBorder}`}
    >
      {/* decorative corner glyph */}
      <Icon
        className={`pointer-events-none absolute -right-4 -top-4 h-24 w-24 rotate-12 transition-colors duration-300 ${accent.corner}`}
        strokeWidth={1}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl border p-2.5 ${accent.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        {tool.tag && (
          <span className="mb-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">{tool.tag}</span>
        )}
        <h3 className="text-lg font-semibold tracking-tight text-zinc-100">{tool.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{tool.blurb}</p>
        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-zinc-300 transition-colors group-hover:text-zinc-100">
          Open <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  );

  // Route tools use client-side navigation; static/external use a full page load.
  if (tool.kind === 'route') {
    return (
      <Link to={tool.href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return (
    <a
      href={tool.href}
      target={tool.kind === 'external' ? '_blank' : undefined}
      rel={tool.kind === 'external' ? 'noopener noreferrer' : undefined}
      className="block h-full"
    >
      {inner}
    </a>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <header className="mb-14 max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800/60 bg-zinc-900/40 px-3 py-1 text-xs text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          Tools for sports, betting, investing &amp; odds
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 md:text-5xl">
          Edge <span className="text-sky-400">Spectrum</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
          A growing collection of interactive tools for analyzing edges across gambling, sports betting,
          and financial markets — visualizations, simulators, and calculators in one place.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link to="/backtester" className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-sky-400">Try the simulator</Link>
          <Link to="/setup" className="text-sm font-semibold text-zinc-300 hover:text-white">Create your own site →</Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}

        {/* Growth placeholder — signals the hub is expanding. Remove once the grid fills out. */}
        <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/60 p-6 text-center">
          <Sparkles className="mb-3 h-6 w-6 text-zinc-600" />
          <p className="text-sm font-medium text-zinc-400">More tools coming</p>
          <p className="mt-1 text-xs text-zinc-600">Kelly sizing, portfolio tools &amp; more</p>
        </div>
      </section>

      <footer className="mt-20 border-t border-zinc-800/60 pt-6 text-xs text-zinc-600">
        <a href="https://ai-automation-tools.dev" className="transition-colors hover:text-zinc-400">
          ai-automation-tools.dev
        </a>
      </footer>
    </main>
  );
}
