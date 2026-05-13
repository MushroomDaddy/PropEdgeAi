import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const KalshiProvider: DataProvider = {
  name: "kalshi",
  displayName: "Kalshi",
  isLive: false,
  supportedSports: ["NBA", "NFL", "MLB", "NHL"],
  supportedMarkets: ["binary_contracts", "event_contracts", "player_performance"],
  supportedPlatforms: ["Kalshi"],
  requiresApiKey: true,
  getStatus(): NormalizedProviderStatus {
    return {
      provider: "kalshi",
      displayName: "Kalshi",
      status: "inactive",
      isLive: false,
      isDemoMode: false,
      recordsUpdated: 0,
      failedSyncs: 0,
      staleRecords: 0,
      providerHealth: 0,
      supportedSports: this.supportedSports,
      supportedMarkets: this.supportedMarkets,
      supportedPlatforms: ["Kalshi"],
      requiresApiKey: true,
      apiKeyConfigured: false,
    };
  },
};
