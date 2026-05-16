/**
 * PropEdge AI — API-SPORTS Hockey Adapter (R13)
 *
 * Handles NHL data from v1.hockey.api-sports.io
 */

import { apiSportsFetch } from "../client";
import { getSportConfig } from "../config";
import type {
	NormalizedApiGame,
	NormalizedApiTeam,
	RawHockeyGame,
	RawHockeyTeam,
} from "../types";
import type { SportAdapter } from "./index";

const SPORT = "NHL";

function normalizeTeam(raw: RawHockeyTeam): NormalizedApiTeam {
	return {
		apiSportsId: raw.id,
		name: raw.name,
		abbreviation:
			raw.code ||
			raw.name.split(" ").pop()?.substring(0, 3).toUpperCase() ||
			"UNK",
		sport: SPORT,
		logoUrl: raw.logo,
		provider: "api_sports",
		lastUpdated: Date.now(),
	};
}

function normalizeGameStatus(
	status: RawHockeyGame["status"],
): NormalizedApiGame["status"] {
	const s = status.short?.toUpperCase() || "";
	if (s === "NS" || s === "TBD") return "upcoming";
	if (s === "FT" || s === "AOT" || s === "AP") return "final";
	if (s === "PST") return "postponed";
	if (s === "CANC") return "cancelled";
	return "live";
}

function normalizeGame(raw: RawHockeyGame): NormalizedApiGame {
	return {
		apiSportsId: raw.id,
		sport: SPORT,
		homeTeam: raw.teams.home.name,
		awayTeam: raw.teams.away.name,
		homeTeamId: raw.teams.home.id,
		awayTeamId: raw.teams.away.id,
		gameTime: raw.timestamp * 1000,
		status: normalizeGameStatus(raw.status),
		homeScore: raw.scores?.home ?? undefined,
		awayScore: raw.scores?.away ?? undefined,
		season: raw.league?.season,
		provider: "api_sports",
		lastUpdated: Date.now(),
	};
}

export const hockeyAdapter: SportAdapter = {
	sport: SPORT,

	async getTeams(league?: string) {
		const config = getSportConfig(SPORT);
		const params: Record<string, string | number> = {
			league: league || config.leagueId,
		};
		if (config.season) params.season = config.season;
		const result = await apiSportsFetch<RawHockeyTeam>(
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
			error: {
				code: "not_implemented",
				message: "getPlayers not implemented for hockey",
			},
		};
	},

	async getGames(_sport: string, dateRange?: { from: string; to: string }) {
		const config = getSportConfig(SPORT);
		const params: Record<string, string | number> = { league: config.leagueId };
		if (config.season) params.season = config.season;
		if (dateRange?.from) params.date = dateRange.from;
		const result = await apiSportsFetch<RawHockeyGame>(
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
				error: {
					code: "not_implemented",
					message: "getStandings endpoint not configured for hockey",
				},
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
			season: parseInt(season || config.season || "0", 10),
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

	async getPlayerStats(_sport: string, _playerId: string, _season?: string) {
		return {
			ok: false,
			data: [],
			requestsUsed: 0,
			requestsRemaining: 0,
			error: {
				code: "not_implemented",
				message: "getPlayerStats not implemented for hockey",
			},
		};
	},

	async getTeamStats(_sport: string, _teamId: string, _season?: string) {
		return {
			ok: false,
			data: [],
			requestsUsed: 0,
			requestsRemaining: 0,
			error: {
				code: "not_implemented",
				message: "getTeamStats not implemented for hockey",
			},
		};
	},

	async getInjuries(_sport: string, _teamId?: string) {
		return {
			ok: false,
			data: [],
			requestsUsed: 0,
			requestsRemaining: 0,
			error: {
				code: "not_implemented",
				message: "getInjuries not implemented for hockey",
			},
		};
	},

	async getLiveScores() {
		const config = getSportConfig(SPORT);
		const result = await apiSportsFetch<RawHockeyGame>(
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
