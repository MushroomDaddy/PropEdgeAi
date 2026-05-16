/**
 * PropEdge AI — API-SPORTS Adapter Registry (R13)
 *
 * Clean adapter layer: each sport has its own adapter that normalizes
 * API-SPORTS responses into PropEdge internal types.
 * Add new sports by creating an adapter and registering here.
 */

import type { ApiSportsResult } from "../client";
import type {
	NormalizedApiGame,
	NormalizedApiInjury,
	NormalizedApiPlayer,
	NormalizedApiPlayerStats,
	NormalizedApiStanding,
	NormalizedApiTeam,
} from "../types";
import { baseballAdapter } from "./baseball";
import { basketballAdapter } from "./basketball";
import { footballAdapter } from "./football";
import { hockeyAdapter } from "./hockey";

// ── Adapter Interface ──

export interface SportAdapter {
	sport: string;
	getTeams(league?: string): Promise<ApiSportsResult<NormalizedApiTeam>>;
	getPlayers(
		sport: string,
		teamId?: string,
	): Promise<ApiSportsResult<NormalizedApiPlayer>>;
	getGames(
		sport: string,
		dateRange?: { from: string; to: string },
	): Promise<ApiSportsResult<NormalizedApiGame>>;
	getStandings(
		sport: string,
		league?: string,
		season?: string,
	): Promise<ApiSportsResult<NormalizedApiStanding>>;
	getPlayerStats(
		sport: string,
		playerId: string,
		season?: string,
	): Promise<ApiSportsResult<NormalizedApiPlayerStats>>;
	getTeamStats(
		sport: string,
		teamId: string,
		season?: string,
	): Promise<ApiSportsResult<any>>;
	getInjuries(
		sport: string,
		teamId?: string,
	): Promise<ApiSportsResult<NormalizedApiInjury>>;
	getLiveScores(): Promise<ApiSportsResult<NormalizedApiGame>>;
}

// ── Adapter Registry ──

const ADAPTERS: Record<string, SportAdapter> = {
	NBA: basketballAdapter,
	NFL: footballAdapter,
	MLB: baseballAdapter,
	NHL: hockeyAdapter,
};

/** Get adapter for a sport, or null if not supported */
export function getAdapter(sport: string): SportAdapter | null {
	return ADAPTERS[sport.toUpperCase()] || null;
}

/** Get all registered adapters */
export function getAllAdapters(): SportAdapter[] {
	return Object.values(ADAPTERS);
}

/** Get list of supported sport names */
export function getSupportedSports(): string[] {
	return Object.keys(ADAPTERS);
}

export { basketballAdapter, footballAdapter, baseballAdapter, hockeyAdapter };
