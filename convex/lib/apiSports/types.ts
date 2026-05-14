/**
 * PropEdge AI — API-SPORTS Type Definitions (R13)
 *
 * Type definitions for API-SPORTS responses and normalized internal types
 */

// ─── Raw API-SPORTS Response Types ───

export interface RawBasketballTeam {
  id: number;
  name: string;
  code: string;
  city: string;
  logo: string;
}

export interface RawBasketballGame {
  id: number;
  date: string;
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  scores: {
    home: number;
    away: number;
  };
  status: {
    long: string;
    short: string;
  };
  league: {
    season: number;
  };
}

export interface RawBaseballTeam extends RawBasketballTeam {}

export interface RawBaseballGame {
  id: number;
  timestamp: number;
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  scores?: {
    home?: { total?: number };
    away?: { total?: number };
  };
  status: {
    short?: string;
  };
  league?: {
    season: number;
  };
}

export interface RawFootballTeam extends RawBasketballTeam {}

export interface RawFootballGame {
  id: number;
  date: string;
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  scores: {
    home: number;
    away: number;
  };
  status: {
    short: string;
    long: string;
  };
  league: {
    season: number;
  };
}

export interface RawHockeyTeam extends RawBasketballTeam {}

export interface RawHockeyGame {
  id: number;
  date: string;
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  scores: {
    home: number;
    away: number;
  };
  status: {
    short: string;
  };
  league: {
    season: number;
  };
}

// ─── Normalized Internal Types ───

export interface NormalizedApiTeam {
  apiSportsId: number;
  name: string;
  abbreviation: string;
  city: string;
  sport: string;
  logoUrl: string;
  provider: "api_sports";
  lastUpdated: number;
}

export interface NormalizedApiPlayer {
  apiSportsId: number;
  name: string;
  position: string;
  number: number;
  sport: string;
  provider: "api_sports";
  lastUpdated: number;
}

export interface NormalizedApiGame {
  apiSportsId: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  gameTime: number;
  status: "upcoming" | "live" | "final" | "postponed" | "cancelled";
  homeScore?: number;
  awayScore?: number;
  season?: number;
  provider: "api_sports";
  lastUpdated: number;
}

export interface NormalizedApiStanding {
  apiSportsTeamId: number;
  teamName: string;
  sport: string;
  season: number;
  conference?: string;
  wins: number;
  losses: number;
  winPct: number;
  rank?: number;
  provider: "api_sports";
  lastUpdated: number;
}

export interface NormalizedApiPlayerStats {
  apiSportsPlayerId: number;
  playerName: string;
  sport: string;
  season: number;
  gamesPlayed: number;
  stats: Record<string, number>;
  provider: "api_sports";
  lastUpdated: number;
}

export interface NormalizedApiInjury {
  playerName: string;
  teamName: string;
  sport: string;
  status: string;
  provider: "api_sports";
  lastUpdated: number;
}

export interface ApiSportsHealth {
  configured: boolean;
  enabled: boolean;
  requestsUsedToday: number;
  dailyLimit: number;
  supportedSports: string[];
  supportedEndpoints: string[];
  sourceLabel: string;
  dataType: string;
  officialStatsProvider: boolean;
}
