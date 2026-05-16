import { query } from "./_generated/server";
import { v } from "convex/values";

export const allProviders = query({
  args: {},
  handler: async (ctx) => {
    // Get DB stats
    const props = await ctx.db.query("props").collect();
    const players = await ctx.db.query("players").collect();
    const games = await ctx.db.query("games").collect();
    const results = await (ctx.db as any).query("results").collect();
    const kalshiMarkets = await ctx.db.query("kalshiMarkets").collect();
    const importJobs = await ctx.db.query("importJobs").collect();
    
    // Check live data status
    const hasLiveOdds = await ctx.db.query("liveOdds").first();
    const hasLiveEvents = await ctx.db.query("liveEvents").first();
    
    // Define providers and their status
    const providers = [
      {
        name: "TheOddsAPI",
        type: "odds",
        status: "demo" as const,
        description: "NFL, NBA, MLB, NHL odds (demo mode)",
      },
      {
        name: "API-SPORTS",
        type: "sports_data",
        status: "demo" as const,
        description: "NBA, NFL, MLB, NHL data (demo mode)",
      },
      {
        name: "BallDontLie",
        type: "sports_data",
        status: "demo" as const,
        description: "NBA players and stats (demo mode)",
      },
      {
        name: "TheSportsDB",
        type: "media",
        status: "not_implemented" as const,
        description: "Team logos, player images, media assets (not implemented)",
      },
      {
        name: "Kalshi",
        type: "prediction_market",
        status: "demo" as const,
        description: "Prediction market data (demo mode)",
      },
      {
        name: "Sportradar",
        type: "sports_data",
        status: "inactive" as const,
        description: "Professional sports data (not configured)",
      },
    ];

    // Determine mode
    const mode = "demo" as const; // TODO: detect from env/config

    return {
      mode,
      dbStats: {
        props: props.length,
        players: players.length,
        games: games.length,
        myResults: results.length,
        kalshiMarkets: kalshiMarkets.length,
        myImportJobs: importJobs.length,
        liveEvents: hasLiveEvents ? 1 : 0,
        liveOdds: hasLiveOdds ? 1 : 0,
      },
      providers,
      health: {
        status: "healthy" as const,
        message: "All systems operational (demo mode)",
      },
    };
  },
});
