/**
 * TheSportsDB — Media/Visual Provider (R13)
 *
 * Free tier for personal/education use.
 * Covers: team logos, player images, badges, fanart, league artwork, jersey images.
 * API key: THESPORTSDB_API_KEY (server-side only) — free key = "123" for dev
 *
 * Base URL: https://www.thesportsdb.com/api/v1/json/{key}/
 * Endpoints:
 *   - searchteams.php?t={team_name}
 *   - searchplayers.php?p={player_name}
 *   - lookup_all_teams.php?id={league_id}
 *   - lookupleague.php?id={league_id}
 *
 * Priority 4: team logos, player images, badges, fanart, league artwork.
 */

import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

declare const process: { env: Record<string, string | undefined> };

export const TheSportsDBProvider: DataProvider = {
  name: "thesportsdb",
  displayName: "TheSportsDB",
  isLive: false,
  supportedSports: [
    "NBA",
    "NFL",
    "MLB",
    "NHL",
    "MLS",
    "EPL",
    "LaLiga",
    "Bundesliga",
  ],
  supportedMarkets: [
    "team_logos",
    "player_images",
    "badges",
    "fanart",
    "jersey_images",
    "league_artwork",
  ],
  supportedPlatforms: [],
  requiresApiKey: true,
  getStatus(): NormalizedProviderStatus {
    const hasKey =
      typeof process !== "undefined" && !!process.env?.THESPORTSDB_API_KEY;
    return {
      provider: "thesportsdb",
      displayName: "TheSportsDB",
      status: hasKey ? "active" : "inactive",
      isLive: hasKey,
      isDemoMode: false,
      recordsUpdated: 0,
      failedSyncs: 0,
      staleRecords: 0,
      providerHealth: hasKey ? 75 : 0,
      supportedSports: this.supportedSports,
      supportedMarkets: this.supportedMarkets,
      supportedPlatforms: this.supportedPlatforms,
      requiresApiKey: true,
      apiKeyConfigured: hasKey,
    };
  },
};
