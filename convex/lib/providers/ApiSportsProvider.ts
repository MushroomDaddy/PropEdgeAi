/**
 * API-SPORTS — Structured Sports Data Provider (R13)
 *
 * Affordable structured data bridge for NBA/NFL/MLB/NHL.
 * Covers: teams, players, games, standings, injuries, live scores, statistics.
 * API key: API_SPORTS_KEY (server-side only, never expose to browser)
 *
 * Priority 2 behind The Odds API.
 */

import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

declare const process: { env: Record<string, string | undefined> };

export const ApiSportsProvider: DataProvider = {
	name: "api_sports",
	displayName: "API-SPORTS",
	isLive: false,
	supportedSports: ["NBA", "NFL", "MLB", "NHL"],
	supportedMarkets: [
		"teams",
		"players",
		"games",
		"standings",
		"statistics",
		"injuries",
		"live_scores",
	],
	supportedPlatforms: [],
	requiresApiKey: true,
	getStatus(): NormalizedProviderStatus {
		const hasKey =
			typeof process !== "undefined" && !!process.env?.API_SPORTS_KEY;
		return {
			provider: "api_sports",
			displayName: "API-SPORTS",
			status: hasKey ? "active" : "inactive",
			isLive: hasKey,
			isDemoMode: false,
			recordsUpdated: 0,
			failedSyncs: 0,
			staleRecords: 0,
			providerHealth: hasKey ? 85 : 0,
			supportedSports: this.supportedSports,
			supportedMarkets: this.supportedMarkets,
			supportedPlatforms: this.supportedPlatforms,
			requiresApiKey: true,
			apiKeyConfigured: hasKey,
		};
	},
};
