/**
 * SerpApi — Search/News/Context Provider (R13)
 *
 * For search, news, injury reports, matchup context.
 * NOT for verified stat calculations — context/enrichment only.
 * API key: SERPAPI_KEY (server-side only)
 *
 * Priority 5: search/news/injury/matchup context only.
 */

import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

declare const process: { env: Record<string, string | undefined> };

export const SerpApiProvider: DataProvider = {
	name: "serpapi",
	displayName: "SerpApi",
	isLive: false,
	supportedSports: ["NBA", "NFL", "MLB", "NHL", "MLS"],
	supportedMarkets: ["news", "injuries_context", "matchup_context", "search"],
	supportedPlatforms: [],
	requiresApiKey: true,
	getStatus(): NormalizedProviderStatus {
		const hasKey = typeof process !== "undefined" && !!process.env?.SERPAPI_KEY;
		return {
			provider: "serpapi",
			displayName: "SerpApi",
			status: hasKey ? "active" : "inactive",
			isLive: hasKey,
			isDemoMode: false,
			recordsUpdated: 0,
			failedSyncs: 0,
			staleRecords: 0,
			providerHealth: hasKey ? 70 : 0,
			supportedSports: this.supportedSports,
			supportedMarkets: this.supportedMarkets,
			supportedPlatforms: this.supportedPlatforms,
			requiresApiKey: true,
			apiKeyConfigured: hasKey,
		};
	},
};
