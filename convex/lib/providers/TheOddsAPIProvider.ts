import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

/**
 * The Odds API — Live Provider (R11)
 *
 * Free tier: 500 requests/month
 * Covers: NBA, NFL, MLB, NHL, NCAAB, NCAAF, Soccer, Tennis
 * Markets: h2h, spreads, totals, player_props
 * Env var: THE_ODDS_API_KEY
 *
 * When API key is present → status "active", isLive true
 * When missing → status "inactive", isLive false
 */
export const TheOddsAPIProvider: DataProvider = {
  name: "the_odds_api",
  displayName: "The Odds API",
  isLive: false,
  supportedSports: [
    "NBA",
    "NFL",
    "MLB",
    "NHL",
    "NCAAB",
    "NCAAF",
    "Soccer",
    "Tennis",
  ],
  supportedMarkets: ["h2h", "spreads", "totals", "player_props"],
  supportedPlatforms: [
    "DraftKings",
    "FanDuel",
    "BetMGM",
    "Caesars",
    "PointsBet",
    "BetRivers",
  ],
  requiresApiKey: true,
  getStatus(): NormalizedProviderStatus {
    // In browser context process.env isn't available — safe check
    const hasKey =
      typeof process !== "undefined" && !!process.env?.THE_ODDS_API_KEY;
    return {
      provider: "the_odds_api",
      displayName: "The Odds API",
      status: hasKey ? "active" : "inactive",
      isLive: hasKey,
      isDemoMode: false,
      recordsUpdated: 0,
      failedSyncs: 0,
      staleRecords: 0,
      providerHealth: hasKey ? 80 : 0,
      supportedSports: this.supportedSports,
      supportedMarkets: this.supportedMarkets,
      supportedPlatforms: this.supportedPlatforms,
      requiresApiKey: true,
      apiKeyConfigured: hasKey,
    };
  },
};
