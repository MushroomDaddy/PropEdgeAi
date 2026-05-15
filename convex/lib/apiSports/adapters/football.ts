/**
 * PropEdge AI — API-SPORTS American Football Adapter (R13)
 *
 * Handles NFL data from v1.american-football.api-sports.io
 */

import { apiSportsFetch } from "../client";
import { getSportConfig } from "../config";
import type {
  RawFootballTeam, RawFootballGame,
  NormalizedApiTeam, NormalizedApiGame, NormalizedApiInjury,
} from "../types";
import type { ApiSportsResult } from "../client";
import type { SportAdapter } from "./index";

const SPORT = "NFL";

function normalizeTeam(raw: RawFootballTeam): NormalizedApiTeam {
  return {
    apiSportsId: raw.id,
    name: raw.name,
    abbreviation: raw.code || raw.name.split(" ").pop()?.substring(0, 3).toUpperCase() || "UNK",
    city: raw.city,
    sport: SPORT,
    logoUrl: raw.logo,
    provider: "api_sports",
    lastUpdated: Date.now(),
  };
}

function normalizeGameStatus(status: RawFootballGame["game"]["status"]): NormalizedApiGame["status"] {
  const s = status.short?.toUpperCase() || "";
  if (s === "NS" || s === "TBD") return "upcoming";
  if (s === "FT" || s === "AOT" || s === "AP") return "final";
  if (s === "PST") return "postponed";
  if (s === "CANC") return "cancelled";
  return "live";
}

function normalizeGame(raw: RawFootballGame): NormalizedApiGame {
  return {
    apiSportsId: raw.game.id,
    sport: SPORT,
    homeTeam: raw.teams.home.name,
    awayTeam: raw.teams.away.name,
    homeTeamId: raw.teams.home.id,
    awayTeamId: raw.teams.away.id,
    gameTime: raw.game.date.timestamp * 1000,
    status: normalizeGameStatus(raw.game.status),
    homeScore: raw.scores?.home?.total ?? undefined,
    awayScore: raw.scores?.away?.total ?? undefined,
    venue: raw.game.venue?.name,
    period: raw.game.status?.timer || undefined,
    season: raw.league?.season,
    provider: "api_sports",
    lastUpdated: Date.now(),
  };
}

// Raw injury type for NFL
interface RawFootballInjury {
  player: { id: number; name: string };
  team: { id: number; name: string; logo: string };
  type: string;
  status: string;
  date: string;
  description: string;
}

function normalizeInjury(raw: RawFootballInjury): NormalizedApiInjury {
  const statusMap: Record<string, NormalizedApiInjury["status"]> = {
    "out": "out", "doubtful": "doubtful", "questionable": "questionable",
    "probable": "probable", "day-to-day": "day-to-day",
    "injured reserve": "out", "ir": "out", "pup": "out",
  };
  return {
    apiSportsPlayerId: raw.player.id,
    playerName: raw.player.name,
    team: raw.team.name,
    sport: SPORT,
    status: statusMap[raw.status?.toLowerCase()] || "questionable",
    description: raw.description || raw.type,
    reportDate: raw.date ? new Date(raw.date).getTime() : Date.now(),
    provider: "api_sports",
    lastUpdated: Date.now(),
  };
}

export const footballAdapter: SportAdapter = {
  sport: SPORT,

  async getTeams(league?: string) {
    const config = getSportConfig(SPORT);
    const params: Record<string, string | number> = { league: league || config.leagueId };
    if (config.season) params.season = config.season;
    const result = await apiSportsFetch<RawFootballTeam>(config.baseUrl, config.endpoints.teams, params);
    if (!result.ok) return result as any;
    return { ...result, data: result.data.map(normalizeTeam) };
  },

  async getPlayers(_sport: string, _teamId?: string) {
    // NFL player endpoints require team-specific queries; return empty for bulk
    return { ok: true as const, data: [], requestsUsed: 0, requestsRemaining: 0 };
  },

  async getGames(_sport: string, dateRange?: { from: string; to: string }) {
    const config = getSportConfig(SPORT);
    const params: Record<string, string | number> = { league: config.leagueId };
    if (config.season) params.season = config.season;
    if (dateRange?.from) params.date = dateRange.from;
    const result = await apiSportsFetch<RawFootballGame>(config.baseUrl, config.endpoints.games, params);
    if (!result.ok) return result as any;
    return { ...result, data: result.data.map(normalizeGame) };
  },

  async getStandings(_sport: string, league?: string, season?: string) {
    const config = getSportConfig(SPORT);
    if (!config.endpoints.standings) return { ok: true as const, data: [], requestsUsed: 0, requestsRemaining: 0 };
    const params: Record<string, string | number> = {
      league: league || config.leagueId,
      season: season || config.season || "",
    };
    const result = await apiSportsFetch<any>(config.baseUrl, config.endpoints.standings, params);
    if (!result.ok) return result as any;
    // NFL standings have a different shape — normalize generically
    const normalized = result.data.map((raw: any) => ({
      apiSportsTeamId: raw.team?.id ?? 0,
      teamName: raw.team?.name ?? "Unknown",
      sport: SPORT,
      season: parseInt(season || config.season || "0"),
      conference: raw.group?.name,
      wins: raw.won ?? 0,
      losses: raw.lost ?? 0,
      winPct: (raw.won ?? 0) / Math.max(1, (raw.won ?? 0) + (raw.lost ?? 0)),
      rank: raw.position,
      provider: "api_sports" as const,
      lastUpdated: Date.now(),
    }));
    return { ...result, data: normalized };
  },

  async getPlayerStats(_sport: string, playerId: string, season?: string) {
    const config = getSportConfig(SPORT);
    if (!config.endpoints.playerStats) return { ok: true as const, data: [], requestsUsed: 0, requestsRemaining: 0 };
    const params: Record<string, string | number> = {
      id: playerId,
      league: config.leagueId,
      season: season || config.season || "",
    };
    const result = await apiSportsFetch<any>(config.baseUrl, config.endpoints.playerStats, params);
    if (!result.ok) return result as any;
    const normalized = result.data.map((raw: any) => ({
      apiSportsPlayerId: raw.player?.id ?? parseInt(playerId),
      playerName: raw.player?.name ?? "Unknown",
      apiSportsGameId: raw.game?.id ?? 0,
      sport: SPORT,
      stats: raw.statistics || {},
      provider: "api_sports" as const,
      lastUpdated: Date.now(),
    }));
    return { ...result, data: normalized };
  },

  async getTeamStats(_sport: string, _teamId: string, _season?: string) {
    return { ok: true as const, data: [], requestsUsed: 0, requestsRemaining: 0 };
  },

  async getInjuries(_sport: string, teamId?: string) {
    const config = getSportConfig(SPORT);
    if (!config.endpoints.injuries) return { ok: true as const, data: [], requestsUsed: 0, requestsRemaining: 0 };
    const params: Record<string, string | number> = { league: config.leagueId };
    if (config.season) params.season = config.season;
    if (teamId) params.team = teamId;
    const result = await apiSportsFetch<RawFootballInjury>(config.baseUrl, config.endpoints.injuries, params);
    if (!result.ok) return result as any;
    return { ...result, data: result.data.map(normalizeInjury) };
  },

  async getLiveScores() {
    const config = getSportConfig(SPORT);
    const result = await apiSportsFetch<RawFootballGame>(config.baseUrl, config.endpoints.liveScores || config.endpoints.games, {
      league: config.leagueId,
      live: "all",
    });
    if (!result.ok) return result as any;
    return { ...result, data: result.data.map(normalizeGame) };
  },
};
