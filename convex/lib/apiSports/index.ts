/**
 * PropEdge AI — API-SPORTS Main Entry (R13)
 *
 * 10 normalized methods + health check.
 * All methods go through sport-specific adapters.
 * Never call from frontend — always through Convex actions.
 */

import { getAdapter, getSupportedSports } from "./adapters";
import type { ApiSportsResult } from "./client";
import { isApiSportsConfigured } from "./client";
import {
  ALL_ENDPOINTS,
  API_SPORTS_DAILY_LIMIT,
  SUPPORTED_SPORTS,
} from "./config";
import type {
  ApiSportsHealth,
  NormalizedApiGame,
  NormalizedApiInjury,
  NormalizedApiPlayer,
  NormalizedApiPlayerStats,
  NormalizedApiStanding,
  NormalizedApiTeam,
} from "./types";

// ── Helper: require adapter ──
function requireAdapter(sport: string) {
  const adapter = getAdapter(sport);
  if (!adapter) {
    return {
      ok: false as const,
      data: [] as any[],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: {
        code: "api_error" as const,
        message: `Sport "${sport}" is not supported. Available: ${getSupportedSports().join(", ")}`,
      },
    };
  }
  return { ok: true as const, adapter };
}

// ══════════════════════════════════════════════════
//  10 NORMALIZED METHODS
// ══════════════════════════════════════════════════

/** Get teams for a sport */
export async function getTeams(
  sport: string,
  league?: string,
): Promise<ApiSportsResult<NormalizedApiTeam>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getTeams(league);
}

/** Get players for a sport (optional team filter) */
export async function getPlayers(
  sport: string,
  teamId?: string,
): Promise<ApiSportsResult<NormalizedApiPlayer>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getPlayers(sport, teamId);
}

/** Get games/fixtures for a sport (optional date range) */
export async function getGames(
  sport: string,
  dateRange?: { from: string; to: string },
): Promise<ApiSportsResult<NormalizedApiGame>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getGames(sport, dateRange);
}

/** Get standings for a sport */
export async function getStandings(
  sport: string,
  league?: string,
  season?: string,
): Promise<ApiSportsResult<NormalizedApiStanding>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getStandings(sport, league, season);
}

/** Get player game-level stats */
export async function getPlayerStats(
  sport: string,
  playerId: string,
  season?: string,
): Promise<ApiSportsResult<NormalizedApiPlayerStats>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getPlayerStats(sport, playerId, season);
}

/** Get team-level aggregate stats */
export async function getTeamStats(
  sport: string,
  teamId: string,
  season?: string,
): Promise<ApiSportsResult<any>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getTeamStats(sport, teamId, season);
}

/** Get injuries for a sport (optional team filter) */
export async function getInjuries(
  sport: string,
  teamId?: string,
): Promise<ApiSportsResult<NormalizedApiInjury>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getInjuries(sport, teamId);
}

/** Get live scores for a sport */
export async function getLiveScores(
  sport: string,
): Promise<ApiSportsResult<NormalizedApiGame>> {
  const a = requireAdapter(sport);
  if (!a.ok) return a;
  return a.adapter.getLiveScores();
}

/** Search for a player by name (checks all supported sports or specific sport) */
export async function searchPlayer(
  name: string,
  sport?: string,
): Promise<ApiSportsResult<NormalizedApiPlayer>> {
  if (!isApiSportsConfigured()) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: { code: "not_configured", message: "API_SPORTS_KEY not set" },
    };
  }

    // If sport specified, search that sport only
    if (sport) {
      const a = requireAdapter(sport);
      if (!a.ok) return a;
      // API-SPORTS search requires fetching all players for a team; not implemented yet
      return { ok: false, data: [], requestsUsed:0, requestsRemaining:0, error: { code: "not_implemented", message: "Player search not implemented" } };
    }

  // Cross-sport search: try each sport
  const allPlayers: NormalizedApiPlayer[] = [];
  let totalUsed = 0;
  let remaining = 0;

  for (const s of getSupportedSports()) {
    const adapter = getAdapter(s);
    if (!adapter) continue;
    const result = await adapter.getPlayers(s);
    if (result.ok) {
      const matches = result.data.filter(p =>
        p.name.toLowerCase().includes(name.toLowerCase()),
      );
      allPlayers.push(...matches);
      totalUsed += result.requestsUsed;
      remaining = result.requestsRemaining;
    }
  }

  return {
    ok: true,
    data: allPlayers,
    requestsUsed: totalUsed,
    requestsRemaining: remaining,
  };
}

/** Search for a team by name */
export async function searchTeam(
  name: string,
  sport?: string,
): Promise<ApiSportsResult<NormalizedApiTeam>> {
  if (!isApiSportsConfigured()) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: { code: "not_configured", message: "API_SPORTS_KEY not set" },
    };
  }

  const sports = sport ? [sport] : getSupportedSports();
  const allTeams: NormalizedApiTeam[] = [];
  let totalUsed = 0;
  let remaining = 0;

  for (const s of sports) {
    const adapter = getAdapter(s);
    if (!adapter) continue;
    const result = await adapter.getTeams();
    if (result.ok) {
      const matches = result.data.filter(
        t =>
          t.name.toLowerCase().includes(name.toLowerCase()) ||
          t.abbreviation.toLowerCase().includes(name.toLowerCase()),
      );
      allTeams.push(...matches);
      totalUsed += result.requestsUsed;
      remaining = result.requestsRemaining;
    }
  }

  return {
    ok: true,
    data: allTeams,
    requestsUsed: totalUsed,
    requestsRemaining: remaining,
  };
}

/** Health check — provider status without making API calls */
export function providerHealthCheck(): ApiSportsHealth {
  const configured = isApiSportsConfigured();
  return {
    configured,
    enabled: configured,
    requestsUsedToday: 0, // Will be updated from DB in Convex action
    dailyLimit: API_SPORTS_DAILY_LIMIT,
    supportedSports: SUPPORTED_SPORTS,
    supportedEndpoints: [...ALL_ENDPOINTS],
    sourceLabel: "API-SPORTS",
    dataType: "structured",
    officialStatsProvider: true,
  };
}

// Re-exports
export { isApiSportsConfigured } from "./client";
export { API_SPORTS_DAILY_LIMIT, SUPPORTED_SPORTS } from "./config";
export type { ApiSportsHealth } from "./types";
