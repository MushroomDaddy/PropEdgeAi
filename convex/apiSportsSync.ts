/**
 * PropEdge AI — API-SPORTS Sync Actions (R13)
 *
 * Convex internalActions for syncing data from API-SPORTS.
 * All calls are server-side only. API key never exposed to frontend.
 *
 * Pattern:
 *   1. Check API_SPORTS_KEY is configured
 *   2. Check daily rate limit from providerConfig
 *   3. Call sport adapter
 *   4. Store normalized data in DB
 *   5. Update providerConfig with sync result
 *   6. Log to providerUsageLog
 */

import { internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";

import {
  getTeams, getPlayers, getGames, getStandings,
  getPlayerStats, getInjuries, getLiveScores,
  providerHealthCheck, isApiSportsConfigured,
} from "./lib/apiSports/index";

declare const process: { env: Record<string, string | undefined> };

// ── Internal mutation references ──
const ref = {
  storeTeams: makeFunctionReference<"mutation">("apiSportsSync:storeApiSportsTeams"),
  storePlayers: makeFunctionReference<"mutation">("apiSportsSync:storeApiSportsPlayers"),
  storeGames: makeFunctionReference<"mutation">("apiSportsSync:storeApiSportsGames"),
  storeStandings: makeFunctionReference<"mutation">("apiSportsSync:storeApiSportsStandings"),
  storePlayerStats: makeFunctionReference<"mutation">("apiSportsSync:storeApiSportsPlayerStats"),
  storeInjuries: makeFunctionReference<"mutation">("apiSportsSync:storeApiSportsInjuries"),
  logUsage: makeFunctionReference<"mutation">("apiSportsSync:logApiSportsUsage"),
  updateProviderConfig: makeFunctionReference<"mutation">("apiSportsSync:updateApiSportsProviderConfig"),
};

// ══════════════════════════════════════════════════
//  QUERIES
// ══════════════════════════════════════════════════

/** Get API-SPORTS provider health status */
export const getApiSportsStatus = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const health = providerHealthCheck();

    // Enrich with DB data
    const configs = await ctx.db
      .query("providerConfig")
      .withIndex("by_provider", (q) => q.eq("provider", "api_sports"))
      .collect();
    const config = configs[0];

    if (config) {
      health.requestsUsedToday = config.requestsUsedThisMonth; // Reusing field for daily tracking
      health.lastSync = config.lastSyncTime;
      health.lastError = config.lastSyncError;
      health.enabled = config.enabled;
    }

    // Get cached data counts
    const teamCache = await ctx.db.query("apiSportsCache")
      .withIndex("by_type", (q) => q.eq("dataType", "teams"))
      .collect();
    const gameCache = await ctx.db.query("apiSportsCache")
      .withIndex("by_type", (q) => q.eq("dataType", "games"))
      .collect();

    return {
      ...health,
      cachedTeams: teamCache.length,
      cachedGames: gameCache.length,
    };
  },
});

/** Get cached API-SPORTS data */
export const getCachedData = query({
  args: {
    dataType: v.string(),
    sport: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, { dataType, sport }) => {
    let query = ctx.db.query("apiSportsCache")
      .withIndex("by_type", (q) => q.eq("dataType", dataType));

    const results = await query.collect();

    if (sport) {
      return results.filter((r) => r.sport === sport);
    }
    return results;
  },
});

// ══════════════════════════════════════════════════
//  INTERNAL MUTATIONS (store data)
// ══════════════════════════════════════════════════

/** Store team data in cache */
export const storeApiSportsTeams = internalMutation({
  args: {
    sport: v.string(),
    teams: v.any(),
  },
  handler: async (ctx, { sport, teams }) => {
    // Delete old cached teams for this sport
    const old = await ctx.db.query("apiSportsCache")
      .withIndex("by_type_sport", (q) => q.eq("dataType", "teams").eq("sport", sport))
      .collect();
    for (const o of old) await ctx.db.delete(o._id);

    // Insert new
    for (const team of teams) {
      await ctx.db.insert("apiSportsCache", {
        dataType: "teams",
        sport,
        apiSportsId: team.apiSportsId,
        data: team,
        lastUpdated: Date.now(),
        staleAfterMinutes: 1440,
      });
    }
    return { stored: teams.length };
  },
});

/** Store player data in cache */
export const storeApiSportsPlayers = internalMutation({
  args: {
    sport: v.string(),
    players: v.any(),
  },
  handler: async (ctx, { sport, players }) => {
    const old = await ctx.db.query("apiSportsCache")
      .withIndex("by_type_sport", (q) => q.eq("dataType", "players").eq("sport", sport))
      .collect();
    for (const o of old) await ctx.db.delete(o._id);

    for (const player of players) {
      await ctx.db.insert("apiSportsCache", {
        dataType: "players",
        sport,
        apiSportsId: player.apiSportsId,
        data: player,
        lastUpdated: Date.now(),
        staleAfterMinutes: 720,
      });
    }
    return { stored: players.length };
  },
});

/** Store game data in cache */
export const storeApiSportsGames = internalMutation({
  args: {
    sport: v.string(),
    games: v.any(),
  },
  handler: async (ctx, { sport, games }) => {
    const old = await ctx.db.query("apiSportsCache")
      .withIndex("by_type_sport", (q) => q.eq("dataType", "games").eq("sport", sport))
      .collect();
    for (const o of old) await ctx.db.delete(o._id);

    for (const game of games) {
      await ctx.db.insert("apiSportsCache", {
        dataType: "games",
        sport,
        apiSportsId: game.apiSportsId,
        data: game,
        lastUpdated: Date.now(),
        staleAfterMinutes: 15,
      });
    }
    return { stored: games.length };
  },
});

/** Store standings in cache */
export const storeApiSportsStandings = internalMutation({
  args: {
    sport: v.string(),
    standings: v.any(),
  },
  handler: async (ctx, { sport, standings }) => {
    const old = await ctx.db.query("apiSportsCache")
      .withIndex("by_type_sport", (q) => q.eq("dataType", "standings").eq("sport", sport))
      .collect();
    for (const o of old) await ctx.db.delete(o._id);

    for (const standing of standings) {
      await ctx.db.insert("apiSportsCache", {
        dataType: "standings",
        sport,
        apiSportsId: standing.apiSportsTeamId,
        data: standing,
        lastUpdated: Date.now(),
        staleAfterMinutes: 60,
      });
    }
    return { stored: standings.length };
  },
});

/** Store player stats in cache */
export const storeApiSportsPlayerStats = internalMutation({
  args: {
    sport: v.string(),
    stats: v.any(),
  },
  handler: async (ctx, { sport, stats }) => {
    for (const stat of stats) {
      await ctx.db.insert("apiSportsCache", {
        dataType: "playerStats",
        sport,
        apiSportsId: stat.apiSportsPlayerId,
        data: stat,
        lastUpdated: Date.now(),
        staleAfterMinutes: 30,
      });
    }
    return { stored: stats.length };
  },
});

/** Store injury data in cache */
export const storeApiSportsInjuries = internalMutation({
  args: {
    sport: v.string(),
    injuries: v.any(),
  },
  handler: async (ctx, { sport, injuries }) => {
    const old = await ctx.db.query("apiSportsCache")
      .withIndex("by_type_sport", (q) => q.eq("dataType", "injuries").eq("sport", sport))
      .collect();
    for (const o of old) await ctx.db.delete(o._id);

    for (const injury of injuries) {
      await ctx.db.insert("apiSportsCache", {
        dataType: "injuries",
        sport,
        apiSportsId: injury.apiSportsPlayerId,
        data: injury,
        lastUpdated: Date.now(),
        staleAfterMinutes: 120,
      });
    }
    return { stored: injuries.length };
  },
});

/** Log API-SPORTS usage */
export const logApiSportsUsage = internalMutation({
  args: {
    endpoint: v.string(),
    sport: v.string(),
    requestsUsed: v.number(),
    recordsFetched: v.number(),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("providerUsageLog", {
      provider: "api_sports",
      endpoint: args.endpoint,
      sport: args.sport,
      requestsUsed: args.requestsUsed,
      recordsFetched: args.recordsFetched,
      success: args.success,
      error: args.error,
      timestamp: Date.now(),
    });
  },
});

/** Update API-SPORTS provider config after sync */
export const updateApiSportsProviderConfig = internalMutation({
  args: {
    requestsUsed: v.number(),
    recordsUpdated: v.number(),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const configs = await ctx.db
      .query("providerConfig")
      .withIndex("by_provider", (q) => q.eq("provider", "api_sports"))
      .collect();

    const now = Date.now();

    if (configs.length > 0) {
      const existing = configs[0];
      await ctx.db.patch(existing._id, {
        apiKeyConfigured: isApiSportsConfigured(),
        requestsUsedThisMonth: existing.requestsUsedThisMonth + args.requestsUsed,
        lastSyncTime: now,
        lastSyncStatus: args.success ? "success" : "error",
        lastSyncError: args.error,
        lastSyncRecords: args.recordsUpdated,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("providerConfig", {
        provider: "api_sports",
        enabled: true,
        apiKeyConfigured: isApiSportsConfigured(),
        supportedSports: ["NBA", "NFL", "MLB", "NHL"],
        supportedMarkets: ["teams", "players", "games", "standings", "statistics", "injuries", "live_scores"],
        rateLimitPerMonth: 3000, // ~100/day * 30
        requestsUsedThisMonth: args.requestsUsed,
        rateLimitResetAt: undefined,
        lastSyncTime: now,
        lastSyncStatus: args.success ? "success" : "error",
        lastSyncError: args.error,
        lastSyncRecords: args.recordsUpdated,
        nextSyncAfter: undefined,
        staleAfterMinutes: 30,
        updatedAt: now,
      });
    }
  },
});

// ══════════════════════════════════════════════════
//  INTERNAL ACTIONS (fetch + store)
// ══════════════════════════════════════════════════

/** Sync teams for a sport */
export const syncTeams = internalAction({
  args: { sport: v.string() },
  returns: v.any(),
  handler: async (ctx, { sport }) => {
    const result = await getTeams(sport);
    if (!result.ok) {
      await ctx.runMutation(ref.logUsage, { endpoint: "teams", sport, requestsUsed: 0, recordsFetched: 0, success: false, error: result.error.message });
      await ctx.runMutation(ref.updateProviderConfig, { requestsUsed: 0, recordsUpdated: 0, success: false, error: result.error.message });
      return { success: false, error: result.error };
    }

    await ctx.runMutation(ref.storeTeams, { sport, teams: result.data });
    await ctx.runMutation(ref.logUsage, { endpoint: "teams", sport, requestsUsed: result.requestsUsed, recordsFetched: result.data.length, success: true });
    await ctx.runMutation(ref.updateProviderConfig, { requestsUsed: result.requestsUsed, recordsUpdated: result.data.length, success: true });

    return { success: true, teams: result.data.length, requestsUsed: result.requestsUsed };
  },
});

/** Sync players for a sport */
export const syncPlayers = internalAction({
  args: { sport: v.string(), teamId: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { sport, teamId }) => {
    const result = await getPlayers(sport, teamId || undefined);
    if (!result.ok) {
      await ctx.runMutation(ref.logUsage, { endpoint: "players", sport, requestsUsed: 0, recordsFetched: 0, success: false, error: result.error.message });
      return { success: false, error: result.error };
    }

    await ctx.runMutation(ref.storePlayers, { sport, players: result.data });
    await ctx.runMutation(ref.logUsage, { endpoint: "players", sport, requestsUsed: result.requestsUsed, recordsFetched: result.data.length, success: true });
    await ctx.runMutation(ref.updateProviderConfig, { requestsUsed: result.requestsUsed, recordsUpdated: result.data.length, success: true });

    return { success: true, players: result.data.length, requestsUsed: result.requestsUsed };
  },
});

/** Sync games for a sport */
export const syncGames = internalAction({
  args: { sport: v.string(), date: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { sport, date }) => {
    const dateRange = date ? { from: date, to: date } : undefined;
    const result = await getGames(sport, dateRange);
    if (!result.ok) {
      await ctx.runMutation(ref.logUsage, { endpoint: "games", sport, requestsUsed: 0, recordsFetched: 0, success: false, error: result.error.message });
      return { success: false, error: result.error };
    }

    await ctx.runMutation(ref.storeGames, { sport, games: result.data });
    await ctx.runMutation(ref.logUsage, { endpoint: "games", sport, requestsUsed: result.requestsUsed, recordsFetched: result.data.length, success: true });
    await ctx.runMutation(ref.updateProviderConfig, { requestsUsed: result.requestsUsed, recordsUpdated: result.data.length, success: true });

    return { success: true, games: result.data.length, requestsUsed: result.requestsUsed };
  },
});

/** Sync standings for a sport */
export const syncStandings = internalAction({
  args: { sport: v.string(), season: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { sport, season }) => {
    const result = await getStandings(sport, undefined, season || undefined);
    if (!result.ok) {
      await ctx.runMutation(ref.logUsage, { endpoint: "standings", sport, requestsUsed: 0, recordsFetched: 0, success: false, error: result.error.message });
      return { success: false, error: result.error };
    }

    await ctx.runMutation(ref.storeStandings, { sport, standings: result.data });
    await ctx.runMutation(ref.logUsage, { endpoint: "standings", sport, requestsUsed: result.requestsUsed, recordsFetched: result.data.length, success: true });
    await ctx.runMutation(ref.updateProviderConfig, { requestsUsed: result.requestsUsed, recordsUpdated: result.data.length, success: true });

    return { success: true, standings: result.data.length, requestsUsed: result.requestsUsed };
  },
});

/** Sync injuries for a sport (NFL only currently) */
export const syncInjuries = internalAction({
  args: { sport: v.string() },
  returns: v.any(),
  handler: async (ctx, { sport }) => {
    const result = await getInjuries(sport);
    if (!result.ok) {
      await ctx.runMutation(ref.logUsage, { endpoint: "injuries", sport, requestsUsed: 0, recordsFetched: 0, success: false, error: result.error.message });
      return { success: false, error: result.error };
    }

    await ctx.runMutation(ref.storeInjuries, { sport, injuries: result.data });
    await ctx.runMutation(ref.logUsage, { endpoint: "injuries", sport, requestsUsed: result.requestsUsed, recordsFetched: result.data.length, success: true });
    await ctx.runMutation(ref.updateProviderConfig, { requestsUsed: result.requestsUsed, recordsUpdated: result.data.length, success: true });

    return { success: true, injuries: result.data.length, requestsUsed: result.requestsUsed };
  },
});

/** Sync live scores for a sport */
export const syncLiveScores = internalAction({
  args: { sport: v.string() },
  returns: v.any(),
  handler: async (ctx, { sport }) => {
    const result = await getLiveScores(sport);
    if (!result.ok) {
      await ctx.runMutation(ref.logUsage, { endpoint: "liveScores", sport, requestsUsed: 0, recordsFetched: 0, success: false, error: result.error.message });
      return { success: false, error: result.error };
    }

    await ctx.runMutation(ref.storeGames, { sport, games: result.data });
    await ctx.runMutation(ref.logUsage, { endpoint: "liveScores", sport, requestsUsed: result.requestsUsed, recordsFetched: result.data.length, success: true });
    await ctx.runMutation(ref.updateProviderConfig, { requestsUsed: result.requestsUsed, recordsUpdated: result.data.length, success: true });

    return { success: true, liveGames: result.data.length, requestsUsed: result.requestsUsed };
  },
});

/** Full sync for a sport — teams + games + standings */
export const fullSync = internalAction({
  args: { sport: v.string() },
  returns: v.any(),
  handler: async (ctx, { sport }) => {
    if (!isApiSportsConfigured()) {
      return { success: false, error: "API_SPORTS_KEY not configured" };
    }

    const results: Record<string, any> = {};

    // Sync teams
    try {
      results.teams = await ctx.runAction(makeFunctionReference<"action">("apiSportsSync:syncTeams"), { sport });
    } catch (e: any) {
      results.teams = { success: false, error: e.message };
    }

    // Sync games (today)
    try {
      const today = new Date().toISOString().split("T")[0];
      results.games = await ctx.runAction(makeFunctionReference<"action">("apiSportsSync:syncGames"), { sport, date: today });
    } catch (e: any) {
      results.games = { success: false, error: e.message };
    }

    // Sync standings
    try {
      results.standings = await ctx.runAction(makeFunctionReference<"action">("apiSportsSync:syncStandings"), { sport });
    } catch (e: any) {
      results.standings = { success: false, error: e.message };
    }

    return { success: true, sport, results };
  },
});
