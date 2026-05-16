import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const DemoProvider: DataProvider = {
	name: "demo",
	displayName: "Demo Data",
	isLive: false,
	supportedSports: ["NBA", "NFL", "MLB", "NHL"],
	supportedMarkets: ["player_props", "game_totals", "spreads"],
	supportedPlatforms: ["PrizePicks", "Underdog", "DraftKings", "FanDuel"],
	requiresApiKey: false,
	getStatus(): NormalizedProviderStatus {
		return {
			provider: "demo",
			displayName: "Demo Data",
			status: "active",
			isLive: false,
			isDemoMode: true,
			lastSyncTime: Date.now(),
			nextSyncTime: undefined,
			recordsUpdated: 0,
			failedSyncs: 0,
			staleRecords: 0,
			providerHealth: 100,
			supportedSports: ["NBA", "NFL", "MLB", "NHL"],
			supportedMarkets: ["player_props", "game_totals", "spreads"],
			supportedPlatforms: ["PrizePicks", "Underdog", "DraftKings", "FanDuel"],
			requiresApiKey: false,
			apiKeyConfigured: false,
		};
	},
};
