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
const _refreshGames = makeFunctionReference<"action">(
  "liveProviders:refreshGames",
);
const _refreshOdds = makeFunctionReference<"action">(
  "liveProviders:refreshOdds",
);
const _refreshProps = makeFunctionReference<"action">(
  "liveProviders:refreshProps",
);
const _refreshLineMovement = makeFunctionReference<"action">(
  "liveProviders:refreshLineMovement",
);

// ─── CRON PRESETS (ALL COMMENTED OUT — Manual sync only until request usage confirmed) ───

// ─── Free tier NBA safe (commented out, enable when ready) ───
// crons.interval("sync:refreshGames", { hours: 4 }, refreshGames, {
//   sport: undefined,
// });
// crons.interval("sync:refreshOdds", { hours: 4 }, refreshOdds, {
//   sport: undefined,
//   markets: "h2h,spreads,totals",
// });
// crons.interval("sync:refreshProps", { hours: 4 }, refreshProps, {
//   sport: undefined,
//   maxEvents: 1,
// });
// crons.interval("sync:refreshLineMovement", { hours: 8 }, refreshLineMovement, {
//   sport: undefined,
// });

// ─── Paid NBA moderate (uncomment when on paid plan) ───
// crons.interval("sync:refreshGames", { minutes: 30 }, refreshGames, { sport: undefined });
// crons.interval("sync:refreshOdds", { minutes: 15 }, refreshOdds, { sport: undefined, markets: "h2h,spreads,totals" });
// crons.interval("sync:refreshProps", { minutes: 15 }, refreshProps, { sport: undefined, maxEvents: 2 });
// crons.interval("sync:refreshLineMovement", { minutes: 60 }, refreshLineMovement, { sport: undefined });

// ─── Paid all-sports aggressive (uncomment for full coverage) ───
// crons.interval("sync:refreshGames", { minutes: 30 }, refreshGames, {});
// crons.interval("sync:refreshOdds", { minutes: 15 }, refreshOdds, { markets: "h2h,spreads,totals" });
// crons.interval("sync:refreshProps", { minutes: 15 }, refreshProps, { maxEvents: 3 });
// crons.interval("sync:refreshLineMovement", { minutes: 60 }, refreshLineMovement, {});

export default crons;
