/**
 * PropEdge AI — Provider Registry
 *
 * Central registry for all data providers.
 */

import { DemoProvider } from "./DemoProvider";
import { SportsDataIOProvider } from "./SportsDataIOProvider";
import { TheOddsAPIProvider } from "./TheOddsAPIProvider";
import { SportradarProvider } from "./SportradarProvider";
import { KalshiProvider } from "./KalshiProvider";
import { ManualImportProvider } from "./ManualImportProvider";
import { ScreenshotImportProvider } from "./ScreenshotImportProvider";

import type { DataProvider, NormalizedProviderStatus } from "../providerTypes";

export const ALL_PROVIDERS: DataProvider[] = [
  DemoProvider,
  SportsDataIOProvider,
  TheOddsAPIProvider,
  SportradarProvider,
  KalshiProvider,
  ManualImportProvider,
  ScreenshotImportProvider,
];

/** Get all provider statuses */
export function getAllProviderStatuses(): NormalizedProviderStatus[] {
  return ALL_PROVIDERS.map((p) => p.getStatus());
}

/** Get the currently active provider (demo for now) */
export function getActiveProvider(): DataProvider {
  return DemoProvider;
}

/** Get a provider by name */
export function getProvider(name: string): DataProvider | undefined {
  return ALL_PROVIDERS.find((p) => p.name === name);
}

export {
  DemoProvider,
  SportsDataIOProvider,
  TheOddsAPIProvider,
  SportradarProvider,
  KalshiProvider,
  ManualImportProvider,
  ScreenshotImportProvider,
};
