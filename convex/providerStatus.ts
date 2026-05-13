/**
 * PropEdge AI — Provider Status Queries (R10.1 hardened)
 *
 * Surfaces data source health, sync status, and DB record counts.
 *
 * R10.1 fixes:
 * - Requires authentication
 * - pickResults and importJobs are scoped to the authenticated user
 * - Global data counts (props, players, games, kalshi) remain shared
 */

import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getAllProviderStatuses } from "./lib/providers/index";

/** Get all provider statuses with DB stats */
export const allProviders = query({
  args: {},
  returns: undefined as any,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null; // Not authenticated — return nothing

    const statuses = getAllProviderStatuses();

    // Global data counts (shared across all users)
    const [props, players, games, kalshiMarkets] = await Promise.all([
      ctx.db.query("props").collect().then((r) => r.length),
      ctx.db.query("players").collect().then((r) => r.length),
      ctx.db.query("games").collect().then((r) => r.length),
      ctx.db.query("kalshiMarkets").collect().then((r) => r.length).catch(() => 0),
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

    return {
      providers: statuses,
      dbStats: {
        // Global (shared)
        props,
        players,
        games,
        kalshiMarkets,
        // User-scoped
        myResults: userResults,
        myImportJobs: userImportJobs,
      },
      activeProvider: "demo",
      mode: "demo",
    };
  },
});
