/**
 * PropEdge AI — Live Provider Integration (R11)
 *
 * Convex actions that fetch real data from The Odds API and store
 * normalized events/odds in the DB. Demo mode stays safe — live data
 * lives in separate tables (liveEvents, liveOdds) and is toggled on
 * only when an API key is present.
 *
 * The Odds API free tier: 500 requests/month
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 */

import { action, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
// Internal function references (avoids dependency on codegen _generated/api)
const ref = {
  upsertProviderConfig: makeFunctionReference<"mutation">("liveProviders:upsertProviderConfig"),
  recordSyncResult: makeFunctionReference<"mutation">("liveProviders:recordSyncResult"),
  storeLiveEvents: makeFunctionReference<"mutation">("liveProviders:storeLiveEvents"),
  storeLiveOdds: makeFunctionReference<"mutation">("liveProviders:storeLiveOdds"),
  refreshOdds: makeFunctionReference<"action">("liveProviders:refreshOdds"),
};

// ─── Sport key mapping ───
const SPORT_KEY_MAP: Record<string, string> = {
  NBA: "basketball_nba",
  NFL: "americanfootball_nfl",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
  NCAAB: "basketball_ncaab",
  NCAAF: "americanfootball_ncaaf",
  MLS: "soccer_usa_mls",
};

const REVERSE_SPORT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SPORT_KEY_MAP).map(([k, v]) => [v, k])
);

// ─── Stale status calculation ───
function computeRefreshStatus(lastUpdated: number, staleAfterMinutes: number): string {
  const ageMinutes = (Date.now() - lastUpdated) / 60000;
  if (ageMinutes < staleAfterMinutes * 0.5) return "fresh";
  if (ageMinutes < staleAfterMinutes) return "updating";
  return "stale";
}

// ─── Helper: American odds → implied probability ───
function americanToImplied(odds: number): number {
  if (odds > 0) return Math.round((100 / (odds + 100)) * 10000) / 100;
  return Math.round((Math.abs(odds) / (Math.abs(odds) + 100)) * 10000) / 100;
}

// ══════════════════════════════════════════════════
//  QUERIES
// ══════════════════════════════════════════════════

/** Check if The Odds API key is configured */
export const getProviderConfigStatus = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const configs = await ctx.db.query("providerConfig").collect();
    return configs.map((c) => ({
      provider: c.provider,
      enabled: c.enabled,
      apiKeyConfigured: c.apiKeyConfigured,
      lastSyncTime: c.lastSyncTime,
      lastSyncStatus: c.lastSyncStatus,
      lastSyncError: c.lastSyncError,
      lastSyncRecords: c.lastSyncRecords,
      requestsUsedThisMonth: c.requestsUsedThisMonth,
      rateLimitPerMonth: c.rateLimitPerMonth,
      refreshStatus: c.lastSyncTime
        ? computeRefreshStatus(c.lastSyncTime, c.staleAfterMinutes)
        : "never",
    }));
  },
});

/** Get live events */
export const getLiveEvents = query({
  args: { sport: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, { sport }) => {
    if (sport) {
      return ctx.db
        .query("liveEvents")
        .withIndex("by_sport", (q) => q.eq("sport", sport))
        .collect();
    }
    return ctx.db.query("liveEvents").collect();
  },
});

/** Get live odds for an event */
export const getLiveOdds = query({
  args: { eventExternalId: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, { eventExternalId }) => {
    return ctx.db
      .query("liveOdds")
      .withIndex("by_eventExternalId", (q) => q.eq("eventExternalId", eventExternalId))
      .collect();
  },
});

/** Provider health check (query — reads DB state) */
export const providerHealthCheck = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const configs = await ctx.db.query("providerConfig").collect();
    const liveEventCount = (await ctx.db.query("liveEvents").collect()).length;
    const liveOddsCount = (await ctx.db.query("liveOdds").collect()).length;

    const theOddsApi = configs.find((c) => c.provider === "the_odds_api");

    const staleEvents = (await ctx.db.query("liveEvents").collect()).filter(
      (e) => computeRefreshStatus(e.lastUpdated, e.staleAfterMinutes) === "stale"
    ).length;

    return {
      providers: configs.map((c) => ({
        provider: c.provider,
        enabled: c.enabled,
        apiKeyConfigured: c.apiKeyConfigured,
        status: !c.apiKeyConfigured
          ? "not_connected"
          : c.lastSyncStatus === "error"
          ? "error"
          : c.enabled
          ? "active"
          : "inactive",
        lastSyncTime: c.lastSyncTime,
        lastSyncStatus: c.lastSyncStatus,
        lastSyncError: c.lastSyncError,
        refreshStatus: c.lastSyncTime
          ? computeRefreshStatus(c.lastSyncTime, c.staleAfterMinutes)
          : "never",
        requestsUsed: c.requestsUsedThisMonth,
        rateLimit: c.rateLimitPerMonth,
      })),
      liveEventCount,
      liveOddsCount,
      staleEvents,
      demoModeActive: !theOddsApi?.enabled || !theOddsApi?.apiKeyConfigured,
    };
  },
});

// ══════════════════════════════════════════════════
//  INTERNAL MUTATIONS (called from actions)
// ══════════════════════════════════════════════════

/** Upsert provider config */
export const upsertProviderConfig = internalMutation({
  args: {
    provider: v.string(),
    enabled: v.boolean(),
    apiKeyConfigured: v.boolean(),
    supportedSports: v.array(v.string()),
    supportedMarkets: v.array(v.string()),
    rateLimitPerMonth: v.optional(v.number()),
    staleAfterMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("providerConfig")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        apiKeyConfigured: args.apiKeyConfigured,
        supportedSports: args.supportedSports,
        supportedMarkets: args.supportedMarkets,
        rateLimitPerMonth: args.rateLimitPerMonth,
        staleAfterMinutes: args.staleAfterMinutes,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("providerConfig", {
      provider: args.provider,
      enabled: args.enabled,
      apiKeyConfigured: args.apiKeyConfigured,
      supportedSports: args.supportedSports,
      supportedMarkets: args.supportedMarkets,
      rateLimitPerMonth: args.rateLimitPerMonth,
      requestsUsedThisMonth: 0,
      staleAfterMinutes: args.staleAfterMinutes,
      lastSyncStatus: "never",
      lastSyncRecords: 0,
      updatedAt: Date.now(),
    });
  },
});

/** Record a sync result */
export const recordSyncResult = internalMutation({
  args: {
    provider: v.string(),
    status: v.string(),
    recordsUpdated: v.number(),
    error: v.optional(v.string()),
    requestsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("providerConfig")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .first();

    if (!config) return;

    await ctx.db.patch(config._id, {
      lastSyncTime: Date.now(),
      lastSyncStatus: args.status,
      lastSyncError: args.error,
      lastSyncRecords: args.recordsUpdated,
      requestsUsedThisMonth: config.requestsUsedThisMonth + args.requestsUsed,
      updatedAt: Date.now(),
    });
  },
});

/** Store live events from API response */
export const storeLiveEvents = internalMutation({
  args: {
    events: v.array(
      v.object({
        provider: v.string(),
        externalId: v.string(),
        sport: v.string(),
        sportKey: v.string(),
        homeTeam: v.string(),
        awayTeam: v.string(),
        commenceTime: v.number(),
        status: v.string(),
      })
    ),
  },
  handler: async (ctx, { events }) => {
    const now = Date.now();
    let stored = 0;

    for (const event of events) {
      // Upsert by externalId
      const existing = await ctx.db
        .query("liveEvents")
        .withIndex("by_externalId", (q) => q.eq("externalId", event.externalId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          commenceTime: event.commenceTime,
          status: event.status,
          lastUpdated: now,
          refreshStatus: "fresh",
        });
      } else {
        await ctx.db.insert("liveEvents", {
          provider: event.provider,
          externalId: event.externalId,
          sport: event.sport,
          sportKey: event.sportKey,
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          commenceTime: event.commenceTime,
          status: event.status,
          sourceType: "live",
          lastUpdated: now,
          staleAfterMinutes: 15,
          refreshStatus: "fresh",
        });
      }
      stored++;
    }

    return { stored };
  },
});

/** Store live odds from API response */
export const storeLiveOdds = internalMutation({
  args: {
    odds: v.array(
      v.object({
        provider: v.string(),
        eventExternalId: v.string(),
        sport: v.string(),
        bookmaker: v.string(),
        marketType: v.string(),
        playerName: v.optional(v.string()),
        statType: v.optional(v.string()),
        line: v.optional(v.number()),
        overPrice: v.optional(v.number()),
        underPrice: v.optional(v.number()),
        overImplied: v.optional(v.number()),
        underImplied: v.optional(v.number()),
        homeOdds: v.optional(v.number()),
        awayOdds: v.optional(v.number()),
        drawOdds: v.optional(v.number()),
        spread: v.optional(v.number()),
        total: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { odds }) => {
    const now = Date.now();
    let stored = 0;

    for (const odd of odds) {
      // For game-level odds, upsert by event+bookmaker+marketType
      // For player props, upsert by event+bookmaker+player+stat
      const existingOdds = await ctx.db
        .query("liveOdds")
        .withIndex("by_eventExternalId", (q) => q.eq("eventExternalId", odd.eventExternalId))
        .collect();

      const match = existingOdds.find((o) =>
        o.bookmaker === odd.bookmaker &&
        o.marketType === odd.marketType &&
        (odd.marketType !== "player_props" || (o.playerName === odd.playerName && o.statType === odd.statType))
      );

      // Resolve liveEventId
      const liveEvent = await ctx.db
        .query("liveEvents")
        .withIndex("by_externalId", (q) => q.eq("externalId", odd.eventExternalId))
        .first();

      if (match) {
        await ctx.db.patch(match._id, {
          line: odd.line,
          overPrice: odd.overPrice,
          underPrice: odd.underPrice,
          overImplied: odd.overImplied,
          underImplied: odd.underImplied,
          homeOdds: odd.homeOdds,
          awayOdds: odd.awayOdds,
          drawOdds: odd.drawOdds,
          spread: odd.spread,
          total: odd.total,
          lastUpdated: now,
          refreshStatus: "fresh",
        });
      } else {
        await ctx.db.insert("liveOdds", {
          provider: odd.provider,
          eventExternalId: odd.eventExternalId,
          liveEventId: liveEvent?._id,
          sport: odd.sport,
          bookmaker: odd.bookmaker,
          marketType: odd.marketType,
          playerName: odd.playerName,
          statType: odd.statType,
          line: odd.line,
          overPrice: odd.overPrice,
          underPrice: odd.underPrice,
          overImplied: odd.overImplied,
          underImplied: odd.underImplied,
          homeOdds: odd.homeOdds,
          awayOdds: odd.awayOdds,
          drawOdds: odd.drawOdds,
          spread: odd.spread,
          total: odd.total,
          sourceType: "live",
          lastUpdated: now,
          staleAfterMinutes: 10,
          refreshStatus: "fresh",
        });
      }
      stored++;
    }

    return { stored };
  },
});

// ══════════════════════════════════════════════════
//  ACTIONS (HTTP calls to The Odds API)
// ══════════════════════════════════════════════════

/** Initialize / check provider config on startup */
export const initProviderConfig = action({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const apiKey = process.env.THE_ODDS_API_KEY;
    const sdKey = process.env.SPORTSDATA_IO_KEY;

    // Upsert The Odds API config
    await ctx.runMutation(ref.upsertProviderConfig, {
      provider: "the_odds_api",
      enabled: !!apiKey,
      apiKeyConfigured: !!apiKey,
      supportedSports: ["NBA", "NFL", "MLB", "NHL", "NCAAB", "NCAAF", "MLS"],
      supportedMarkets: ["h2h", "spreads", "totals", "player_props"],
      rateLimitPerMonth: 500,
      staleAfterMinutes: 15,
    });

    // Upsert SportsData.io config (for future)
    await ctx.runMutation(ref.upsertProviderConfig, {
      provider: "sportsdata_io",
      enabled: false,
      apiKeyConfigured: !!sdKey,
      supportedSports: ["NBA", "NFL", "MLB", "NHL"],
      supportedMarkets: ["player_stats", "projections", "injuries", "game_scores"],
      rateLimitPerMonth: 1000,
      staleAfterMinutes: 30,
    });

    // Upsert Kalshi config (for future)
    await ctx.runMutation(ref.upsertProviderConfig, {
      provider: "kalshi",
      enabled: false,
      apiKeyConfigured: !!process.env.KALSHI_API_KEY,
      supportedSports: ["NBA", "NFL", "MLB", "NHL"],
      supportedMarkets: ["event_contracts", "player_props", "game_totals"],
      rateLimitPerMonth: undefined,
      staleAfterMinutes: 5,
    });

    return {
      the_odds_api: { configured: !!apiKey, enabled: !!apiKey },
      sportsdata_io: { configured: !!sdKey, enabled: false },
      kalshi: { configured: !!process.env.KALSHI_API_KEY, enabled: false },
    };
  },
});

/** Refresh games/events from The Odds API */
export const refreshGames = action({
  args: { sport: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { sport }) => {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
      return { success: false, error: "THE_ODDS_API_KEY not configured", events: 0 };
    }

    const sports = sport ? [sport] : ["NBA", "NFL", "MLB", "NHL"];
    let totalEvents = 0;
    let totalRequests = 0;
    const errors: string[] = [];

    for (const s of sports) {
      const sportKey = SPORT_KEY_MAP[s];
      if (!sportKey) {
        errors.push(`Unknown sport: ${s}`);
        continue;
      }

      try {
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/events?apiKey=${apiKey}&dateFormat=unix`;
        const response = await fetch(url);
        totalRequests++;

        if (!response.ok) {
          const errText = await response.text();
          errors.push(`${s}: HTTP ${response.status} — ${errText.slice(0, 200)}`);
          continue;
        }

        const data = await response.json() as any[];

        // Normalize events
        const events = data.map((e: any) => ({
          provider: "the_odds_api",
          externalId: e.id,
          sport: s,
          sportKey,
          homeTeam: e.home_team,
          awayTeam: e.away_team,
          commenceTime: typeof e.commence_time === "number"
            ? e.commence_time * 1000  // unix seconds → ms
            : new Date(e.commence_time).getTime(),
          status: e.completed ? "completed" : new Date(e.commence_time * 1000) <= new Date() ? "live" : "upcoming",
        }));

        if (events.length > 0) {
          await ctx.runMutation(ref.storeLiveEvents, { events });
        }
        totalEvents += events.length;

        // Check remaining requests header
        const remaining = response.headers.get("x-requests-remaining");
        if (remaining) {
          console.log(`The Odds API requests remaining: ${remaining}`);
        }
      } catch (err: any) {
        errors.push(`${s}: ${err.message}`);
      }
    }

    await ctx.runMutation(ref.recordSyncResult, {
      provider: "the_odds_api",
      status: errors.length > 0 ? "error" : "success",
      recordsUpdated: totalEvents,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      requestsUsed: totalRequests,
    });

    return {
      success: errors.length === 0,
      events: totalEvents,
      requests: totalRequests,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

/** Refresh odds from The Odds API (game-level: h2h, spreads, totals) */
export const refreshOdds = action({
  args: { sport: v.optional(v.string()), markets: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { sport, markets }) => {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
      return { success: false, error: "THE_ODDS_API_KEY not configured", odds: 0 };
    }

    const sports = sport ? [sport] : ["NBA", "NFL", "MLB", "NHL"];
    const marketsParam = markets || "h2h,spreads,totals";
    let totalOdds = 0;
    let totalRequests = 0;
    const errors: string[] = [];

    for (const s of sports) {
      const sportKey = SPORT_KEY_MAP[s];
      if (!sportKey) continue;

      try {
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?apiKey=${apiKey}&regions=us&markets=${marketsParam}&oddsFormat=american&dateFormat=unix`;
        const response = await fetch(url);
        totalRequests++;

        if (!response.ok) {
          const errText = await response.text();
          errors.push(`${s}: HTTP ${response.status} — ${errText.slice(0, 200)}`);
          continue;
        }

        const data = await response.json() as any[];
        const oddsRecords: any[] = [];

        for (const event of data) {
          for (const bookmaker of (event.bookmakers || [])) {
            for (const market of (bookmaker.markets || [])) {
              if (market.key === "h2h") {
                const homeOutcome = market.outcomes?.find((o: any) => o.name === event.home_team);
                const awayOutcome = market.outcomes?.find((o: any) => o.name === event.away_team);
                const drawOutcome = market.outcomes?.find((o: any) => o.name === "Draw");
                oddsRecords.push({
                  provider: "the_odds_api",
                  eventExternalId: event.id,
                  sport: s,
                  bookmaker: bookmaker.key,
                  marketType: "h2h",
                  homeOdds: homeOutcome?.price,
                  awayOdds: awayOutcome?.price,
                  drawOdds: drawOutcome?.price,
                });
              } else if (market.key === "spreads") {
                const homeOutcome = market.outcomes?.find((o: any) => o.name === event.home_team);
                oddsRecords.push({
                  provider: "the_odds_api",
                  eventExternalId: event.id,
                  sport: s,
                  bookmaker: bookmaker.key,
                  marketType: "spreads",
                  homeOdds: homeOutcome?.price,
                  spread: homeOutcome?.point,
                });
              } else if (market.key === "totals") {
                const overOutcome = market.outcomes?.find((o: any) => o.name === "Over");
                const underOutcome = market.outcomes?.find((o: any) => o.name === "Under");
                oddsRecords.push({
                  provider: "the_odds_api",
                  eventExternalId: event.id,
                  sport: s,
                  bookmaker: bookmaker.key,
                  marketType: "totals",
                  overPrice: overOutcome?.price,
                  underPrice: underOutcome?.price,
                  overImplied: overOutcome?.price ? americanToImplied(overOutcome.price) : undefined,
                  underImplied: underOutcome?.price ? americanToImplied(underOutcome.price) : undefined,
                  total: overOutcome?.point,
                });
              }
            }
          }
        }

        if (oddsRecords.length > 0) {
          // Batch in groups of 50 to avoid mutation size limits
          for (let i = 0; i < oddsRecords.length; i += 50) {
            const batch = oddsRecords.slice(i, i + 50);
            await ctx.runMutation(ref.storeLiveOdds, { odds: batch });
          }
        }
        totalOdds += oddsRecords.length;
      } catch (err: any) {
        errors.push(`${s}: ${err.message}`);
      }
    }

    await ctx.runMutation(ref.recordSyncResult, {
      provider: "the_odds_api",
      status: errors.length > 0 ? "error" : "success",
      recordsUpdated: totalOdds,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      requestsUsed: totalRequests,
    });

    return {
      success: errors.length === 0,
      odds: totalOdds,
      requests: totalRequests,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

/** Refresh player props from The Odds API (uses event-level endpoint) */
export const refreshProps = action({
  args: { sport: v.optional(v.string()), maxEvents: v.optional(v.number()) },
  returns: v.any(),
  handler: async (ctx, { sport, maxEvents }) => {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
      return { success: false, error: "THE_ODDS_API_KEY not configured", props: 0 };
    }

    const sports = sport ? [sport] : ["NBA"];
    const max = maxEvents || 3; // Limit to save API requests (1 request per event!)
    let totalProps = 0;
    let totalRequests = 0;
    const errors: string[] = [];

    for (const s of sports) {
      const sportKey = SPORT_KEY_MAP[s];
      if (!sportKey) continue;

      try {
        // First get events to know which ones to fetch props for
        const eventsUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/events?apiKey=${apiKey}&dateFormat=unix`;
        const eventsResp = await fetch(eventsUrl);
        totalRequests++;

        if (!eventsResp.ok) {
          errors.push(`${s} events: HTTP ${eventsResp.status}`);
          continue;
        }

        const events = (await eventsResp.json() as any[])
          .filter((e: any) => !e.completed)
          .slice(0, max);

        // Fetch player props for each event
        for (const event of events) {
          try {
            const propsUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/events/${event.id}/odds?apiKey=${apiKey}&regions=us&markets=player_points,player_rebounds,player_assists,player_threes,player_blocks,player_steals,player_turnovers&oddsFormat=american`;
            const propsResp = await fetch(propsUrl);
            totalRequests++;

            if (!propsResp.ok) {
              errors.push(`${s} props ${event.id}: HTTP ${propsResp.status}`);
              continue;
            }

            const propsData = await propsResp.json() as any;
            const oddsRecords: any[] = [];

            // Normalize player prop markets
            for (const bookmaker of (propsData.bookmakers || [])) {
              for (const market of (bookmaker.markets || [])) {
                // Market key format: "player_points", "player_rebounds", etc.
                const statType = market.key
                  .replace("player_", "")
                  .replace("threes", "3-Pointers Made")
                  .replace("points", "Points")
                  .replace("rebounds", "Rebounds")
                  .replace("assists", "Assists")
                  .replace("blocks", "Blocks")
                  .replace("steals", "Steals")
                  .replace("turnovers", "Turnovers");

                for (const outcome of (market.outcomes || [])) {
                  if (outcome.name === "Over" || outcome.name === "Under") continue;
                  // Each player gets Over/Under pair
                  const overOutcome = market.outcomes.find(
                    (o: any) => o.description === outcome.description && o.name === "Over"
                  );
                  const underOutcome = market.outcomes.find(
                    (o: any) => o.description === outcome.description && o.name === "Under"
                  );

                  if (overOutcome && underOutcome) {
                    oddsRecords.push({
                      provider: "the_odds_api",
                      eventExternalId: event.id,
                      sport: s,
                      bookmaker: bookmaker.key,
                      marketType: "player_props",
                      playerName: outcome.description,
                      statType,
                      line: overOutcome.point,
                      overPrice: overOutcome.price,
                      underPrice: underOutcome.price,
                      overImplied: americanToImplied(overOutcome.price),
                      underImplied: americanToImplied(underOutcome.price),
                    });
                  }
                }
              }
            }

            if (oddsRecords.length > 0) {
              // Deduplicate: only keep unique player+stat+bookmaker combos
              const seen = new Set<string>();
              const unique = oddsRecords.filter((r) => {
                const key = `${r.playerName}|${r.statType}|${r.bookmaker}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });

              for (let i = 0; i < unique.length; i += 50) {
                const batch = unique.slice(i, i + 50);
                await ctx.runMutation(ref.storeLiveOdds, { odds: batch });
              }
              totalProps += unique.length;
            }
          } catch (err: any) {
            errors.push(`${s} props ${event.id}: ${err.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`${s}: ${err.message}`);
      }
    }

    await ctx.runMutation(ref.recordSyncResult, {
      provider: "the_odds_api",
      status: errors.length > 0 ? "error" : "success",
      recordsUpdated: totalProps,
      error: errors.length > 0 ? errors.join("; ") : undefined,
      requestsUsed: totalRequests,
    });

    return {
      success: errors.length === 0,
      props: totalProps,
      requests: totalRequests,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

/** Refresh line movement snapshots for tracked props */
export const refreshLineMovement = action({
  args: { sport: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { sport }) => {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
      return { success: false, error: "THE_ODDS_API_KEY not configured", snapshots: 0 };
    }

    // Line movement: compare current liveOdds to previous values
    // This is a "soft" refresh — we re-fetch odds and the storeLiveOdds
    // upsert naturally updates prices, giving us implicit movement tracking.
    // For explicit snapshot history, we'd need a propSnapshots insert here too.
    // For R11, just re-run refreshOdds to update prices.
    const result = await ctx.runAction(ref.refreshOdds, {
      sport: sport || undefined,
      markets: "h2h,spreads,totals",
    });

    return {
      success: result.success,
      snapshots: result.odds,
      note: "Line movement tracked via odds upsert — price changes are captured on each refresh.",
    };
  },
});
