import React from 'react';
import { ORG_URL, REPOSITORY_URL, SITE_URL } from '../projectLinks';

/** Help lines named in the responsible-gambling notice. Each is free and confidential. */
const HELPLINES: { label: string; href: string }[] = [
  { label: 'US 1-800-GAMBLER', href: 'tel:1-800-426-2537' },
  { label: 'UK 0808 8020 133', href: 'tel:08088020133' },
  { label: 'AU 1800 858 858', href: 'tel:1800858858' },
  { label: 'Worldwide: GamblingTherapy.org', href: 'https://www.gamblingtherapy.org/' },
];

const linkProps = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {});

/**
 * The age and help-line line under each betting tool's heading (audit UX-19), so the notice is
 * seen before the tool, not only past it in the footer. The footer keeps the full notice.
 */
export function RgLine() {
  const [us, , , world] = HELPLINES;
  return (
    <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
      18+ (21+ where you live). Gambling problem? Free, confidential help:{' '}
      {[us, world].map((h, i) => (
        <React.Fragment key={h.href}>
          {i > 0 && ' · '}
          <a href={h.href} {...linkProps(h.href)} className="underline underline-offset-2 hover:text-zinc-200">{h.label}</a>
        </React.Fragment>
      ))}
    </p>
  );
}

/**
 * The shared footer: domain, the org links, the consent hooks every sibling site carries,
 * and the responsible-gambling / not-advice notice. Every route renders it, so a new tool
 * page inherits the notice by rendering <SiteFooter /> — do not add a per-page copy.
 */
export default function SiteFooter({ note }: { note?: React.ReactNode }) {
  return (
    <footer className="border-t border-zinc-800/60 py-7 pb-10 text-[13.5px] text-zinc-500">
      <div className="mx-auto max-w-[1120px] px-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          {SITE_URL && <span className="font-mono">{new URL(SITE_URL).host}</span>}
          <div className="ml-auto flex flex-wrap gap-[18px]">
            <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-zinc-300">GitHub</a>
            {/* The org's notice and its consent script ship only with the original (projectLinks.ts). */}
            {ORG_URL && (
              <>
                <a href={ORG_URL} className="transition-colors hover:text-zinc-300">{new URL(ORG_URL).host}</a>
                <a href={`${ORG_URL}/cookies.html`} className="transition-colors hover:text-zinc-300">Cookies</a>
                <a href="#" data-ail-consent="manage" className="transition-colors hover:text-zinc-300">Cookie settings</a>
              </>
            )}
          </div>
        </div>
        {note && <p className="mt-3.5 text-xs leading-relaxed text-zinc-600">{note}</p>}
        <p className="mt-3.5 text-[13px] leading-relaxed text-zinc-400">
          For education only — not investment, financial or betting advice. Gambling is for adults (18+ or 21+ where you live)
          and most wagers here lose money over time. Gambling problem? Free, confidential help:{' '}
          {HELPLINES.map((h, i) => (
            <React.Fragment key={h.href}>
              {i > 0 && ' · '}
              <a href={h.href} {...linkProps(h.href)} className="text-zinc-300 underline underline-offset-2 transition-colors hover:text-zinc-100">{h.label}</a>
            </React.Fragment>
          ))}
          .
        </p>
      </div>
    </footer>
  );
}
