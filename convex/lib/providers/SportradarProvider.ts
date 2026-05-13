import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const SportradarProvider: DataProvider = {
  name: "sportradar",
  displayName: "Sportradar",
  isLive: false,
  supportedSports: ["NBA", "NFL", "MLB", "NHL", "Soccer", "Tennis", "Golf"],
  supportedMarkets: ["player_props", "live_odds", "game_results", "injuries", "lineups"],
  supportedPlatforms: [],
  requiresApiKey: true,
  getStatus(): NormalizedProviderStatus {
    return {
      provider: "sportradar",
      displayName: "Sportradar",
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
