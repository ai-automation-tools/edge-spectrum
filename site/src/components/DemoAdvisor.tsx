import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { SportType, StrategyTemplate } from '../types';

const EXAMPLES = [
  {
    prompt: 'My backtest is profitable. Do I have an edge?',
    response: 'A profitable simulated run can happen by chance. These games and their odds come from the same underlying model, with a bookmaker margin added. Compare several seasons and look at drawdowns as well as ROI. A winning sample does not establish a strategy that will win with real money.',
  },
  {
    prompt: 'What should I learn from a losing streak?',
    response: 'Losses often arrive in clusters, even when individual outcomes are independent. Try a smaller unit size and compare the equity curve against the same starting bankroll. The lesson is how much variation your bankroll can absorb; changing a filter after each loss can simply fit noise.',
  },
  {
    prompt: 'Give me a baseline to compare strategies.',
    response: 'Start with a simple home-team moneyline strategy and no streak or injury filters. Keep the unit size and date range consistent when you compare it with another strategy. This is a control for understanding the simulator, not a recommendation to place those bets.',
  },
];

export default function DemoAdvisor({ sport, onApplyTemplate }: {
  sport: SportType;
  onApplyTemplate: (template: StrategyTemplate) => void;
}) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950/40">
      <div className="flex-1 overflow-y-auto p-5">
        <p className="mb-4 text-xs leading-relaxed text-zinc-400">
          Explore a few example conversations. These are written samples, not live AI responses or an analysis of your current results.
        </p>
        <div className="flex flex-wrap gap-2" aria-label="Sample advisor questions">
          {EXAMPLES.map((example, index) => (
            <button key={example.prompt} onClick={() => setSelected(index)} aria-pressed={selected === index}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${selected === index ? 'border-sky-500/50 bg-sky-500/10 text-sky-200' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>
              {example.prompt}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4" aria-live="polite">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-sky-400">Sample response</p>
          <p className="text-sm leading-relaxed text-zinc-300">{EXAMPLES[selected].response}</p>
          {selected === 2 && (
            <button className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-sky-300 hover:text-sky-100"
              onClick={() => onApplyTemplate({
                name: 'Home-team baseline', description: 'A simple control strategy for the synthetic simulator.',
                sport, betType: 'moneyline', sideSelection: 'home', streakFilter: 'any',
                streakTarget: 'bet_team', starPlayerFilter: 'any',
              })}>
              <Play className="h-3 w-3" /> Try this baseline
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-800 px-5 py-4">
        <Link to="/setup" className="text-sm font-semibold text-sky-300 hover:text-sky-100">Get live AI advice on your own site →</Link>
        <p className="mt-1 text-xs text-zinc-500">Full source included. Use your own Gemini key.</p>
      </div>
    </div>
  );
}
