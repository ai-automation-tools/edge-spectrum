import { Activity, LineChart, Calculator, Layers, type LucideIcon } from 'lucide-react';

/**
 * The Edge Spectrum hub tool registry.
 *
 * This is the single source of truth for every tool in the hub. Both the
 * landing page (src/pages/Home.tsx) and the router (src/App.tsx) iterate over
 * TOOLS — so adding a new tool is one entry here plus one page component (for a
 * `route` tool) or one static page under `public/` (for a `static` tool).
 *
 * `kind`:
 *   - 'route'  → a React Router route rendered inside the SPA (add a <Route> is
 *                automatic; supply an `element` factory below via App.tsx).
 *   - 'static' → a standalone page served from `public/` (e.g. the Plotly
 *                Edge Spectrum viz at /spectrum/). Linked with a plain <a>.
 *   - 'external' → an off-site URL (opens in a new tab).
 */
export type ToolKind = 'route' | 'static' | 'external';
export type ToolStatus = 'live' | 'wip' | 'soon';

/** Accent keys map to concrete Tailwind classes in Home.tsx (keep them literal so JIT keeps them). */
export type Accent = 'sky' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal' | 'cyan';

export interface Tool {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  href: string;
  kind: ToolKind;
  status: ToolStatus;
  accent: Accent;
  /** Short category label shown on the tile. */
  tag?: string;
}

export const TOOLS: Tool[] = [
  {
    slug: 'spectrum',
    title: 'The Edge Spectrum',
    blurb:
      'Interactive comparison of expected returns across 187 financial & betting activities over 7 time horizons.',
    icon: Activity,
    // Explicit index.html so the static page resolves identically in Vite dev
    // (which doesn't auto-serve a public/ directory index) and on Vercel.
    href: '/spectrum/index.html',
    kind: 'static',
    status: 'live',
    accent: 'sky',
    tag: 'Visualization',
  },
  {
    slug: 'backtester',
    title: 'Backtest Simulator',
    blurb:
      'Backtest wagering strategies over 26 simulated seasons of MLB, NFL, NHL & NBA — ROI/Kelly diagnostics, equity curves, live ESPN scores and an AI strategy advisor.',
    icon: LineChart,
    href: '/backtester',
    kind: 'route',
    status: 'live',
    accent: 'emerald',
    tag: 'Simulator',
  },
  {
    slug: 'odds',
    title: 'Odds Converter & No-Vig Calculator',
    blurb:
      'Convert American, decimal, fractional and implied odds, then strip the bookmaker margin from any market with multiplicative, power or Shin de-vigging.',
    icon: Calculator,
    href: '/odds',
    kind: 'route',
    status: 'live',
    accent: 'violet',
    tag: 'Calculator',
  },
  {
    slug: 'parlay',
    title: 'Parlay & SGP Hold Calculator',
    blurb:
      "Compare the true joint probability of a multi-leg parlay against the book's payout to see how the margin compounds with every leg you add.",
    icon: Layers,
    href: '/parlay',
    kind: 'route',
    status: 'live',
    accent: 'amber',
    tag: 'Calculator',
  },
];
