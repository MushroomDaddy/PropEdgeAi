/**
 * PropEdge AI — Central Edge Engine
 *
 * All edge detection, probability, and EV calculations live here.
 * True edge = modelProbability - marketImpliedProbability
 * EV must include payout/odds/pricing.
 */

/** American odds → Implied Probability (0-100) */
export function impliedProbability(americanOdds: number): number {
  if (americanOdds < 0) {
    return Math.round((Math.abs(americanOdds) / (Math.abs(americanOdds) + 100)) * 10000) / 100;
  }
  return Math.round((100 / (americanOdds + 100)) * 10000) / 100;
}

/** American odds → Decimal odds */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds < 0) return 1 + 100 / Math.abs(americanOdds);
  return 1 + americanOdds / 100;
}

/** Model Probability from projection consensus */
export function modelProbability(args: {
  projection: number;
  line: number;
  seasonHitRate?: number;
  last5HitRate?: number;
  varianceFactor?: number;
}): number {
  const { projection, line, seasonHitRate, last5HitRate, varianceFactor } = args;
  // Base from projection difference
  const diff = projection - line;
  const pctDiff = diff / Math.max(line, 0.1);
  let baseProb = 50 + pctDiff * 100;

  // Blend with historical hit rates
  if (seasonHitRate !== undefined) baseProb = baseProb * 0.6 + seasonHitRate * 0.4;
  if (last5HitRate !== undefined) baseProb = baseProb * 0.75 + last5HitRate * 0.25;

  // Reduce confidence if high variance
  if (varianceFactor && varianceFactor > 1.5) {
    baseProb = 50 + (baseProb - 50) * 0.8;
  }

  return Math.round(Math.max(1, Math.min(99, baseProb)) * 100) / 100;
}

/** Fair odds from model probability → decimal */
export function fairOdds(modelProb: number): number {
  const p = modelProb / 100;
  return Math.round((1 / Math.max(p, 0.01)) * 1000) / 1000;
}

/** Projection difference % */
export function projectionDiff(projection: number, line: number): number {
  return Math.round(((projection - line) / Math.max(line, 0.1)) * 10000) / 100;
}

/** True Edge % = Model Probability - Market Implied Probability */
export function edgePercent(modelProb: number, marketImpliedProb: number): number {
  return Math.round((modelProb - marketImpliedProb) * 100) / 100;
}

/** Expected Value = (modelProb × profit) - ((1-modelProb) × stake) */
export function expectedValue(args: {
  modelProb: number;
  americanOdds?: number;
  decimalOdds?: number;
  stake?: number;
}): number {
  const stake = args.stake ?? 100;
  const decimal = args.decimalOdds ?? (args.americanOdds !== undefined ? americanToDecimal(args.americanOdds) : 1.909);
  const pWin = args.modelProb / 100;
  const profit = (decimal - 1) * stake;
  const ev = (pWin * profit) - ((1 - pWin) * stake);
  return Math.round(ev * 100) / 100;
}

/** Value Score (0-100) composite of edge, confidence, EV */
export function valueScore(args: {
  edgePct: number;
  confidence: number;
  evPercent: number;
}): number {
  const { edgePct, confidence, evPercent } = args;
  // Weighted: 40% edge, 30% confidence, 30% EV
  const edgeComponent = Math.max(0, Math.min(100, edgePct * 5 + 50));
  const confComponent = confidence;
  const evComponent = Math.max(0, Math.min(100, evPercent * 3 + 50));
  return Math.round(edgeComponent * 0.4 + confComponent * 0.3 + evComponent * 0.3);
}

/** Confidence Score (0-100) */
export function confidenceScore(args: {
  modelProb: number;
  sampleSize: number;
  projectionCount: number;
}): number {
  const { modelProb, sampleSize, projectionCount } = args;
  const probStrength = Math.abs(modelProb - 50) * 2;
  const sampleBonus = Math.min(25, sampleSize * 0.5);
  const projBonus = Math.min(15, projectionCount * 5);
  return Math.round(Math.max(0, Math.min(100, probStrength + sampleBonus + projBonus)));
}

/** Risk Score (0-100) higher = riskier */
export function riskScore(args: {
  variance: number;
  sampleSize: number;
  injuryRisk: boolean;
}): number {
  const { variance, sampleSize, injuryRisk } = args;
  let risk = variance * 20;
  if (sampleSize < 10) risk += 20;
  if (injuryRisk) risk += 25;
  return Math.round(Math.max(0, Math.min(100, risk)));
}

/** Bust Risk % — probability of missing by >20% */
export function bustRisk(args: {
  variance: number;
  line: number;
  projection: number;
}): number {
  const { variance, line, projection } = args;
  const diff = Math.abs(projection - line) / Math.max(line, 0.1);
  const risk = Math.max(0, (variance * 30) - (diff * 50));
  return Math.round(Math.max(0, Math.min(100, risk)));
}

/** Closing Line Value — positive = you beat the closing line */
export function closingLineValue(args: {
  pickLine: number;
  closingLine: number;
  overUnder: string;
}): number {
  const { pickLine, closingLine, overUnder } = args;
  if (overUnder === "over") {
    return Math.round((closingLine - pickLine) * 10) / 10;
  }
  return Math.round((pickLine - closingLine) * 10) / 10;
}

/** Win Margin — positive = pick won by that margin */
export function winMargin(args: {
  actualStat: number;
  pickLine: number;
  overUnder: string;
}): number {
  const { actualStat, pickLine, overUnder } = args;
  if (overUnder === "over") {
    return Math.round((actualStat - pickLine) * 10) / 10;
  }
  return Math.round((pickLine - actualStat) * 10) / 10;
}

/** Full edge analysis for a single prop */
export function analyzeEdge(args: {
  line: number;
  projection: number;
  americanOdds?: number;
  seasonHitRate?: number;
  last5HitRate?: number;
  varianceFactor?: number;
  sampleSize?: number;
  projectionCount?: number;
  closingLine?: number;
  overUnder?: string;
  injuryRisk?: boolean;
}) {
  const {
    line, projection, americanOdds, seasonHitRate, last5HitRate,
    varianceFactor, sampleSize, projectionCount, closingLine, overUnder, injuryRisk,
  } = args;

  const odds = americanOdds ?? -110;
  const ou = overUnder ?? "over";
  const mp = modelProbability({ projection, line, seasonHitRate, last5HitRate, varianceFactor });
  const ip = impliedProbability(odds);
  const edge = edgePercent(mp, ip);
  const ev = expectedValue({ modelProb: mp, americanOdds: odds });
  const fo = fairOdds(mp);
  const pd = projectionDiff(projection, line);
  const vs = valueScore({ edgePct: edge, confidence: mp, evPercent: ev / 100 });
  const cs = confidenceScore({ modelProb: mp, sampleSize: sampleSize ?? 20, projectionCount: projectionCount ?? 3 });
  const rs = riskScore({ variance: varianceFactor ?? 1, sampleSize: sampleSize ?? 20, injuryRisk: injuryRisk ?? false });
  const br = bustRisk({ variance: varianceFactor ?? 1, line, projection });
  const clv = closingLine !== undefined ? closingLineValue({ pickLine: line, closingLine, overUnder: ou }) : undefined;

  return {
    modelProbability: mp,
    impliedProbability: ip,
    fairOdds: fo,
    projectionDiff: pd,
    edgePercent: edge,
    expectedValue: ev,
    valueScore: vs,
    confidenceScore: cs,
    riskScore: rs,
    bustRisk: br,
    closingLineValue: clv,
  };
}
