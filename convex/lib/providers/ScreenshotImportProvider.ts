import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const ScreenshotImportProvider: DataProvider = {
  name: "screenshot_import",
  displayName: "Screenshot Import",
  isLive: false,
  supportedSports: ["NBA", "NFL", "MLB", "NHL"],
  supportedMarkets: ["player_props"],
  supportedPlatforms: ["PrizePicks", "Underdog", "DraftKings", "FanDuel"],
  requiresApiKey: false,
  getStatus(): NormalizedProviderStatus {
    return {
      provider: "screenshot_import",
      displayName: "Screenshot Import",
      status: "inactive",
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
      apiKeyConfigured: false,
    };
  },
};
