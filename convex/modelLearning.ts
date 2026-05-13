/**
 * PropEdge AI — Model Learning Queries
 *
 * Surfaces learning insights: strengths, weaknesses, calibration,
 * over vs under, best/worst breakdowns.
 */

import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Get learning insights from graded results */
export const learningInsights = query({
  args: {},
  returns: undefined as any,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const results = await ctx.db
      .query("pickResults")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const graded = results.filter((r) => r.resultStatus === "won" || r.resultStatus === "lost");
    if (graded.length < 3) return null;

    // Helper: group and compute hit rates
    const groupBy = (key: string) => {
      const map = new Map<string, { total: number; hits: number }>();
      for (const r of graded) {
        const k = (r as any)[key] || "Unknown";
        const entry = map.get(k) || { total: 0, hits: 0 };
        entry.total++;
        if (r.resultStatus === "won") entry.hits++;
        map.set(k, entry);
      }
      return Array.from(map.entries())
        .map(([key, v]) => ({ key, ...v, hitRate: Math.round((v.hits / v.total) * 100) }))
        .sort((a, b) => b.hitRate - a.hitRate);
    };

    const bySport = groupBy("sport");
    const byStatType = groupBy("statType");
    const byPlatform = groupBy("platform");

    // Over vs Under
    const overs = graded.filter((r) => r.overUnder === "over");
    const unders = graded.filter((r) => r.overUnder === "under");
    const overHits = overs.filter((r) => r.resultStatus === "won").length;
    const underHits = unders.filter((r) => r.resultStatus === "won").length;

    // Confidence bucket calibration (from modelProb field)
    const buckets = [
      { label: "50-55", min: 50, max: 55 },
      { label: "55-60", min: 55, max: 60 },
      { label: "60-65", min: 60, max: 65 },
      { label: "65-70", min: 65, max: 70 },
      { label: "70-80", min: 70, max: 80 },
      { label: "80-90", min: 80, max: 90 },
      { label: "90+", min: 90, max: 100 },
    ];

    const calibrationBuckets = buckets.map((b) => {
      const inBucket = graded.filter((r) => {
        const prob = (r as any).pickModelProb || 50;
        return prob >= b.min && prob < b.max;
      });
      const hits = inBucket.filter((r) => r.resultStatus === "won").length;
      const total = inBucket.length;
      const actualHitRate = total > 0 ? Math.round((hits / total) * 100) : 0;
      const midpoint = (b.min + b.max) / 2;
      return {
        bucketLabel: b.label,
        bucketMidpoint: midpoint,
        totalPredictions: total,
        hits,
        actualHitRate,
        calibrationError: total > 0 ? Math.round(Math.abs(actualHitRate - midpoint) * 10) / 10 : 0,
      };
    }).filter((b) => b.totalPredictions > 0);

    return {
      totalGraded: graded.length,
      overallHitRate: Math.round((graded.filter((r) => r.resultStatus === "won").length / graded.length) * 100),

      strengths: {
        bestSport: bySport[0] || null,
        bestStatType: byStatType[0] || null,
        bestPlatform: byPlatform[0] || null,
        bestConfBucket: calibrationBuckets.sort((a, b) => b.actualHitRate - a.actualHitRate)[0] || null,
      },

      weaknesses: {
        worstSport: bySport[bySport.length - 1] || null,
        worstStatType: byStatType[byStatType.length - 1] || null,
        worstPlayers: (() => {
          const playerMap = new Map<string, { total: number; hits: number }>();
          for (const r of graded) {
            const name = r.playerName || "Unknown";
            const entry = playerMap.get(name) || { total: 0, hits: 0 };
            entry.total++;
            if (r.resultStatus === "won") entry.hits++;
            playerMap.set(name, entry);
          }
          return Array.from(playerMap.entries())
            .map(([key, v]) => ({
              key,
              ...v,
              hitRate: Math.round((v.hits / v.total) * 100),
            }))
            .sort((a, b) => a.hitRate - b.hitRate)
            .slice(0, 3);
        })(),
      },

      overVsUnder: {
        over: {
          total: overs.length,
          hits: overHits,
          hitRate: overs.length > 0 ? Math.round((overHits / overs.length) * 100) : 0,
        },
        under: {
          total: unders.length,
          hits: underHits,
          hitRate: unders.length > 0 ? Math.round((underHits / unders.length) * 100) : 0,
        },
      },

      calibrationBuckets,
    };
  },
});
