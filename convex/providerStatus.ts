/**
 * PropEdge AI — Provider Status Queries (R11 upgraded)
 *
 * Surfaces data source health, sync status, and DB record counts.
 * Now includes live data stats from liveEvents / liveOdds tables.
 *
 * R10.1: Requires auth, user-scoped counts
 * R11: Live event/odds counts, provider config from DB, stale detection
 */

import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getAllProviderStatuses } from "./lib/providers/index";

// Stale status from timestamp
function computeRefreshStatus(lastUpdated: number, staleAfterMinutes: number): string {
  const ageMinutes = (Date.now() - lastUpdated) / 60000;
  if (ageMinutes < staleAfterMinutes * 0.5) return "fresh";
  if (ageMinutes < staleAfterMinutes) return "updating";
  return "stale";
}

/** Get all provider statuses with DB stats */
export const allProviders = query({
  args: {},
  returns: undefined as any,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null; // Not authenticated — return nothing

    const statuses = getAllProviderStatuses();

    // Global data counts (shared across all users)
    const [props, players, games, kalshiMarkets, liveEvents, liveOdds] = await Promise.all([
      ctx.db.query("props").collect().then((r) => r.length),
      ctx.db.query("players").collect().then((r) => r.length),
      ctx.db.query("games").collect().then((r) => r.length),
      ctx.db.query("kalshiMarkets").collect().then((r) => r.length).catch(() => 0),
      ctx.db.query("liveEvents").collect().then((r) => r.length).catch(() => 0),
      ctx.db.query("liveOdds").collect().then((r) => r.length).catch(() => 0),
    ]);

    // User-scoped counts (only the authenticated user's own data)
    const [userResults, userImportJobs] = await Promise.all([
      ctx.db
        .query("pickResults")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
        .then((r) => r.length),
      ctx.db
        .query("importJobs")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
        .then((r) => r.length),
    ]);

    // Provider config from DB (R11)
    const providerConfigs = await ctx.db.query("providerConfig").collect();
    // Stale events count
    const allLiveEvents = await ctx.db.query("liveEvents").collect();
    const staleEvents = allLiveEvents.filter(
      (e) => computeRefreshStatus(e.lastUpdated, e.staleAfterMinutes) === "stale"
    ).length;
    const freshEvents = allLiveEvents.filter(
      (e) => computeRefreshStatus(e.lastUpdated, e.staleAfterMinutes) === "fresh"
    ).length;

    // Merge static provider status with live DB config
    const mergedProviders = statuses.map((s) => {
      const dbConfig = providerConfigs.find((c) => c.provider === s.provider);
      if (dbConfig) {
        return {
          ...s,
          apiKeyConfigured: dbConfig.apiKeyConfigured,
          status: dbConfig.apiKeyConfigured ? (dbConfig.enabled ? "active" : "inactive") : "inactive",
          isLive: dbConfig.apiKeyConfigured && dbConfig.enabled,
          lastSyncTime: dbConfig.lastSyncTime,
          lastSyncStatus: dbConfig.lastSyncStatus,
          lastSyncError: dbConfig.lastSyncError,
          lastSyncRecords: dbConfig.lastSyncRecords,
          requestsUsed: dbConfig.requestsUsedThisMonth,
          rateLimit: dbConfig.rateLimitPerMonth,
          providerHealth: dbConfig.apiKeyConfigured
            ? dbConfig.lastSyncStatus === "success" ? 90 : dbConfig.lastSyncStatus === "error" ? 30 : 50
            : 0,
          refreshStatus: dbConfig.lastSyncTime
            ? computeRefreshStatus(dbConfig.lastSyncTime, dbConfig.staleAfterMinutes)
            : "never",
        };
      }
      return s;
    });

    // Determine active mode
    const hasLiveProvider = mergedProviders.some((p) => p.isLive && p.apiKeyConfigured);
    const mode = hasLiveProvider ? "hybrid" : "demo";

    return {
      providers: mergedProviders,
      dbStats: {
        // Global (shared)
        props,
        players,
        games,
        kalshiMarkets,
        // Live data (R11)
        liveEvents,
        liveOdds,
        freshEvents,
        staleEvents,
        // User-scoped
        myResults: userResults,
        myImportJobs: userImportJobs,
      },
      activeProvider: hasLiveProvider ? "the_odds_api" : "demo",
      mode,
    };
  },
});
