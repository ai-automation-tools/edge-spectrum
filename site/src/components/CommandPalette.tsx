import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { TOOLS } from '../tools';
import { REPOSITORY_URL, SETUP_GUIDE_URL } from '../projectLinks';
import { ACCENT_COLOR } from './ui';

interface Item { g: string; label: string; hint: string; c?: string; go: () => void }

/** ⌘K / Ctrl+K jump list over the tools, the setup page, the docs and the org links. */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const ext = (u: string) => () => window.open(u, '_blank', 'noopener');
    const go = (href: string, kind: string) => () => (kind === 'route' ? navigate(href) : (window.location.href = href));
    return [
      ...TOOLS.map((t) => ({ g: 'Tools', label: t.title, hint: t.href, c: ACCENT_COLOR[t.accent], go: go(t.href, t.kind) })),
      { g: 'Pages', label: 'Home', hint: '/', c: 'var(--a-sky)', go: () => navigate('/') },
      { g: 'Pages', label: 'Your own site', hint: '/setup', c: 'var(--a-sky)', go: () => navigate('/setup') },
      { g: 'Docs', label: 'README', hint: 'github.com', go: ext(`${REPOSITORY_URL}#readme`) },
      { g: 'Docs', label: 'Methodology', hint: 'docs/methodology.md', go: ext(`${REPOSITORY_URL}/blob/main/docs/methodology.md`) },
      { g: 'Docs', label: 'Data architecture', hint: 'docs/data-architecture.md', go: ext(`${REPOSITORY_URL}/blob/main/docs/data-architecture.md`) },
      { g: 'Docs', label: 'Roadmap', hint: 'docs/ROADMAP.md', go: ext(`${REPOSITORY_URL}/blob/main/docs/ROADMAP.md`) },
      { g: 'Docs', label: 'Change log', hint: 'docs/CHANGELOG.md', go: ext(`${REPOSITORY_URL}/blob/main/docs/CHANGELOG.md`) },
      { g: 'Docs', label: 'Self-hosting guide', hint: 'docs/self-hosting.md', go: ext(SETUP_GUIDE_URL) },
      { g: 'Links', label: 'Source on GitHub', hint: 'ai-automation-tools/edge-spectrum', go: ext(REPOSITORY_URL) },
      { g: 'Links', label: 'ai-automation-tools.dev', hint: 'the org landing page', go: ext('https://ai-automation-tools.dev') },
    ];
  }, [navigate]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => !term || `${i.label} ${i.hint} ${i.g}`.toLowerCase().includes(term));
  }, [items, q]);

  // A native modal <dialog> (audit UX-05): the page behind it is inert, so Tab stays inside, and
  // closing it returns focus to whatever opened it. Escape closes it natively.
  const dlgRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dlgRef.current; if (!d) return;
    if (open && !d.open) { setQ(''); setSel(0); d.showModal(); inputRef.current?.focus(); }
    else if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { document.getElementById(`pal-opt-${sel}`)?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  // Close first, then go: a route change focuses the new page's heading, which an open modal would block.
  const pick = (i: Item) => { dlgRef.current?.close(); i.go(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => (shown.length ? (s + 1) % shown.length : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => (shown.length ? (s - 1 + shown.length) % shown.length : 0)); }
    else if (e.key === 'Enter' && shown[sel]) { e.preventDefault(); pick(shown[sel]); }
  };

  let lastG = '';
  return (
    <dialog
      ref={dlgRef}
      onClose={onClose}
      onKeyDown={onKey}
      onClick={(e) => { if (e.target === e.currentTarget) dlgRef.current?.close(); }}
      aria-label="Jump to"
      className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-black/60 light:bg-black/25 p-0 px-4 pt-[12vh] backdrop-blur-[4px] backdrop:bg-transparent"
    >
      {open && (
      <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[14px] border border-zinc-700/80 bg-(--bg-4) shadow-[0_40px_120px_-30px_rgba(0,0,0,1)] light:shadow-[0_30px_80px_-30px_rgba(0,0,0,.35)] animate-fadeIn">
        <div className="flex h-[52px] items-center gap-2.5 border-b border-zinc-800/60 px-4">
          <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a tool, a page or a document…" aria-label="Jump to a tool, a page or a document"
            role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list"
            aria-activedescendant={shown[sel] ? `pal-opt-${sel}` : undefined}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600" spellCheck={false} autoComplete="off"
          />
          <kbd className="key">esc</kbd>
        </div>
        <div id="pal-list" role="listbox" aria-label="Results" className="max-h-[360px] overflow-y-auto p-1.5">
          {shown.length === 0 && <div role="status" className="p-7 text-center text-sm text-zinc-500">Nothing matches. Try a tool name or a document.</div>}
          {shown.map((i, k) => {
            const head = i.g !== lastG ? <div aria-hidden="true" className="px-2.5 pb-1 pt-2.5 font-mono text-[10.5px] uppercase tracking-[.12em] text-zinc-600">{i.g}</div> : null;
            lastG = i.g;
            return (
              <React.Fragment key={`${i.g}-${i.label}`}>
                {head}
                <div
                  id={`pal-opt-${k}`}
                  role="option"
                  aria-selected={k === sel}
                  onClick={() => pick(i)}
                  onPointerMove={() => sel !== k && setSel(k)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm ${k === sel ? 'bg-sky-500/15 text-white light:text-zinc-50' : 'text-zinc-300'}`}
                >
                  <i aria-hidden="true" className="h-2 w-2 flex-none rounded-full" style={{ background: i.c ?? 'var(--fg-5)' }} />
                  <span>{i.label}</span>
                  <small className={`ml-auto whitespace-nowrap font-mono text-[11px] ${k === sel ? 'text-zinc-300' : 'text-zinc-600'}`}>{i.hint}</small>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex gap-3.5 border-t border-zinc-800/60 px-3.5 py-2 text-[11.5px] text-zinc-600" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5"><kbd className="key">↑</kbd><kbd className="key">↓</kbd> move</span>
          <span className="inline-flex items-center gap-1.5"><kbd className="key">↵</kbd> open</span>
          <span className="inline-flex items-center gap-1.5"><kbd className="key">esc</kbd> close</span>
        </div>
      </div>
      )}
    </dialog>
  );
}
