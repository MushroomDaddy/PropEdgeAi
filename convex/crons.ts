/**
 * PropEdge AI — Scheduled Cron Jobs (R11.2)
 *
 * Automated sync schedules for live data providers.
 * Convex crons run server-side and can call internalAction directly.
 *
 * Schedule:
 *   - Every 30 min: refreshGames (events rarely change, low frequency)
 *   - Every 15 min: refreshOdds (game-level h2h, spreads, totals)
 *   - Every 15 min: refreshProps (player props, max 2 events per run)
 *   - Every 60 min: refreshLineMovement (re-fetches for snapshot diffs)
 *
 * Free tier budget: 500 req/month
 *   refreshGames:  ~48/day × 1 req = 48 req/day
 *   refreshOdds:   ~96/day × 1 req = 96 req/day
 *   refreshProps:  ~96/day × 2 req = 192 req/day
 *   refreshLineMovement: ~24/day × 1 req = 24 req/day
 *   Total: ~360 req/day → exceeds free tier in ~1.4 days
 *
 * ⚠️ FOR FREE TIER: Use the conservative schedule below.
 *     Uncomment the aggressive schedule when on a paid plan.
 *
 * All crons check for API key presence — if THE_ODDS_API_KEY is not set,
 * the internal action returns early without making any API calls.
 */

import { cronJobs, makeFunctionReference } from "convex/server";

const crons = cronJobs();

// Internal action references
const refreshGames = makeFunctionReference<"action">(
  "liveProviders:refreshGames",
);
const refreshOdds = makeFunctionReference<"action">(
  "liveProviders:refreshOdds",
);
const refreshProps = makeFunctionReference<"action">(
  "liveProviders:refreshProps",
);
const refreshLineMovement = makeFunctionReference<"action">(
  "liveProviders:refreshLineMovement",
);

// ─── FREE TIER SCHEDULE (~10 req/day, 300 req/month) ───
// Runs every 4 hours — conservative, safe for 500 req/month limit

crons.interval("sync:refreshGames", { hours: 4 }, refreshGames, {
  sport: undefined,
});

crons.interval("sync:refreshOdds", { hours: 4 }, refreshOdds, {
  sport: undefined,
  markets: "h2h,spreads,totals",
});

crons.interval("sync:refreshProps", { hours: 4 }, refreshProps, {
  sport: undefined,
  maxEvents: 1,
});

crons.interval("sync:refreshLineMovement", { hours: 8 }, refreshLineMovement, {
  sport: undefined,
});

// ─── PAID TIER SCHEDULE (uncomment when on a paid plan) ───
// crons.interval("sync:refreshGames", { minutes: 30 }, refreshGames, { sport: undefined });
// crons.interval("sync:refreshOdds", { minutes: 15 }, refreshOdds, { sport: undefined, markets: "h2h,spreads,totals" });
// crons.interval("sync:refreshProps", { minutes: 15 }, refreshProps, { sport: undefined, maxEvents: 3 });
// crons.interval("sync:refreshLineMovement", { minutes: 60 }, refreshLineMovement, { sport: undefined });

export default crons;
