/**
 * PropEdge AI — API-SPORTS Sport Configuration (R13)
 *
 * Configuration for each supported sport including endpoints and league IDs
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

const SPORT_CONFIGS: Record<string, SportConfig> = {
  NBA: {
    baseUrl: "https://api-sports.io/v1",
    leagueId: 12, // NBA league ID
    season: String(new Date().getFullYear()),
    endpoints: {
      teams: "/basketball/teams",
      games: "/basketball/games",
      standings: "/basketball/standings",
      liveScores: "/basketball/games",
      injuries: "/basketball/injuries",
    },
  },
  NFL: {
    baseUrl: "https://api-sports.io/v1",
    leagueId: 1, // NFL league ID
    season: String(new Date().getFullYear()),
    endpoints: {
      teams: "/american-football/teams",
      games: "/american-football/games",
      standings: "/american-football/standings",
      liveScores: "/american-football/games",
      injuries: "/american-football/injuries",
    },
  },
  MLB: {
    baseUrl: "https://v1.baseball.api-sports.io",
    leagueId: 1, // MLB league ID
    season: String(new Date().getFullYear()),
    endpoints: {
      teams: "/teams",
      games: "/games",
      standings: "/standings",
    },
  },
  NHL: {
    baseUrl: "https://api-sports.io/v1",
    leagueId: 3, // NHL league ID
    season: String(new Date().getFullYear()),
    endpoints: {
      teams: "/hockey/teams",
      games: "/hockey/games",
      standings: "/hockey/standings",
      liveScores: "/hockey/games",
      injuries: "/hockey/injuries",
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
