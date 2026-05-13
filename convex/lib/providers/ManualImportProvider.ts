import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const ManualImportProvider: DataProvider = {
  name: "manual_import",
  displayName: "Manual Import",
  isLive: true,
  supportedSports: ["NBA", "NFL", "MLB", "NHL"],
  supportedMarkets: ["player_props"],
  supportedPlatforms: ["PrizePicks", "Underdog", "DraftKings", "FanDuel", "Kalshi"],
  requiresApiKey: false,
  getStatus(): NormalizedProviderStatus {
    return {
      provider: "manual_import",
      displayName: "Manual Import",
      status: "active",
      isLive: true,
      isDemoMode: false,
      recordsUpdated: 0,
      failedSyncs: 0,
      staleRecords: 0,
      providerHealth: 100,
      supportedSports: this.supportedSports,
      supportedMarkets: this.supportedMarkets,
      supportedPlatforms: this.supportedPlatforms,
      requiresApiKey: false,
      apiKeyConfigured: false,
    };
  },
};
