import React from 'react';
import { REPOSITORY_URL } from '../projectLinks';

/** The shared footer: domain, the org links, and the consent hooks every sibling site carries. */
export default function SiteFooter({ note }: { note?: React.ReactNode }) {
  return (
    <footer className="border-t border-zinc-800/60 py-7 pb-10 text-[13.5px] text-zinc-500">
      <div className="mx-auto max-w-[1120px] px-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <span className="font-mono">edge-spectrum.ai-automation-tools.dev</span>
          <div className="ml-auto flex flex-wrap gap-[18px]">
            <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-300">GitHub</a>
            <a href="https://ai-automation-tools.dev" className="transition-colors hover:text-zinc-300">ai-automation-tools.dev</a>
            <a href="https://ai-automation-tools.dev/cookies.html" className="transition-colors hover:text-zinc-300">Cookies</a>
            <a href="#" data-ail-consent="manage" className="transition-colors hover:text-zinc-300">Cookie settings</a>
          </div>
        </div>
        {note && <p className="mt-3.5 text-xs leading-relaxed text-zinc-600">{note}</p>}
      </div>
    </footer>
  );
}
