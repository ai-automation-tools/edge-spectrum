import { EDGES, type EdgeRecord } from '../data/edges.js';

/**
 * Dataset questions for the full-mode advisor (audit PROD-15). The rows whose name or category share
 * words with the question go into the prompt with their figures and sources, so the model answers
 * from the dataset instead of from memory. Keyword overlap, no embeddings: the dataset is small and
 * the names are plain. Demo mode never reaches this; it never calls the model.
 */

const STOP = new Set(['the', 'and', 'for', 'are', 'what', 'which', 'how', 'with', 'than', 'that', 'this', 'does', 'from', 'about', 'more', 'less', 'better', 'worse', 'best', 'worst', 'vs', 'versus', 'into', 'over', 'under', 'compare', 'compared', 'edge', 'return', 'returns', 'bet', 'bets', 'betting', 'should', 'would', 'could', 'have', 'has', 'any', 'all', 'you', 'your', 'can', 'its', 'their', 'there', 'when', 'why', 'who', 'many', 'much', 'per', 'year', 'years']);

/** Up to `k` rows sharing the most words with the question; empty when nothing matches. */
export function relevantEdges(question: string, k = 12): EdgeRecord[] {
  const terms = [...new Set((question.toLowerCase().match(/[a-z0-9&+]{3,}/g) ?? []).filter((w) => !STOP.has(w)))];
  if (!terms.length) return [];
  return EDGES
    .map((r, i) => {
      // Whole words, matched by prefix: "underdog" finds "underdogs", "nfl" does not find "inflation".
      const words = `${r.n} ${r.cat}`.toLowerCase().match(/[a-z0-9&+]+/g) ?? [];
      return { r, i, score: terms.filter((t) => words.some((w) => w.startsWith(t))).length };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, k)
    .map((s) => s.r);
}

/** One line per row: the figure, what kind of evidence it is, and its source when it has one. */
export function edgeContext(question: string): string {
  const rows = relevantEdges(question);
  if (!rows.length) return '';
  const line = (r: EdgeRecord) =>
    `- ${r.n} (${r.cat}): ${r.m === 'i' ? `annual return ${r.a}%` : `expected return ${r.e}% per decision, about ${r.du} decisions a day`}; ` +
    `basis ${r.basis}${r.source ? `; source: ${r.source}${r.asOf ? `, checked ${r.asOf}` : ''}` : '; uncited estimate'}`;
  return [
    'Rows from the Edge Spectrum dataset that match the question. When the question is about these activities, answer from these figures, name their sources, and say when a row is an uncited estimate. Do not state figures for activities that are not listed here.',
    ...rows.map(line),
  ].join('\n');
}
