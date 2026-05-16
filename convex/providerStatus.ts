import { query } from "./_generated/server";
import { v } from "convex/values";

declare const process: { env: Record<string, string | undefined> };

/** Check if an env var is set and non-empty */
function envConfigured(key: string): boolean {
	return !!(typeof process !== "undefined" && process.env && process.env[key]);
}

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

		// Detect provider status from env vars
		const oddsConfigured = envConfigured("THE_ODDS_API_KEY");
		const apiSportsConfigured = envConfigured("API_SPORTS_KEY");
		const bdlConfigured = envConfigured("BALLDONTLIE_API_KEY");
		const kalshiConfigured = envConfigured("KALSHI_API_KEY");

		// Define providers and their status
		const providers = [
			{
				name: "TheOddsAPI",
				type: "odds",
				status: oddsConfigured ? ("active" as const) : ("demo" as const),
				description: oddsConfigured
					? "NFL, NBA, MLB, NHL odds (live)"
					: "NFL, NBA, MLB, NHL odds (demo mode — set THE_ODDS_API_KEY)",
			},
			{
				name: "API-SPORTS",
				type: "sports_data",
				status: apiSportsConfigured
					? ("active" as const)
					: ("demo" as const),
				description: apiSportsConfigured
					? "NBA, NFL, MLB, NHL data (live)"
					: "NBA, NFL, MLB, NHL data (demo mode — set API_SPORTS_KEY)",
			},
			{
				name: "BallDontLie",
				type: "sports_data",
				status: bdlConfigured ? ("active" as const) : ("demo" as const),
				description: bdlConfigured
					? "NBA players and stats (live)"
					: "NBA players and stats (demo mode — set BALLDONTLIE_API_KEY)",
			},
			{
				name: "TheSportsDB",
				type: "media",
				status: "not_implemented" as const,
				description:
					"Team logos, player images, media assets (not implemented)",
			},
			{
				name: "Kalshi",
				type: "prediction_market",
				status: kalshiConfigured
					? ("active" as const)
					: ("demo" as const),
				description: kalshiConfigured
					? "Prediction market data (live)"
					: "Prediction market data (demo mode — set KALSHI_API_KEY)",
			},
			{
				name: "Sportradar",
				type: "sports_data",
				status: "inactive" as const,
				description: "Professional sports data (not configured)",
			},
		];

		// Determine overall mode
		const anyLive = oddsConfigured || apiSportsConfigured;
		const mode = anyLive ? ("live" as const) : ("demo" as const);

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
				message: anyLive
					? "Live providers active"
					: "All systems operational (demo mode)",
			},
		};
	},
});
