import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const TheOddsAPIProvider: DataProvider = {
  name: "the_odds_api",
  displayName: "The Odds API",
  isLive: false,
  supportedSports: ["NBA", "NFL", "MLB", "NHL", "NCAAB", "NCAAF", "Soccer", "Tennis"],
  supportedMarkets: ["moneyline", "spreads", "totals", "player_props", "futures"],
  supportedPlatforms: ["DraftKings", "FanDuel", "BetMGM", "Caesars", "PointsBet", "BetRivers"],
  requiresApiKey: true,
  getStatus(): NormalizedProviderStatus {
    return {
      provider: "the_odds_api",
      displayName: "The Odds API",
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
      requiresApiKey: true,
      apiKeyConfigured: false,
    };
  },
};
