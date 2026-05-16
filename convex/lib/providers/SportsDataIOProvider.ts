import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const SportsDataIOProvider: DataProvider = {
	name: "sportsdata_io",
	displayName: "SportsData.io",
	isLive: false,
	supportedSports: ["NBA", "NFL", "MLB", "NHL", "NCAAB", "NCAAF"],
	supportedMarkets: [
		"player_props",
		"game_totals",
		"spreads",
		"projections",
		"injuries",
		"game_results",
	],
	supportedPlatforms: [],
	requiresApiKey: true,
	getStatus(): NormalizedProviderStatus {
		return {
			provider: "sportsdata_io",
			displayName: "SportsData.io",
			status: "inactive",
			isLive: false,
			isDemoMode: false,
			recordsUpdated: 0,
			failedSyncs: 0,
			staleRecords: 0,
			providerHealth: 0,
			supportedSports: this.supportedSports,
			supportedMarkets: this.supportedMarkets,
			supportedPlatforms: [],
			requiresApiKey: true,
			apiKeyConfigured: false,
		};
	},
};
