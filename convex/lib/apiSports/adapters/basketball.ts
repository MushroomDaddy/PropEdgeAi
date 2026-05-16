/**
 * PropEdge AI — API-SPORTS Basketball Adapter (R13)
 *
 * Handles NBA data from v1.basketball.api-sports.io
 */

import { apiSportsFetch } from "../client";
import { getSportConfig } from "../config";
import type {
  NormalizedApiGame,
  NormalizedApiTeam,
  RawBasketballGame,
  RawBasketballTeam,
} from "../types";
import type { SportAdapter } from "./index";

const SPORT = "NBA";

function normalizeTeam(raw: RawBasketballTeam): NormalizedApiTeam {
  return {
    apiSportsId: raw.id,
    name: raw.name,
    abbreviation: raw.code,
    city: raw.city,
    sport: SPORT,
    logoUrl: raw.logo,
    provider: "api_sports",
    lastUpdated: Date.now(),
  };
}

function normalizeGameStatus(
  status: RawBasketballGame["status"],
): NormalizedApiGame["status"] {
  const s = status.short.toUpperCase();
  if (s === "NS" || s === "TBD") return "upcoming";
  if (s === "F" || s === "FT") return "final";
  if (s === "PST") return "postponed";
  if (s === "CANC") return "cancelled";
  return "live";
}

function normalizeGame(raw: RawBasketballGame): NormalizedApiGame {
  return {
    apiSportsId: raw.id,
    sport: SPORT,
    homeTeam: raw.teams.home.name,
    awayTeam: raw.teams.away.name,
    homeTeamId: raw.teams.home.id,
    awayTeamId: raw.teams.away.id,
    gameTime: new Date(raw.date).getTime(),
    status: normalizeGameStatus(raw.status),
    homeScore: raw.scores.home,
    awayScore: raw.scores.away,
    season: raw.league.season,
    provider: "api_sports",
    lastUpdated: Date.now(),
  };
}

export const basketballAdapter: SportAdapter = {
  sport: SPORT,

  async getTeams(league?: string) {
    const config = getSportConfig(SPORT);
    const params: Record<string, string | number> = {
      league: league || config.leagueId,
    };
    if (config.season) params.season = config.season;
    const result = await apiSportsFetch<RawBasketballTeam>(
      config.baseUrl,
      config.endpoints.teams,
      params,
    );
    if (!result.ok) return result as any;
    return { ...result, data: result.data.map(normalizeTeam) };
  },

  async getPlayers(_sport: string, _teamId?: string) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: { code: "not_implemented", message: "getPlayers not implemented for basketball" }
    };
  },

  async getGames(_sport: string, dateRange?: { from: string; to: string }) {
    const config = getSportConfig(SPORT);
    const params: Record<string, string | number> = { league: config.leagueId };
    if (config.season) params.season = config.season;
    if (dateRange?.from) params.date = dateRange.from;
    const result = await apiSportsFetch<RawBasketballGame>(
      config.baseUrl,
      config.endpoints.games,
      params,
    );
    if (!result.ok) return result as any;
    return { ...result, data: result.data.map(normalizeGame) };
  },

  async getStandings(_sport: string, league?: string, season?: string) {
    const config = getSportConfig(SPORT);
    if (!config.endpoints.standings)
      return {
        ok: false,
        data: [],
        requestsUsed: 0,
        requestsRemaining: 0,
        error: { code: "not_implemented", message: "getStandings endpoint not configured for basketball" }
      };
    const params: Record<string, string | number> = {
      league: league || config.leagueId,
      season: season || config.season || "",
    };
    const result = await apiSportsFetch<any>(
      config.baseUrl,
      config.endpoints.standings,
      params,
    );
    if (!result.ok) return result as any;
    const normalized = result.data.map((raw: any) => ({
      apiSportsTeamId: raw.team?.id ?? 0,
      teamName: raw.team?.name ?? "Unknown",
      sport: SPORT,
      season: parseInt(season || config.season?.toString() || "0", 10),
      conference: raw.conference?.name,
      wins: raw.win?.total ?? 0,
      losses: raw.loss?.total ?? 0,
      winPct:
        (raw.win?.total ?? 0) /
        Math.max(1, (raw.win?.total ?? 0) + (raw.loss?.total ?? 0)),
      rank: raw.rank,
      provider: "api_sports" as const,
      lastUpdated: Date.now(),
    }));
    return { ...result, data: normalized };
  },

  async getPlayerStats(_sport: string, _playerId: string, _season?: string) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: { code: "not_implemented", message: "getPlayerStats not implemented for basketball" }
    };
  },

  async getTeamStats(_sport: string, _teamId: string, _season?: string) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: { code: "not_implemented", message: "getTeamStats not implemented for basketball" }
    };
  },

  async getInjuries(_sport: string, _teamId?: string) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: { code: "not_implemented", message: "getInjuries not implemented for basketball" }
    };
  },

  async getLiveScores() {
    const config = getSportConfig(SPORT);
    const result = await apiSportsFetch<RawBasketballGame>(
      config.baseUrl,
      config.endpoints.liveScores || config.endpoints.games,
      {
        league: config.leagueId,
        live: "all",
      },
    );
    if (!result.ok) return result as any;
    return { ...result, data: result.data.map(normalizeGame) };
  },
};
