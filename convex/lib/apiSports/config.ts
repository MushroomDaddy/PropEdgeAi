/**
 * PropEdge AI — API-SPORTS Sport Configuration (R15.7)
 *
 * API-SPORTS v1 base URL pattern: https://v1.{sport}.api-sports.io
 * - Basketball (NBA): https://v1.basketball.api-sports.io
 * - American Football (NFL): https://v1.american-football.api-sports.io
 * - Baseball (MLB): https://v1.baseball.api-sports.io
 * - Hockey (NHL): https://v1.hockey.api-sports.io
 *
 * Endpoints are relative to the base URL (no sport prefix needed).
 */

export interface SportConfig {
	baseUrl: string;
	leagueId: number;
	season: string;
	endpoints: {
		teams: string;
		games: string;
		standings: string;
		liveScores?: string;
		injuries?: string;
		playerStats?: string;
	};
}


/** Compute current season string for a sport.
 *  NBA/NHL use cross-year format: if month >= October, season = "YYYY-YYYY+1", else "YYYY-1-YYYY"
 *  NFL/MLB use single calendar year.
 */
function currentSeason(sport: "NBA" | "NHL" | "NFL" | "MLB"): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth(); // 0-indexed (0=Jan, 9=Oct)
	if (sport === "NBA" || sport === "NHL") {
		return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
	}
	return String(year);
}
const SPORT_CONFIGS: Record<string, SportConfig> = {
	NBA: {
		baseUrl: "https://v1.basketball.api-sports.io",
		leagueId: 12, // NBA league ID
		season: currentSeason("NBA"),
		endpoints: {
			teams: "/teams",
			games: "/games",
			standings: "/standings",
			liveScores: "/games",
			injuries: "/injuries",
			playerStats: "/players/statistics",
		},
	},
	NFL: {
		baseUrl: "https://v1.american-football.api-sports.io",
		leagueId: 1, // NFL league ID
		season: currentSeason("NFL"),
		endpoints: {
			teams: "/teams",
			games: "/games",
			standings: "/standings",
			liveScores: "/games",
			injuries: "/injuries",
		},
	},
	MLB: {
		baseUrl: "https://v1.baseball.api-sports.io",
		leagueId: 1, // MLB league ID
		season: currentSeason("MLB"),
		endpoints: {
			teams: "/teams",
			games: "/games",
			standings: "/standings",
		},
	},
	NHL: {
		baseUrl: "https://v1.hockey.api-sports.io",
		leagueId: 3, // NHL league ID
		season: currentSeason("NHL"),
		endpoints: {
			teams: "/teams",
			games: "/games",
			standings: "/standings",
			liveScores: "/games",
			injuries: "/injuries",
		},
	},
};

export const SUPPORTED_SPORTS = Object.keys(SPORT_CONFIGS);

export const ALL_ENDPOINTS = [
	"teams",
	"games",
	"standings",
	"liveScores",
	"injuries",
	"players",
	"playerStats",
	"teamStats",
	"searchPlayer",
	"searchTeam",
];

export const API_SPORTS_DAILY_LIMIT = 1000; // API-SPORTS free tier limit

export function getSportConfig(sport: string): SportConfig {
	const config = SPORT_CONFIGS[sport.toUpperCase()];
	if (!config) {
		throw new Error(`Unsupported sport: ${sport}`);
	}
	return config;
}

export function getAllSportConfigs(): Record<string, SportConfig> {
	return SPORT_CONFIGS;
}
