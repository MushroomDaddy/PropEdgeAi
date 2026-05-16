     1|/**
     2| * PropEdge AI — API-SPORTS Baseball Adapter (R13)
     3| *
     4| * Handles MLB data from v1.baseball.api-sports.io
     5| */
     6|
     7|import { apiSportsFetch } from "../client";

     8|import { getSportConfig } from "../config";

     9|import type {
    10|  NormalizedApiGame,
    11|  NormalizedApiTeam,
    12|  RawBaseballGame,
    13|  RawBaseballTeam,
    14|} from "../types";
    15|import type { SportAdapter } from "./index";

    16|
    17|const SPORT = "MLB";
    18|
    19|function normalizeTeam(raw: RawBaseballTeam): NormalizedApiTeam {
    20|  return {
    21|    apiSportsId: raw.id,
    22|    name: raw.name,
    23|    abbreviation:
    24|      raw.code ||
    25|      raw.name.split(" ").pop()?.substring(0, 3).toUpperCase() ||
    26|      "UNK",
    27|    city: raw.city,
    28|    sport: SPORT,
    29|    logoUrl: raw.logo,
    30|    provider: "api_sports",
    31|    lastUpdated: Date.now(),
    32|  };
    33|}
    34|
    35|function normalizeGameStatus(
    36|  status: RawBaseballGame["status"],
    37|): NormalizedApiGame["status"] {
    38|  const s = status.short?.toUpperCase() || "";
    39|  if (s === "NS" || s === "TBD") return "upcoming";
    40|  if (s === "FT" || s === "AOT" || s === "AP") return "final";
    41|  if (s === "PST") return "postponed";
    42|  if (s === "CANC") return "cancelled";
    43|  return "live";
    44|}
    45|
    46|function normalizeGame(raw: RawBaseballGame): NormalizedApiGame {
    47|  return {
    48|    apiSportsId: raw.id,
    49|    sport: SPORT,
    50|    homeTeam: raw.teams.home.name,
    51|    awayTeam: raw.teams.away.name,
    52|    homeTeamId: raw.teams.home.id,
    53|    awayTeamId: raw.teams.away.id,
    54|    gameTime: raw.timestamp * 1000,
    55|    status: normalizeGameStatus(raw.status),
    56|    homeScore: raw.scores?.home?.total ?? undefined,
    57|    awayScore: raw.scores?.away?.total ?? undefined,
    58|    season: raw.league?.season,
    59|    provider: "api_sports",
    60|    lastUpdated: Date.now(),
    61|  };
    62|}
    63|
    64|export const baseballAdapter: SportAdapter = {
    65|  sport: SPORT,
    66|
    67|  async getTeams(league?: string) {
    68|    const config = getSportConfig(SPORT);
    69|    const params: Record<string, string | number> = {
    70|      league: league || config.leagueId,
    71|    };
    72|    if (config.season) params.season = config.season;
    73|    const result = await apiSportsFetch<RawBaseballTeam>(
    74|      config.baseUrl,
    75|      config.endpoints.teams,
    76|      params,
    77|    );
    78|    if (!result.ok) return result as any;
    79|    return { ...result, data: result.data.map(normalizeTeam) };
    80|  },
    81|
    82|  async getPlayers(_sport: string, _teamId?: string) {
    83|    return {
    84|      ok: true as const,
    85|      data: [],
    86|      requestsUsed: 0,
    87|      requestsRemaining: 0,
    88|    };
    89|  },
    90|
    91|  async getGames(_sport: string, dateRange?: { from: string; to: string }) {
    92|    const config = getSportConfig(SPORT);
    93|    const params: Record<string, string | number> = { league: config.leagueId };
    94|    if (config.season) params.season = config.season;
    95|    if (dateRange?.from) params.date = dateRange.from;
    96|    const result = await apiSportsFetch<RawBaseballGame>(
    97|      config.baseUrl,
    98|      config.endpoints.games,
    99|      params,
   100|    );
   101|    if (!result.ok) return result as any;
   102|    return { ...result, data: result.data.map(normalizeGame) };
   103|  },
   104|
   105|  async getStandings(_sport: string, league?: string, season?: string) {
   106|    const config = getSportConfig(SPORT);
   107|    if (!config.endpoints.standings)
   108|      return {
   109|        ok: true as const,
   110|        data: [],
   111|        requestsUsed: 0,
   112|        requestsRemaining: 0,
   113|      };
   114|    const params: Record<string, string | number> = {
   115|      league: league || config.leagueId,
   116|      season: season || config.season || "",
   117|    };
   118|    const result = await apiSportsFetch<any>(
   119|      config.baseUrl,
   120|      config.endpoints.standings,
   121|      params,
   122|    );
   123|    if (!result.ok) return result as any;
   124|    const normalized = result.data.map((raw: any) => ({
   125|      apiSportsTeamId: raw.team?.id ?? 0,
   126|      teamName: raw.team?.name ?? "Unknown",
   127|      sport: SPORT,
   128|      season: parseInt(season || config.season || "0", 10),
   129|      conference: raw.group?.name,
   130|      wins: raw.won ?? 0,
   131|      losses: raw.lost ?? 0,
   132|      winPct: (raw.won ?? 0) / Math.max(1, (raw.won ?? 0) + (raw.lost ?? 0)),
   133|      rank: raw.position,
   134|      provider: "api_sports" as const,
   135|      lastUpdated: Date.now(),
   136|    }));
   137|    return { ...result, data: normalized };
   138|  },
   139|
   140|  async getPlayerStats(_sport: string, _playerId: string, _season?: string) {
   141|    return {
   142|      ok: true as const,
   143|      data: [],
   144|      requestsUsed: 0,
   145|      requestsRemaining: 0,
   146|    };
   147|  },
   148|
   149|  async getTeamStats(_sport: string, _teamId: string, _season?: string) {
   150|    return {
   151|      ok: true as const,
   152|      data: [],
   153|      requestsUsed: 0,
   154|      requestsRemaining: 0,
   155|    };
   156|  },
   157|
   158|  async getInjuries(_sport: string, _teamId?: string) {
   159|    return {
   160|      ok: true as const,
   161|      data: [],
   162|      requestsUsed: 0,
   163|      requestsRemaining: 0,
   164|    };
   165|  },
   166|
   167|  async getLiveScores() {
   168|    const config = getSportConfig(SPORT);
   169|    const result = await apiSportsFetch<RawBaseballGame>(
   170|      config.baseUrl,
   171|      config.endpoints.liveScores || config.endpoints.games,
   172|      {
   173|        league: config.leagueId,
   174|        live: "all",
   175|      },
   176|    );
   177|    if (!result.ok) return result as any;
   178|    return { ...result, data: result.data.map(normalizeGame) };
   179|  },
   180|};
   181|