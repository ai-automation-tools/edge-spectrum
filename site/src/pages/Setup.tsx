import React from 'react';
import { ArrowUpRight, Github, Rocket, KeyRound, SlidersHorizontal } from 'lucide-react';
import { DEPLOY_URL, REPOSITORY_URL, SETUP_GUIDE_URL } from '../projectLinks';

export default function Setup() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-sky-400">Open source · Apache 2.0</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Your own Edge Spectrum.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
        Keep every tool. Add live AI advice. Customize the site and run it on your own account.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={DEPLOY_URL} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-sky-400">
          <Rocket className="h-4 w-4" /> Deploy your own
        </a>
        <a href={REPOSITORY_URL} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500">
          <Github className="h-4 w-4" /> Get the source
        </a>
      </div>
      <section className="mt-12 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40" aria-label="Demo and full instance comparison">
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 border-b border-zinc-800 px-5 py-4 text-xs font-semibold text-zinc-400 sm:text-sm">
          <span>Feature</span><span>Public demo</span><span>Your instance</span>
        </div>
        {[
          ['Spectrum & odds calculators', 'Interactive', 'Full access'],
          ['26-season synthetic backtester', 'Interactive', 'Full access'],
          ['ESPN scoreboard', 'Live feed', 'Live feed'],
          ['AI strategy advisor', 'Sample responses', 'Live Gemini advice'],
          ['Branding & source code', 'Explore', 'Customize'],
        ].map(([feature, demo, full]) => (
          <div key={feature} className="grid grid-cols-[2fr_1fr_1fr] gap-3 border-b border-zinc-800/60 px-5 py-4 text-xs last:border-0 sm:text-sm">
            <span className="text-zinc-200">{feature}</span><span className="text-zinc-500">{demo}</span><span className="text-sky-300">{full}</span>
          </div>
        ))}
      </section>
      <section className="mt-12 grid gap-6 sm:grid-cols-3" aria-label="Setup steps">
        {[
          { icon: Github, title: '1. Create your copy', text: 'Use Deploy your own for a Vercel-ready copy, or use the GitHub template for the complete repository. On a full-repo import, set the Root Directory to site.' },
          { icon: KeyRound, title: '2. Enable live AI', text: 'Set EDGE_SPECTRUM_MODE to full. Add your Gemini key, a private advisor passcode, and a random signing secret in your hosting account.' },
          { icon: SlidersHorizontal, title: '3. Make it yours', text: 'Deploy, open the backtester, and unlock the advisor with your passcode. Change the branding, dataset, and tools whenever you like.' },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-2xl border border-zinc-800 p-5">
            <Icon className="mb-4 h-5 w-5 text-sky-400" />
            <h2 className="text-sm font-semibold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
          </article>
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
  );
}
