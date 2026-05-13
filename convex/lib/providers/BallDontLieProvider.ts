/**
 * BALLDONTLIE — NBA Backup/Enrichment Provider (R13)
 *
 * Free tier: 30 requests/min (no key needed for basic), API key for higher limits.
 * Covers: NBA players, teams, games, stats, season averages.
 * API key: BALLDONTLIE_KEY (optional, server-side only)
 *
 * Base URL: https://api.balldontlie.io/v1/
 * Endpoints:
 *   - /players, /teams, /games, /stats, /season_averages
 *
 * Priority 3: NBA backup and enrichment data.
 */

import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

declare const process: { env: Record<string, string | undefined> };

export const BallDontLieProvider: DataProvider = {
  name: "balldontlie",
  displayName: "BALLDONTLIE",
  isLive: false,
  supportedSports: ["NBA"],
  supportedMarkets: ["players", "teams", "games", "statistics", "season_averages"],
  supportedPlatforms: [],
  requiresApiKey: false, // Basic tier works without key
  getStatus(): NormalizedProviderStatus {
    // BALLDONTLIE works without a key (basic tier) but key gives higher limits
    const hasKey = typeof process !== "undefined" && !!process.env?.BALLDONTLIE_KEY;
    return {
      provider: "balldontlie",
      displayName: "BALLDONTLIE",
      status: "inactive",  // Will be "active" once we implement the adapter
      isLive: false,
      isDemoMode: false,
      recordsUpdated: 0,
      failedSyncs: 0,
      staleRecords: 0,
      providerHealth: 0,
      supportedSports: this.supportedSports,
      supportedMarkets: this.supportedMarkets,
      supportedPlatforms: this.supportedPlatforms,
      requiresApiKey: false,
      apiKeyConfigured: hasKey,
    };
  },
};
