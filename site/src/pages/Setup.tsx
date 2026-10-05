import React from 'react';
import { ArrowUpRight, Rocket, KeyRound, SlidersHorizontal } from 'lucide-react';
import { DEPLOY_URL, REPOSITORY_URL, SETUP_GUIDE_URL } from '../projectLinks';
import { Card, Reveal, Eyebrow, GithubMark } from '../components/ui';
import SiteFooter from '../components/SiteFooter';

export default function Setup() {
  return (
    <>
      <div className="glow" aria-hidden="true" />
      <main className="relative z-[1] mx-auto max-w-[1120px] px-5 py-12 md:py-20">
        <Reveal>
          <Eyebrow><b>Open source</b> · Apache-2.0 · deploy in minutes</Eyebrow>
          <h1 className="mt-[18px] text-[clamp(34px,4.6vw,52px)] font-bold leading-[1.04] tracking-[-0.035em] text-zinc-100 [text-wrap:balance]">
            Your own <span className="h-grad">Edge Spectrum</span>.
          </h1>
          <p className="mt-5 max-w-[54ch] text-[16.5px] leading-relaxed text-zinc-400">
            Keep every tool. Add live AI advice. Customize the site and run it on your own account.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a href={DEPLOY_URL} className="btn btn-primary"><Rocket className="h-[15px] w-[15px]" /> Deploy your own</a>
            <a href={REPOSITORY_URL} className="btn btn-gh"><GithubMark className="h-[15px] w-[15px]" /> Get the source</a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <Card accent="sky" still className="mt-12 overflow-hidden" aria-label="Demo and full instance comparison">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 border-b border-zinc-800/60 bg-[#0c0c0f]/60 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[.12em] text-zinc-500">
              <span>Feature</span><span>Public demo</span><span>Your instance</span>
            </div>
            {[
              ['Spectrum & odds calculators', 'Interactive', 'Full access'],
              ['26-season synthetic backtester', 'Interactive', 'Full access'],
              ['ESPN scoreboard', 'Live feed', 'Live feed'],
              ['AI strategy advisor', 'Sample responses', 'Live Gemini advice'],
              ['Branding & source code', 'Explore', 'Customize'],
            ].map(([feature, demo, full]) => (
              <div key={feature} className="grid grid-cols-[2fr_1fr_1fr] gap-3 border-b border-zinc-800/60 px-5 py-3.5 text-xs last:border-0 sm:text-sm">
                <span className="text-zinc-200">{feature}</span><span className="text-zinc-500">{demo}</span><span className="text-sky-300">{full}</span>
              </div>
            ))}
          </Card>
        </Reveal>

        <section className="mt-12 grid gap-3.5 sm:grid-cols-3" aria-label="Setup steps">
          {[
            { icon: GithubMark, title: '1. Create your copy', text: 'Use Deploy your own for a Vercel-ready copy, or use the GitHub template for the complete repository. On a full-repo import, set the Root Directory to site.' },
            { icon: KeyRound, title: '2. Enable live AI', text: 'Set EDGE_SPECTRUM_MODE to full. Add your Gemini key, a private advisor passcode, and a random signing secret in your hosting account.' },
            { icon: SlidersHorizontal, title: '3. Make it yours', text: 'Deploy, open the backtester, and unlock the advisor with your passcode. Change the branding, dataset, and tools whenever you like.' },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={0.1 + i * 0.06} className="h-full">
              <Card accent="sky" className="h-full p-5">
                <span className="glyph mb-4"><Icon className="h-5 w-5" /></span>
                <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
              </Card>
            </Reveal>
          ))}
        </section>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-zinc-500">
          Your API key stays on your server. Hosting and Gemini usage belong to your account; the demo never asks for your key.
          The backtester uses synthetic games, so results do not establish a real-world betting edge.
        </p>
        <a href={SETUP_GUIDE_URL} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-400 hover:text-sky-200">
          Full setup guide, including local development <ArrowUpRight className="h-4 w-4" />
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
