/**
 * PropEdge AI — Provider Status Queries
 *
 * Surfaces data source health, sync status, and DB record counts.
 */

import { query } from "./_generated/server";
import { getAllProviderStatuses } from "./lib/providers/index";

/** Get all provider statuses with DB stats */
export const allProviders = query({
  args: {},
  returns: undefined as any,
  handler: async (ctx) => {
    const statuses = getAllProviderStatuses();

    // DB record counts
    const [props, players, games, results, kalshiMarkets, importJobs] = await Promise.all([
      ctx.db.query("props").collect().then((r) => r.length),
      ctx.db.query("players").collect().then((r) => r.length),
      ctx.db.query("games").collect().then((r) => r.length),
      ctx.db.query("pickResults").collect().then((r) => r.length),
      ctx.db.query("kalshiMarkets").collect().then((r) => r.length).catch(() => 0),
      ctx.db.query("importJobs").collect().then((r) => r.length).catch(() => 0),
    ]);

    return {
      providers: statuses,
      dbStats: {
        props,
        players,
        games,
        results,
        kalshiMarkets,
        importJobs,
      },
      activeProvider: "demo",
      mode: "demo",
    };
  },
});
