/**
 * PropEdge AI — Provider Registry (R13 update)
 *
 * Central registry for all data providers.
 * Priority order:
 *   1. The Odds API = odds, lines, props, bookmaker data
 *   2. API-SPORTS = structured sports data (NBA/NFL/MLB/NHL)
 *   3. BALLDONTLIE = NBA backup/enrichment
 *   4. TheSportsDB = team logos, player images, fanart, visuals
 *   5. SerpApi = search/news/injury/matchup context only
 *   6. Manual import = slips/CSV/screenshot pipeline
 *   7. Demo provider = fallback only
 */

import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";
import { ApiSportsProvider } from "./ApiSportsProvider";
import { BallDontLieProvider } from "./BallDontLieProvider";
import { DemoProvider } from "./DemoProvider";
import { KalshiProvider } from "./KalshiProvider";
import { ManualImportProvider } from "./ManualImportProvider";
import { ScreenshotImportProvider } from "./ScreenshotImportProvider";
import { SerpApiProvider } from "./SerpApiProvider";
import { SportradarProvider } from "./SportradarProvider";
import { SportsDataIOProvider } from "./SportsDataIOProvider";
import { TheOddsAPIProvider } from "./TheOddsAPIProvider";
import { TheSportsDBProvider } from "./TheSportsDBProvider";

export const ALL_PROVIDERS: DataProvider[] = [
  // Priority 1: Odds & lines
  TheOddsAPIProvider,
  // Priority 2: Structured sports data
  ApiSportsProvider,
  // Priority 3: NBA backup
  BallDontLieProvider,
  // Priority 4: Media/visuals
  TheSportsDBProvider,
  // Priority 5: Search/context
  SerpApiProvider,
  // Priority 6: Manual
  ManualImportProvider,
  ScreenshotImportProvider,
  // Premium stubs (not yet active)
  SportsDataIOProvider,
  SportradarProvider,
  KalshiProvider,
  // Priority 7: Fallback
  DemoProvider,
];

/** Get all provider statuses */
export function getAllProviderStatuses(): NormalizedProviderStatus[] {
  return ALL_PROVIDERS.map(p => p.getStatus());
}

/** Get the currently active provider (demo for now) */
export function getActiveProvider(): DataProvider {
  return DemoProvider;
}

/** Get a provider by name */
export function getProvider(name: string): DataProvider | undefined {
  return ALL_PROVIDERS.find(p => p.name === name);
}

export {
  DemoProvider,
  SportsDataIOProvider,
  TheOddsAPIProvider,
  SportradarProvider,
  KalshiProvider,
  ManualImportProvider,
  ScreenshotImportProvider,
  ApiSportsProvider,
  TheSportsDBProvider,
  BallDontLieProvider,
  SerpApiProvider,
};
