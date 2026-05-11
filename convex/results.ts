import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all graded results for the logged-in user (falls back to all demo results)
export const myResults = query({
  args: {
    sport: v.optional(v.string()),
    platform: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, { sport, platform, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    // Try user-specific results first
    let results = await ctx.db
      .query("pickResults")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    // Fallback: if no user results, show all demo results (for demo mode)
    if (results.length === 0) {
      results = await ctx.db.query("pickResults").collect();
    }
    if (sport) results = results.filter((r) => r.sport === sport);
    if (platform) results = results.filter((r) => r.platform === platform);
    if (status) results = results.filter((r) => r.resultStatus === status);
    return results.sort((a, b) => (b.gradedAt || b.pickedAt) - (a.gradedAt || a.pickedAt));
  },
});

// Summary stats
export const resultsSummary = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    let results = await ctx.db
      .query("pickResults")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    // Fallback: if no user results, show all demo results
    if (results.length === 0) {
      results = await ctx.db.query("pickResults").collect();
    }
    const graded = results.filter((r) => r.resultStatus !== "pending");
    const won = graded.filter((r) => r.resultStatus === "won").length;
    const lost = graded.filter((r) => r.resultStatus === "lost").length;
    const push = graded.filter((r) => r.resultStatus === "push").length;
    const voided = graded.filter((r) => r.resultStatus === "void").length;
    const pending = results.filter((r) => r.resultStatus === "pending").length;
    const totalROI = graded.length > 0
      ? graded.reduce((sum, r) => sum + (r.roi || 0), 0) / graded.length
      : 0;
    const avgEdge = graded.length > 0
      ? graded.reduce((sum, r) => sum + r.pickEdge, 0) / graded.length
      : 0;
    const avgCLV = graded.filter((r) => r.clv !== undefined).length > 0
      ? graded.filter((r) => r.clv !== undefined).reduce((sum, r) => sum + (r.clv || 0), 0)
        / graded.filter((r) => r.clv !== undefined).length
      : 0;
    return {
      total: results.length,
      won, lost, push, voided, pending,
      winRate: graded.length > 0 ? Math.round((won / (won + lost)) * 1000) / 10 : 0,
      totalROI: Math.round(totalROI * 10) / 10,
      avgEdge: Math.round(avgEdge * 10) / 10,
      avgCLV: Math.round(avgCLV * 10) / 10,
    };
  },
});

// Model Performance Lab data
export const modelPerformance = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const preds = await ctx.db.query("modelPredictions").collect();
    const graded = preds.filter((p) => p.hit !== undefined);

    // Hit rate by confidence bucket
    const confBuckets: Record<string, { total: number; hits: number }> = {};
    for (const p of graded) {
      const b = p.confidenceBucket;
      if (!confBuckets[b]) confBuckets[b] = { total: 0, hits: 0 };
      confBuckets[b].total++;
      if (p.hit) confBuckets[b].hits++;
    }
    const hitRateByConfidence = Object.entries(confBuckets).map(([bucket, d]) => ({
      bucket, hitRate: Math.round((d.hits / d.total) * 1000) / 10, total: d.total, hits: d.hits,
    })).sort((a, b) => a.bucket.localeCompare(b.bucket));

    // ROI by edge bucket
    const edgeBuckets: Record<string, { total: number; hits: number }> = {};
    for (const p of graded) {
      const b = p.edgeBucket;
      if (!edgeBuckets[b]) edgeBuckets[b] = { total: 0, hits: 0 };
      edgeBuckets[b].total++;
      if (p.hit) edgeBuckets[b].hits++;
    }
    const roiByEdge = Object.entries(edgeBuckets).map(([bucket, d]) => ({
      bucket, hitRate: Math.round((d.hits / d.total) * 1000) / 10, total: d.total, hits: d.hits,
      roi: Math.round(((d.hits / d.total) * 2 - 1) * 1000) / 10, // simplified ROI
    })).sort((a, b) => a.bucket.localeCompare(b.bucket));

    // ROI by sport
    const sportBuckets: Record<string, { total: number; hits: number }> = {};
    for (const p of graded) {
      if (!sportBuckets[p.sport]) sportBuckets[p.sport] = { total: 0, hits: 0 };
      sportBuckets[p.sport].total++;
      if (p.hit) sportBuckets[p.sport].hits++;
    }
    const roiBySport = Object.entries(sportBuckets).map(([sport, d]) => ({
      sport, hitRate: Math.round((d.hits / d.total) * 1000) / 10, total: d.total,
      roi: Math.round(((d.hits / d.total) * 2 - 1) * 1000) / 10,
    }));

    // ROI by platform
    const platBuckets: Record<string, { total: number; hits: number }> = {};
    for (const p of graded) {
      if (!platBuckets[p.platform]) platBuckets[p.platform] = { total: 0, hits: 0 };
      platBuckets[p.platform].total++;
      if (p.hit) platBuckets[p.platform].hits++;
    }
    const roiByPlatform = Object.entries(platBuckets).map(([platform, d]) => ({
      platform, hitRate: Math.round((d.hits / d.total) * 1000) / 10, total: d.total,
      roi: Math.round(((d.hits / d.total) * 2 - 1) * 1000) / 10,
    }));

    // ROI by prop type
    const typeBuckets: Record<string, { total: number; hits: number }> = {};
    for (const p of graded) {
      const t = p.propType || "over_under";
      if (!typeBuckets[t]) typeBuckets[t] = { total: 0, hits: 0 };
      typeBuckets[t].total++;
      if (p.hit) typeBuckets[t].hits++;
    }
    const roiByPropType = Object.entries(typeBuckets).map(([propType, d]) => ({
      propType, hitRate: Math.round((d.hits / d.total) * 1000) / 10, total: d.total,
      roi: Math.round(((d.hits / d.total) * 2 - 1) * 1000) / 10,
    }));

    // Over vs Under performance
    const overHits = graded.filter((p) => p.overUnder === "over" && p.hit).length;
    const overTotal = graded.filter((p) => p.overUnder === "over").length;
    const underHits = graded.filter((p) => p.overUnder === "under" && p.hit).length;
    const underTotal = graded.filter((p) => p.overUnder === "under").length;

    // Calibration — predicted prob vs actual hit rate
    const calibration = hitRateByConfidence.map((b) => ({
      predictedProb: parseInt(b.bucket.split("-")[0]) + 5, // midpoint
      actualHitRate: b.hitRate,
      sampleSize: b.total,
    }));

    // Best/worst performing filters
    const playerPerf: Record<string, { total: number; hits: number }> = {};
    for (const p of graded) {
      if (!playerPerf[p.playerName]) playerPerf[p.playerName] = { total: 0, hits: 0 };
      playerPerf[p.playerName].total++;
      if (p.hit) playerPerf[p.playerName].hits++;
    }
    const playerList = Object.entries(playerPerf)
      .filter(([, d]) => d.total >= 3)
      .map(([name, d]) => ({ name, hitRate: Math.round((d.hits / d.total) * 1000) / 10, total: d.total }))
      .sort((a, b) => b.hitRate - a.hitRate);
    const bestPlayers = playerList.slice(0, 5);
    const worstPlayers = [...playerList].sort((a, b) => a.hitRate - b.hitRate).slice(0, 5);

    return {
      totalPredictions: preds.length,
      gradedPredictions: graded.length,
      overallHitRate: graded.length > 0 ? Math.round((graded.filter((p) => p.hit).length / graded.length) * 1000) / 10 : 0,
      hitRateByConfidence,
      roiByEdge,
      roiBySport,
      roiByPlatform,
      roiByPropType,
      overVsUnder: {
        over: { hits: overHits, total: overTotal, hitRate: overTotal > 0 ? Math.round((overHits / overTotal) * 1000) / 10 : 0 },
        under: { hits: underHits, total: underTotal, hitRate: underTotal > 0 ? Math.round((underHits / underTotal) * 1000) / 10 : 0 },
      },
      calibration,
      bestPlayers,
      worstPlayers,
    };
  },
});
