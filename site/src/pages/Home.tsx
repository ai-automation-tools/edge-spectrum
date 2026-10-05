import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, FlaskConical, Scale, KeyRound, BookOpen } from 'lucide-react';
import { TOOLS, type Tool, type ToolStatus } from '../tools';
import { EDGES } from '../data/edges';
import { MIN_SEASON, MAX_SEASON } from '../strategyBounds';
import { METHOD_LABEL } from '../odds';
import { REPOSITORY_URL } from '../projectLinks';
import { Card, Reveal, Eyebrow, SectionHead, GithubMark } from '../components/ui';
import SpectrumStrip from '../components/SpectrumStrip';
import SiteFooter from '../components/SiteFooter';

const STATUS: Record<ToolStatus, { label: string; c: string }> = {
  live: { label: 'Live', c: '#34d399' },
  wip: { label: 'WIP', c: '#fbbf24' },
  soon: { label: 'Soon', c: '#71717a' },
};
const KIND_LABEL = { route: 'in app', static: 'static page', external: 'external' } as const;

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const Icon = tool.icon;
  const status = STATUS[tool.status];
  const body = (
    <Card accent={tool.accent} className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2.5 p-5 pb-4">
        <div className="flex items-center justify-between gap-2.5">
          <span className="kind"><i />{tool.tag ?? 'Tool'}</span>
          <span className="glyph"><Icon className="h-5 w-5" strokeWidth={1.6} /></span>
        </div>
        <h3 className="text-lg font-semibold tracking-[-0.015em] text-zinc-100">{tool.title}</h3>
        <p className="text-sm leading-[1.55] text-zinc-400">{tool.blurb}</p>
        <div className="mt-0.5 flex flex-wrap gap-1.5">
          <span className="tag" style={{ color: status.c, borderColor: `${status.c}4d` }}>{status.label}</span>
          <span className="tag">{KIND_LABEL[tool.kind]}</span>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-zinc-800/60 px-5 py-3">
        <span className="btn btn-sm btn-accent">Open <ArrowUpRight className="h-3.5 w-3.5" /></span>
        <span className="font-mono text-[11px] text-zinc-600">{tool.href}</span>
      </div>
    </Card>
  );
  const cls = 'block h-full';
  return (
    <Reveal delay={index * 0.06} className="h-full">
      {tool.kind === 'route' ? (
        <Link to={tool.href} className={cls}>{body}</Link>
      ) : (
        <a href={tool.href} target={tool.kind === 'external' ? '_blank' : undefined} rel={tool.kind === 'external' ? 'noopener noreferrer' : undefined} className={cls}>{body}</a>
      )}
    </Reveal>
  );
}

export default function Home() {
  const seasons = MAX_SEASON - MIN_SEASON + 1;
  const methods = Object.keys(METHOD_LABEL).length;
  const spectrum = TOOLS.find((t) => t.slug === 'spectrum');
  const live = TOOLS.filter((t) => t.status === 'live').length;

  return (
    <>
      <div className="glow" aria-hidden="true" />
      <main className="relative z-[1] mx-auto max-w-[1120px] px-5">
        {/* ── Hero ── */}
        <div className="grid items-center gap-9 py-14 md:grid-cols-[1.02fr_.98fr] md:gap-12 md:py-20 md:pb-10">
          <div className="min-w-0">
            <Eyebrow><b>Open source</b> · {TOOLS.length} tools · {live} live · Apache-2.0 · no telemetry</Eyebrow>
            <h1 className="mt-[18px] text-[clamp(34px,4.6vw,52px)] font-bold leading-[1.04] tracking-[-0.035em] text-zinc-100 [text-wrap:balance]">
              See where the edge <span className="h-grad">actually</span> is.
            </h1>
            <p className="mt-5 max-w-[54ch] text-[16.5px] leading-relaxed text-zinc-400">
              Tools for pricing a bet or an asset honestly: a visualizer of expected returns across
              {' '}<b className="font-medium text-zinc-200">{EDGES.length} activities</b>, a simulator that backtests wagering strategies over
              {' '}<b className="font-medium text-zinc-200">{seasons} synthetic seasons</b>, and calculators that strip the bookmaker's margin.
            </p>
            <p className="mt-3.5 max-w-[54ch] text-[13px] text-zinc-500">
              The simulator's games are synthetic and priced from their own distribution, so the book's hold is the only edge in the data. A strategy that wins here is noise, which is the point.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link to="/backtester" className="btn btn-primary">
                <FlaskConical className="h-[15px] w-[15px]" /> Try the simulator
              </Link>
              <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-gh">
                <GithubMark className="h-[15px] w-[15px]" /> Source on GitHub
              </a>
              <Link to="/setup" className="btn btn-ghost">Create your own site</Link>
            </div>
          </div>
          <SpectrumStrip href={spectrum?.href ?? '/spectrum/index.html'} />
        </div>

        {/* ── Fact strip ── */}
        <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-xl border border-zinc-800/60 bg-[#0a0a0c]/60 px-3 py-2.5" role="list" aria-label="At a glance">
          <span className="px-1.5 font-mono text-[11px] uppercase tracking-[.12em] text-zinc-500">At a glance</span>
          <a role="listitem" href="/spectrum/index.html" className="pill" style={{ ['--c' as string]: '#38bdf8' }}><i className="dot" />{EDGES.length} activities · 7 horizons</a>
          <Link role="listitem" to="/backtester" className="pill" style={{ ['--c' as string]: '#34d399' }}><i className="dot" />{seasons} simulated seasons · 4 sports</Link>
          <Link role="listitem" to="/odds" className="pill" style={{ ['--c' as string]: '#a78bfa' }}><i className="dot" />{methods} de-vig methods</Link>
          <Link role="listitem" to="/parlay" className="pill" style={{ ['--c' as string]: '#fbbf24' }}><i className="dot" />parlay hold, leg by leg</Link>
          <span className="ml-auto pr-1 font-mono text-[11px] text-zinc-600">runs in the browser · AI advisor on your own instance</span>
        </div>

        {/* ── Tools ── */}
        <section id="tools" className="scroll-mt-[72px] border-t border-zinc-800/60 py-14">
          <Reveal>
            <SectionHead eyebrow="Tools" title="One card per tool. Open it, or read it." sub="Every tool runs client-side on this page or in a Vercel function with no key of yours. Each one is a registry entry and a page; the hub grows one card at a time." />
          </Reveal>
          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool, i) => <ToolCard key={tool.slug} tool={tool} index={i} />)}
            <Reveal delay={TOOLS.length * 0.06} className="h-full">
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800/80 p-6 text-center">
                <Sparkles className="mb-3 h-5 w-5 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">More tools coming</p>
                <p className="mt-1 font-mono text-[11px] text-zinc-600">Kelly sizing · portfolio tools</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Principles ── */}
        <section id="about" className="scroll-mt-[72px] border-t border-zinc-800/60 py-14">
          <div className="grid gap-7 md:grid-cols-[1.3fr_1fr] md:gap-12">
            <Reveal>
              <SectionHead eyebrow="How it is built" title="Honest measures, synthetic games, your own keys." />
              <div className="mt-[18px] grid gap-2.5">
                {[
                  { icon: Scale, title: 'Three measures, never one axis', text: 'Return on capital is floored at −100%; expected turnover cost is deliberately unbounded; the ruin point says when the bankroll hits zero. They agree by construction and are never plotted together.' },
                  { icon: FlaskConical, title: 'Simulated by design', text: `Every market in the ${seasons}-season simulator is priced from the distribution its scores are drawn from, so no strategy is +EV by construction. Every run reports breakeven, a Wilson interval and a p-value.` },
                  { icon: KeyRound, title: 'Your keys stay yours', text: 'The public demo holds no Gemini credentials and serves sample advice. Deploy your own copy, add a key and a passcode, and the advisor goes live on your instance only.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="panel flex items-start gap-3 px-3.5 py-3">
                    <Icon className="mt-0.5 h-[18px] w-[18px] flex-none text-sky-400" strokeWidth={1.6} />
                    <div>
                      <b className="block text-sm font-semibold text-zinc-100">{title}</b>
                      <span className="text-[13.5px] leading-relaxed text-zinc-400">{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Card accent="sky" still className="p-5">
                <Eyebrow>Read on</Eyebrow>
                {[
                  { href: `${REPOSITORY_URL}/blob/main/Docs/methodology.md`, title: 'Methodology', sub: 'The DU/CED framework and the three measures' },
                  { href: `${REPOSITORY_URL}/blob/main/Docs/data-architecture.md`, title: 'Data architecture', sub: `How the ${EDGES.length} records flow to every copy` },
                  { href: `${REPOSITORY_URL}/blob/main/Docs/change_log.md`, title: 'Change log', sub: 'What changed, with the measurements' },
                  { href: REPOSITORY_URL, title: 'github.com/ai-automation-tools/edge-spectrum', sub: 'Source for everything on this page' },
                ].map((l, i) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`group flex items-start gap-3 py-3 text-zinc-200 ${i ? 'border-t border-zinc-800/60' : 'pt-2'}`}>
                    <BookOpen className="mt-[3px] h-4 w-4 flex-none text-zinc-500" strokeWidth={1.6} />
                    <span><b className="block font-medium group-hover:text-white">{l.title}</b><small className="text-[12.5px] text-zinc-500">{l.sub}</small></span>
                  </a>
                ))}
              </Card>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter note="Nothing here is a recommendation to bet or invest. The simulator uses synthetic games; the Spectrum page documents its sources and measures." />
    </>
  );
}
