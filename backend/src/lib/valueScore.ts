/**
 * Value Score (0-100) — Production formula
 *
 * Components:
 *   1. Edge Score (0-40): Based on |edge| = |modelProb - marketImpliedProb|
 *      - 40 pts max at 16%+ edge
 *   2. Consensus Score (0-25): Projection source agreement with the pick direction
 *   3. Hit Rate Score (0-20): Historical hit rate on similar lines
 *   4. Bust Risk Score (0-15): Inverse of bust risk
 */
export function computeValueScore(prop: any): number {
  const absEdge = Math.abs(prop.edge || 0);
  const edgeScore = Math.min(40, absEdge * 2.5);

  const cons = prop.projectionConsensus;
  const consensusFinal = cons
    ? prop.edge > 0
      ? Math.min(25, (cons.numOverLine / cons.numSources) * 25)
      : Math.min(25, ((cons.numSources - cons.numOverLine) / cons.numSources) * 25)
    : 10;

  const histHitRate = (prop.historicalHitRate as any)?.similarLines || prop.hitRate || 50;
  const hitRateScore = Math.min(20, (histHitRate / 100) * 20);

  const bustRisk = prop.bustRisk ?? 40;
  const bustScore = Math.min(15, ((100 - bustRisk) / 100) * 15);

  return Math.round(Math.min(100, edgeScore + consensusFinal + hitRateScore + bustScore));
}
