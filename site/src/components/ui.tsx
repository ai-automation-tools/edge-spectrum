import React, { useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Accent } from '../tools';

/**
 * Shared primitives for the hub's 2026-10-05 redesign. Every page composes these so the
 * surfaces, headings and motion read as one system; the tokens themselves live in index.css.
 */

/** The hex behind each registry accent. Cards receive it as `--c` and derive every tint from it. */
export const ACCENT_HEX: Record<Accent, string> = {
  sky: '#38bdf8',
  emerald: '#34d399',
  violet: '#a78bfa',
  amber: '#fbbf24',
  rose: '#fb7185',
  teal: '#2dd4bf',
  cyan: '#22d3ee',
};

/** Tracks the pointer inside an element so `.spot` can draw its ring where the cursor is. */
export function useSpotlight() {
  return useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
}

/** A surface with the spotlight ring. `accent` is a registry key or a hex colour. */
export function Card({
  accent = 'sky', still = false, className = '', style, children, ...rest
}: React.HTMLAttributes<HTMLDivElement> & { accent?: Accent | string; still?: boolean }) {
  const onMove = useSpotlight();
  const c = (ACCENT_HEX as Record<string, string>)[accent] ?? accent;
  return (
    <div
      {...rest}
      onPointerMove={onMove}
      className={`panel spot ${still ? 'still' : ''} ${className}`}
      style={{ ...(style ?? {}), ['--c' as string]: c }}
    >
      {children}
    </div>
  );
}

/** Fade-and-rise into view once. Respects prefers-reduced-motion by rendering static. */
export function Reveal({ delay = 0, className = '', children }: { delay?: number; className?: string; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ accent, className = '', children }: { accent?: Accent | string; className?: string; children: React.ReactNode }) {
  const c = accent ? ((ACCENT_HEX as Record<string, string>)[accent] ?? accent) : undefined;
  return <p className={`eyebrow ${className}`} style={c ? { ['--c' as string]: c } : undefined}>{children}</p>;
}

/** Section heading block: eyebrow, title, one-paragraph sub. */
export function SectionHead({ eyebrow, title, sub, accent, right }: {
  eyebrow: string; title: React.ReactNode; sub?: React.ReactNode; accent?: Accent | string; right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
        <h2 className="mt-2.5 text-[26px] font-semibold leading-tight tracking-[-0.025em] text-zinc-100">{title}</h2>
        {sub && <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-zinc-400">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/** The header every tool page opens with. */
export function PageHead({ eyebrow, title, lede, accent = 'sky', children }: {
  eyebrow: string; title: React.ReactNode; lede: React.ReactNode; accent?: Accent | string; children?: React.ReactNode;
}) {
  return (
    <Reveal>
      <header className="mb-10 max-w-3xl">
        <Eyebrow accent={accent}>{eyebrow}</Eyebrow>
        <h1 className="mt-3 text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-zinc-100 md:text-[40px]">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">{lede}</p>
        {children}
      </header>
    </Reveal>
  );
}

/** Lead word inside a heading, tinted with the page accent. */
export function Accented({ accent = 'sky', children }: { accent?: Accent | string; children: React.ReactNode }) {
  const c = (ACCENT_HEX as Record<string, string>)[accent] ?? accent;
  return <span style={{ color: c }}>{children}</span>;
}

export function GithubMark({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** The app mark: the served favicon, inline so it takes no request. */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#38bdf8" />
      <path d="M 24 8 C 18 8 14 8 10 8 C 6 8 6 16 10 16 L 22 16 C 26 16 26 24 22 24 L 8 24" stroke="#0b1220" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
