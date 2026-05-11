import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const myBankroll = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("bankroll")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const myTransactions = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const txns = await ctx.db
      .query("bankrollTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    
    return txns.sort((a, b) => b.timestamp - a.timestamp);
  },
});

export const bankrollSummary = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const records = await ctx.db
      .query("bankroll")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (records.length === 0) return null;

    const totalBalance = records.reduce((s, r) => s + r.currentBalance, 0);
    const totalDeposited = records.reduce((s, r) => s + r.totalDeposited, 0);
    const totalWithdrawn = records.reduce((s, r) => s + r.totalWithdrawn, 0);
    const totalWagered = records.reduce((s, r) => s + r.totalWagered, 0);
    const totalWon = records.reduce((s, r) => s + r.totalWon, 0);
    const totalLost = records.reduce((s, r) => s + r.totalLost, 0);
    const totalEntries = records.reduce((s, r) => s + r.totalEntries, 0);
    const wonEntries = records.reduce((s, r) => s + r.wonEntries, 0);
    const netProfit = totalBalance + totalWithdrawn - totalDeposited;
    const overallRoi = totalWagered > 0 ? Math.round((netProfit / totalWagered) * 1000) / 10 : 0;
    const overallWinRate = totalEntries > 0 ? Math.round((wonEntries / totalEntries) * 1000) / 10 : 0;

    // Best platform
    const bestPlatform = records.reduce((best, r) => r.roi > (best?.roi || -Infinity) ? r : best, records[0]);

    // Sport breakdown from transactions
    const txns = await ctx.db
      .query("bankrollTransactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const sportPnL: Record<string, number> = {};
    for (const tx of txns) {
      if (tx.sport) {
        sportPnL[tx.sport] = (sportPnL[tx.sport] || 0) + tx.amount;
      }
    }

    return {
      totalBalance,
      totalDeposited,
      totalWithdrawn,
      totalWagered,
      totalWon,
      totalLost,
      netProfit,
      overallRoi,
      overallWinRate,
      totalEntries,
      wonEntries,
      bestPlatform: bestPlatform?.platform || "—",
      bestPlatformRoi: bestPlatform?.roi || 0,
      sportPnL,
      platforms: records,
    };
  },
});
