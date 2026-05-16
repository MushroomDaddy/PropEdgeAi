/**
 * PropEdge AI — Kalshi Engine
 *
 * Binary contract pricing, EV, edge, liquidity, and close analysis.
 * All prices in cents (0-100).
 */

/** Implied YES probability from YES contract price (0-100) */
export function kalshiImpliedYesProb(yesPrice: number): number {
  return yesPrice;
}

/** Implied NO probability from YES contract price */
export function kalshiImpliedNoProb(yesPrice: number): number {
  return 100 - yesPrice;
}

/** Payout for buying YES at yesPrice */
export function kalshiYesPayout(yesPrice: number): {
  cost: number;
  profit: number;
  payout: number;
  returnPct: number;
} {
  const cost = yesPrice;
  const profit = 100 - yesPrice;
  const payout = 100;
  const returnPct = Math.round((profit / cost) * 1000) / 10;
  return { cost, profit, payout, returnPct };
}

/** Payout for buying NO at yesPrice */
export function kalshiNoPayout(yesPrice: number): {
  cost: number;
  profit: number;
  payout: number;
  returnPct: number;
} {
  const noPrice = 100 - yesPrice;
  const cost = noPrice;
  const profit = yesPrice;
  const payout = 100;
  const returnPct = Math.round((profit / cost) * 1000) / 10;
  return { cost, profit, payout, returnPct };
}

/** Expected Value for a Kalshi contract */
export function kalshiExpectedValue(args: {
  modelProb: number; // 0-100
  yesPrice: number; // 0-100 cents
  side: "yes" | "no";
}): number {
  const { modelProb, yesPrice, side } = args;
  const pWin = side === "yes" ? modelProb / 100 : (100 - modelProb) / 100;
  const cost = side === "yes" ? yesPrice : 100 - yesPrice;
  const profit = 100 - cost;
  const ev = pWin * profit - (1 - pWin) * cost;
  return Math.round(ev * 100) / 100;
}

/** Edge = model prob - market implied prob for given side */
export function kalshiEdge(args: {
  modelProb: number;
  yesPrice: number;
  side: "yes" | "no";
}): number {
  const { modelProb, yesPrice, side } = args;
  if (side === "yes") return Math.round((modelProb - yesPrice) * 100) / 100;
  return Math.round((100 - modelProb - (100 - yesPrice)) * 100) / 100;
}

/** Liquidity score (0-100) from volume + spread */
export function kalshiLiquidityScore(args: {
  volume: number;
  yesBid: number;
  yesAsk: number;
}): number {
  const { volume, yesBid, yesAsk } = args;
  const spread = yesAsk - yesBid;
  const volumeScore = Math.min(50, volume / 100);
  const spreadScore = Math.max(0, 50 - spread * 5);
  return Math.round(volumeScore + spreadScore);
}

/** Settlement analysis */
export function kalshiSettlement(args: {
  side: "yes" | "no";
  settlementStatus: string; // "settled_yes" | "settled_no" | "voided" | "open"
  yesPrice: number;
  closePrice?: number;
}): {
  result: "won" | "lost" | "void" | "open";
  pnl: number;
} {
  const { side, settlementStatus, yesPrice } = args;
  void args.closePrice; // reserved for future close-price analysis
  if (settlementStatus === "voided") return { result: "void", pnl: 0 };
  if (settlementStatus === "open") return { result: "open", pnl: 0 };

  const settledYes = settlementStatus === "settled_yes";
  const cost = side === "yes" ? yesPrice : 100 - yesPrice;

  if ((side === "yes" && settledYes) || (side === "no" && !settledYes)) {
    return { result: "won", pnl: 100 - cost };
  }
  return { result: "lost", pnl: -cost };
}

/** Close price analysis — P&L tracking and alpha */
export function kalshiCloseAnalysis(args: {
  entryPrice: number;
  closePrice: number;
  side: "yes" | "no";
}): {
  entryPrice: number;
  closePrice: number;
  priceMove: number;
  pnlIfSold: number;
  alpha: number;
} {
  const { entryPrice, closePrice, side } = args;
  const priceMove = closePrice - entryPrice;
  const pnlIfSold = side === "yes" ? priceMove : -priceMove;
  const alpha = pnlIfSold; // simplified alpha = excess return vs market

  return {
    entryPrice,
    closePrice,
    priceMove: Math.round(priceMove * 100) / 100,
    pnlIfSold: Math.round(pnlIfSold * 100) / 100,
    alpha: Math.round(alpha * 100) / 100,
  };
}

/** Full Kalshi analysis for a single market */
export function analyzeKalshiMarket(args: {
  yesPrice: number;
  noPrice?: number;
  yesBid: number;
  noBid?: number;
  volume: number;
  modelProb: number;
  side: "yes" | "no";
  closePrice?: number;
}) {
  const { yesPrice, yesBid, volume, modelProb, side, closePrice } = args;
  const yesAsk = yesPrice;

  return {
    impliedYes: kalshiImpliedYesProb(yesPrice),
    impliedNo: kalshiImpliedNoProb(yesPrice),
    payout:
      side === "yes" ? kalshiYesPayout(yesPrice) : kalshiNoPayout(yesPrice),
    ev: kalshiExpectedValue({ modelProb, yesPrice, side }),
    edge: kalshiEdge({ modelProb, yesPrice, side }),
    liquidity: kalshiLiquidityScore({ volume, yesBid, yesAsk }),
    closeAnalysis:
      closePrice !== undefined
        ? kalshiCloseAnalysis({ entryPrice: yesPrice, closePrice, side })
        : undefined,
  };
}
