import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { EDGES, type EdgeRecord } from '../data/edges';

/**
 * The hero visual: every record in the dataset, drawn on two separate lanes.
 *
 * Held assets are placed by annual return; repeated wagers by edge per decision. They are
 * different quantities, so they never share an axis — the rule Action 2.1 established for the
 * Spectrum page holds here too. Positions come straight from `EDGES`; nothing is modelled.
 */

type Dot = { r: EdgeRecord; v: number; lane: 0 | 1; x: number; y: number; jitter: number; ph: number };

const LANES = [
  { label: 'Held assets', unit: 'annual return', pick: (r: EdgeRecord) => (r.m === 'i' ? r.a : null) },
  { label: 'Repeated wagers', unit: 'edge per decision', pick: (r: EdgeRecord) => (r.m === 'g' ? r.e : null) },
] as const;

function colour(v: number, max: number): [number, number, number] {
  // rose (−) → amber (near 0) → emerald (+), scaled to the lane's own range
  const t = Math.max(-1, Math.min(1, v / max));
  const rose = [251, 113, 133], amber = [251, 191, 36], emerald = [52, 211, 153];
  const mix = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k] as [number, number, number];
  return t < 0 ? mix(amber, rose, -t) : mix(amber, emerald, t);
}
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export default function SpectrumStrip({ href }: { href: string }) {
  const reduced = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; dot: Dot } | null>(null);
  const hoverRef = useRef<Dot | null>(null);
  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    const cv = cvRef.current, box = boxRef.current; if (!cv || !box) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    // Seeded jitter so the layout is stable between renders.
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const dots: Dot[] = [];
    EDGES.forEach((r, i) => {
      LANES.forEach((l, li) => { const v = l.pick(r); if (v !== null) dots.push({ r, v, lane: li as 0 | 1, x: 0, y: 0, jitter: rnd() * 2 - 1, ph: i * 0.37 }); });
    });
    dotsRef.current = dots;
    const ranges = LANES.map((_, li) => { const vs = dots.filter((d) => d.lane === li).map((d) => d.v); return { min: Math.min(...vs), max: Math.max(...vs) }; });

    let W = 0, H = 0, raf = 0; const t0 = performance.now();
    const size = () => { const r = box.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const laneGeom = (li: number) => { const padL = 16, padR = 16, top = 26, laneH = (H - top - 18) / 2; return { x0: padL, x1: W - padR, yc: top + laneH * li + laneH * 0.56, half: laneH * 0.26 }; };
    const xOf = (li: number, v: number) => { const g = laneGeom(li), { min, max } = ranges[li]; const lo = Math.min(min, 0), hi = Math.max(max, 0); return g.x0 + ((v - lo) / (hi - lo)) * (g.x1 - g.x0); };

    const draw = (now: number) => {
      const t = reduced ? 0 : (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      LANES.forEach((l, li) => {
        const g = laneGeom(li), { min, max } = ranges[li];
        // lane label
        ctx.fillStyle = 'rgba(161,161,170,.95)'; ctx.font = '500 11px Inter, system-ui, sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(l.label, g.x0, g.yc - g.half - 16);
        ctx.fillStyle = 'rgba(113,113,122,.9)'; ctx.font = '10.5px JetBrains Mono, ui-monospace, monospace';
        ctx.fillText(`· ${l.unit}`, g.x0 + ctx.measureText(l.label).width + 36, g.yc - g.half - 16);
        // axis, zero and extremes
        ctx.strokeStyle = 'rgba(63,63,70,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(g.x0, g.yc + g.half + 8); ctx.lineTo(g.x1, g.yc + g.half + 8); ctx.stroke();
        const zx = xOf(li, 0);
        ctx.strokeStyle = 'rgba(56,189,248,.45)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(zx, g.yc - g.half - 4); ctx.lineTo(zx, g.yc + g.half + 8); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(82,82,91,1)'; ctx.font = '10px JetBrains Mono, ui-monospace, monospace';
        ctx.textAlign = 'left'; ctx.fillText(`${Math.min(min, 0).toFixed(0)}%`, g.x0, g.yc + g.half + 20);
        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(56,189,248,.8)'; ctx.fillText('0', zx, g.yc + g.half + 20);
        ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(82,82,91,1)'; ctx.fillText(`+${Math.max(max, 0).toFixed(0)}%`, g.x1, g.yc + g.half + 20);
      });
      const hov = hoverRef.current;
      dots.forEach((d) => {
        const g = laneGeom(d.lane), { min, max } = ranges[d.lane];
        const scale = Math.max(Math.abs(min), Math.abs(max));
        d.x = xOf(d.lane, d.v);
        d.y = g.yc + d.jitter * g.half + (reduced ? 0 : Math.sin(t * 0.7 + d.ph) * 1.8);
        const c = colour(d.v, scale), h = hov === d, r = h ? 5 : 3.2;
        if (h) { const gl = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 16); gl.addColorStop(0, rgba(c, .45)); gl.addColorStop(1, rgba(c, 0)); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(d.x, d.y, 16, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = rgba(c, h ? 1 : 0.78); ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.fill();
        if (h) { ctx.strokeStyle = 'rgba(244,244,245,.9)'; ctx.lineWidth = 1.2; ctx.stroke(); }
      });
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    const pick = (e: PointerEvent) => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best: Dot | null = null, bd = 12; dots.forEach((d) => { const dist = Math.hypot(d.x - x, d.y - y); if (dist < bd) { bd = dist; best = d; } }); return best; };
    const onMove = (e: PointerEvent) => { const d = pick(e); hoverRef.current = d; cv.style.cursor = d ? 'pointer' : 'default'; setTip(d ? { x: d.x, y: d.y, dot: d } : null); if (reduced) draw(performance.now()); };
    const onLeave = () => { hoverRef.current = null; setTip(null); if (reduced) draw(performance.now()); };
    const onResize = () => { size(); if (reduced) draw(performance.now()); };
    size(); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', onLeave); addEventListener('resize', onResize);
    draw(performance.now());
    return () => { cancelAnimationFrame(raf); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave); removeEventListener('resize', onResize); };
  }, [reduced]);

  const assets = EDGES.filter((r) => r.m === 'i').length, wagers = EDGES.length - assets;
  return (
    <div ref={boxRef} className="relative aspect-[1/.86] w-full max-w-[560px] min-h-[300px] justify-self-center" aria-label={`All ${EDGES.length} records: ${assets} held assets by annual return and ${wagers} wagers by edge per decision. Hover a dot to read it; click to open the full visualizer.`}>
      <canvas ref={cvRef} className="absolute inset-0 block h-full w-full" onClick={() => { if (hoverRef.current) window.location.href = href; }} />
      {tip && (
        <div className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-zinc-700/80 bg-[#0e0e11] px-2.5 py-1.5 text-xs shadow-[0_10px_30px_-10px_rgba(0,0,0,.8)]" style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, calc(-100% - 14px))' }}>
          <b className="font-medium text-zinc-100">{tip.dot.r.n}</b>
          <small className="block font-mono text-[10.5px] text-zinc-500">{tip.dot.r.cat} · {tip.dot.v > 0 ? '+' : ''}{tip.dot.v}% {LANES[tip.dot.lane].unit}</small>
        </div>
      )}
      <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[.1em] text-zinc-600">{EDGES.length} records · hover · click to open</span>
    </div>
  );
}
