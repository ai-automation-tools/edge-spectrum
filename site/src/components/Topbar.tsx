import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { TOOLS } from '../tools';
import { REPOSITORY_URL } from '../projectLinks';
import { GithubMark, Mark } from './ui';

/**
 * The persistent hub bar. One link per tool from the registry plus Setup, a sliding
 * indicator under the active route, the ⌘K trigger, the GitHub button and a mobile sheet.
 */
export default function Topbar({ onPalette }: { onPalette: () => void }) {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [ind, setInd] = useState<{ left: number; width: number; on: boolean }>({ left: 0, width: 0, on: false });
  const [open, setOpen] = useState(false);

  const items = [
    ...TOOLS.map((t) => ({ key: t.slug, label: t.title.split(' ')[0] === 'The' ? 'Spectrum' : t.title.split(/ &| and /)[0].replace(' Simulator', '').replace(' Converter', ''), href: t.href, kind: t.kind })),
    { key: 'setup', label: 'Your own site', href: '/setup', kind: 'route' as const },
  ];
  const activeKey = items.find((i) => i.kind === 'route' && (i.href === '/' ? pathname === '/' : pathname.startsWith(i.href)))?.key ?? null;

  useEffect(() => {
    const place = () => {
      const nav = navRef.current; if (!nav) return;
      const a = nav.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
      if (!a) { setInd((s) => ({ ...s, on: false })); return; }
      const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      setInd({ left: r.left - nr.left + 11, width: r.width - 22, on: true });
    };
    place();
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [activeKey]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const linkCls = (active: boolean) =>
    `relative rounded-md px-[11px] py-1.5 text-[13.5px] transition-colors ${active ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`;

  return (
    <header className="topbar">
      <div className="mx-auto flex h-full max-w-[1120px] items-center gap-3.5 px-5">
        <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-100" aria-label="Edge Spectrum home">
          <Mark />
          Edge <span className="text-sky-400">Spectrum</span>
        </Link>
        <nav ref={navRef} className="relative ml-3 hidden items-center gap-0.5 md:flex" aria-label="Tools">
          {items.map((i) =>
            i.kind === 'route' ? (
              <Link key={i.key} to={i.href} data-key={i.key} className={linkCls(activeKey === i.key)}>{i.label}</Link>
            ) : (
              <a key={i.key} href={i.href} data-key={i.key} className={linkCls(false)}>{i.label}</a>
            ),
          )}
          <span className="nav-ind" style={{ left: ind.left, width: ind.width, opacity: ind.on ? 1 : 0 }} aria-hidden="true" />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onPalette}
            className="hidden h-8 items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/40 pl-3 pr-2.5 text-[13px] text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300 md:inline-flex"
            aria-label="Open command palette"
          >
            Jump to… <kbd className="key">⌘K</kbd>
          </button>
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-700/80 px-3 text-[13px] font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900/70"
          >
            <GithubMark className="h-[15px] w-[15px]" />
            <span className="hidden md:inline">GitHub</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/80 text-zinc-300 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-b border-zinc-800/70 bg-[#0a0a0c]/95 md:hidden">
          {items.map((i) =>
            i.kind === 'route' ? (
              <Link key={i.key} to={i.href} className="block border-t border-zinc-800/50 px-5 py-3 text-[15px] text-zinc-200">{i.label}</Link>
            ) : (
              <a key={i.key} href={i.href} className="block border-t border-zinc-800/50 px-5 py-3 text-[15px] text-zinc-200">{i.label}</a>
            ),
          )}
          <button type="button" onClick={() => { setOpen(false); onPalette(); }} className="block w-full border-t border-zinc-800/50 px-5 py-3 text-left text-[15px] text-zinc-200">Jump to…</button>
        </div>
      )}
    </header>
  );
}
