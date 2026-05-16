/**
 * PropEdge AI — Normalized Provider Types
 *
 * All data from any provider gets normalized into these 11 types.
 * Each record must have: provider, sourceType, externalId, lastUpdated,
 * staleAfterMinutes, refreshStatus, confidenceInSource.
 */

// ── Provider Metadata (attached to every normalized record) ──

export interface ProviderMeta {
  provider: string;
  sourceType: string; // "api" | "manual" | "csv" | "screenshot" | "demo"
  externalId?: string;
  lastUpdated: number; // ms epoch
  staleAfterMinutes: number;
  refreshStatus: string; // "fresh" | "stale" | "error" | "refreshing"
  confidenceInSource: number; // 0-100
}

// ── 11 Normalized Types ──

export interface NormalizedGame extends ProviderMeta {
  gameId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: number;
  status: string; // "upcoming" | "live" | "final"
  homeScore?: number;
  awayScore?: number;
  quarter?: string;
  gameClock?: string;
  broadcast?: string;
}

export interface NormalizedPlayer extends ProviderMeta {
  playerId: string;
  name: string;
  team: string;
  position: string;
  sport: string;
  jerseyNumber?: string;
  imageUrl?: string;
  teamLogoUrl?: string;
  teamColor?: string;
  injuryStatus?: string;
}

export interface NormalizedTeam extends ProviderMeta {
  teamId: string;
  name: string;
  abbreviation: string;
  sport: string;
  conference?: string;
  division?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export interface NormalizedProp extends ProviderMeta {
  propId: string;
  playerId: string;
  playerName: string;
  team: string;
  statType: string;
  line: number;
  overUnder: string;
  platform: string;
  sport: string;
  gameId?: string;
  projection?: number;
  edge?: number;
  confidence?: number;
}

export interface NormalizedOdds extends ProviderMeta {
  propId: string;
  bookmaker: string;
  overOdds: number;
  underOdds: number;
  overImplied: number;
  underImplied: number;
  lastUpdate: number;
}

export interface NormalizedProjection extends ProviderMeta {
  playerId: string;
  playerName: string;
  statType: string;
  projectedValue: number;
  source: string; // "numberfire" | "fantasypros" | "rotowire" | "manual"
  floor?: number;
  ceiling?: number;
}

export interface NormalizedInjury extends ProviderMeta {
  playerId: string;
  playerName: string;
  team: string;
  status: string; // "out" | "doubtful" | "questionable" | "probable"
  injuryType: string;
  returnDate?: string;
  reportDate: number;
}

export interface NormalizedResult extends ProviderMeta {
  gameId: string;
  playerId: string;
  playerName: string;
  statType: string;
  actualValue: number;
  minutesPlayed?: number;
  gameStatus?: string; // "final" | "overtime" | "shortened"
}

export interface NormalizedLineSnapshot extends ProviderMeta {
  propId: string;
  timestamp: number;
  line: number;
  overOdds: number;
  underOdds: number;
  bookmaker?: string;
}

export interface NormalizedKalshiMarket extends ProviderMeta {
  marketTicker: string;
  eventTicker: string;
  title: string;
  category: string;
  sport?: string;
  yesPrice: number; // cents 0-100
  noPrice: number; // cents 0-100
  yesBid: number;
  noBid: number;
  impliedYesProbability: number;
  impliedNoProbability: number;
  marketVolume: number;
  liquidityScore: number;
  settlementStatus: string; // "open" | "settled_yes" | "settled_no" | "voided"
  closeTime?: number;
  expirationTime?: number;
  expectedPayout?: number;
  contractSide?: "yes" | "no";
  marketClosePrice?: number;
}

export interface NormalizedProviderStatus {
  provider: string;
  displayName: string;
  status: string; // "active" | "inactive" | "error" | "demo"
  isLive: boolean;
  isDemoMode: boolean;
  lastSyncTime?: number;
  nextSyncTime?: number;
  recordsUpdated: number;
  failedSyncs: number;
  staleRecords: number;
  providerHealth: number; // 0-100
  supportedSports: string[];
  supportedMarkets: string[];
  supportedPlatforms: string[];
  requiresApiKey: boolean;
  apiKeyConfigured: boolean;
}

// ── DataProvider Interface ──

export interface DataProvider {
  name: string;
  displayName: string;
  isLive: boolean;
  supportedSports: string[];
  supportedMarkets: string[];
  supportedPlatforms: string[];
  requiresApiKey: boolean;
  getStatus(): NormalizedProviderStatus;
}
