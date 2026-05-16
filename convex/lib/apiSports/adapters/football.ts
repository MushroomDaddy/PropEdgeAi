     1|     1|/**
     2|     2| * PropEdge AI — API-SPORTS American Football Adapter (R13)
     3|     3| *
     4|     4| * Handles NFL data from v1.american-football.api-sports.io
     5|     5| */
     6|     6|
     7|     7|import { apiSportsFetch } from "../client";
     8|     8|import { getSportConfig } from "../config";
     9|     9|import type {
    10|    10|  NormalizedApiGame,
    11|    11|  NormalizedApiInjury,
    12|    12|  NormalizedApiTeam,
    13|    13|  RawFootballGame,
    14|    14|  RawFootballTeam,
    15|    15|} from "../types";
    16|    16|import type { SportAdapter } from "./index";
    17|    17|
    18|    18|const SPORT = "NFL";
    19|    19|
    20|    20|function normalizeTeam(raw: RawFootballTeam): NormalizedApiTeam {
    21|    21|  return {
    22|    22|    apiSportsId: raw.id,
    23|    23|    name: raw.name,
    24|    24|    abbreviation:
    25|    25|      raw.code ||
    26|    26|      raw.name.split(" ").pop()?.substring(0, 3).toUpperCase() ||
    27|    27|      "UNK",
    28|    28|    city: raw.city,
    29|    29|    sport: SPORT,
    30|    30|    logoUrl: raw.logo,
    31|    31|    provider: "api_sports",
    32|    32|    lastUpdated: Date.now(),
    33|    33|  };
    34|    34|}
    35|    35|
    36|    36|function normalizeGameStatus(
    37|    37|  status: RawFootballGame["game"]["status"],
    38|    38|): NormalizedApiGame["status"] {
    39|    39|  const s = status.short?.toUpperCase() || "";
    40|    40|  if (s === "NS" || s === "TBD") return "upcoming";
    41|    41|  if (s === "FT" || s === "AOT" || s === "AP") return "final";
    42|    42|  if (s === "PST") return "postponed";
    43|    43|  if (s === "CANC") return "cancelled";
    44|    44|  return "live";
    45|    45|}
    46|    46|
    47|    47|function normalizeGame(raw: RawFootballGame): NormalizedApiGame {
    48|    48|  return {
    49|    49|    apiSportsId: raw.game.id,
    50|    50|    sport: SPORT,
    51|    51|    homeTeam: raw.teams.home.name,
    52|    52|    awayTeam: raw.teams.away.name,
    53|    53|    homeTeamId: raw.teams.home.id,
    54|    54|    awayTeamId: raw.teams.away.id,
    55|    55|    gameTime: raw.game.date.timestamp * 1000,
    56|    56|    status: normalizeGameStatus(raw.game.status),
    57|    57|    homeScore: raw.scores?.home?.total ?? undefined,
    58|    58|    awayScore: raw.scores?.away?.total ?? undefined,
    59|    59|    venue: raw.game.venue?.name,
    60|    60|    period: raw.game.status?.timer || undefined,
    61|    61|    season: raw.league?.season,
    62|    62|    provider: "api_sports",
    63|    63|    lastUpdated: Date.now(),
    64|    64|  };
    65|    65|}
    66|    66|
    67|    67|// Raw injury type for NFL
    68|    68|interface RawFootballInjury {
    69|    69|  player: { id: number; name: string };
    70|    70|  team: { id: number; name: string; logo: string };
    71|    71|  type: string;
    72|    72|  status: string;
    73|    73|  date: string;
    74|    74|  description: string;
    75|    75|}
    76|    76|
    77|    77|function normalizeInjury(raw: RawFootballInjury): NormalizedApiInjury {
    78|    78|  const statusMap: Record<string, NormalizedApiInjury["status"]> = {
    79|    79|    out: "out",
    80|    80|    doubtful: "doubtful",
    81|    81|    questionable: "questionable",
    82|    82|    probable: "probable",
    83|    83|    "day-to-day": "day-to-day",
    84|    84|    "injured reserve": "out",
    85|    85|    ir: "out",
    86|    86|    pup: "out",
    87|    87|  };
    88|    88|  return {
    89|    89|    apiSportsPlayerId: raw.player.id,
    90|    90|    playerName: raw.player.name,
    91|    91|    team: raw.team.name,
    92|    92|    sport: SPORT,
    93|    93|    status: statusMap[raw.status?.toLowerCase()] || "questionable",
    94|    94|    description: raw.description || raw.type,
    95|    95|    reportDate: raw.date ? new Date(raw.date).getTime() : Date.now(),
    96|    96|    provider: "api_sports",
    97|    97|    lastUpdated: Date.now(),
    98|    98|  };
    99|    99|}
   100|   100|
   101|   101|export const footballAdapter: SportAdapter = {
   102|   102|  sport: SPORT,
   103|   103|
   104|   104|  async getTeams(league?: string) {
   105|   105|    const config = getSportConfig(SPORT);
   106|   106|    const params: Record<string, string | number> = {
   107|   107|      league: league || config.leagueId,
   108|   108|    };
   109|   109|    if (config.season) params.season = config.season;
   110|   110|    const result = await apiSportsFetch<RawFootballTeam>(
   111|   111|      config.baseUrl,
   112|   112|      config.endpoints.teams,
   113|   113|      params,
   114|   114|    );
   115|   115|    if (!result.ok) return result as any;
   116|   116|    return { ...result, data: result.data.map(normalizeTeam) };
   117|   117|  },
   118|   118|
   119|   119|  async getPlayers(_sport: string, _teamId?: string) {
   120|   120|    // NFL player endpoints require team-specific queries; return empty for bulk
   121|   121|    return {
   122|   122|      ok: false,
   123|   123|      data: [],
   124|   124|      requestsUsed: 0,
   125|   125|      requestsRemaining: 0,
   126|   126|    };
   127|   127|  },
   128|   128|
   129|   129|  async getGames(_sport: string, dateRange?: { from: string; to: string }) {
   130|   130|    const config = getSportConfig(SPORT);
   131|   131|    const params: Record<string, string | number> = { league: config.leagueId };
   132|   132|    if (config.season) params.season = config.season;
   133|   133|    if (dateRange?.from) params.date = dateRange.from;
   134|   134|    const result = await apiSportsFetch<RawFootballGame>(
   135|   135|      config.baseUrl,
   136|   136|      config.endpoints.games,
   137|   137|      params,
   138|   138|    );
   139|   139|    if (!result.ok) return result as any;
   140|   140|    return { ...result, data: result.data.map(normalizeGame) };
   141|   141|  },
   142|   142|
   143|   143|  async getStandings(_sport: string, league?: string, season?: string) {
   144|   144|    const config = getSportConfig(SPORT);
   145|   145|    if (!config.endpoints.standings)
   146|   146|      return {
   147|   147|        ok: false,
   148|   148|        data: [],
   149|   149|        requestsUsed: 0,
   150|   150|        requestsRemaining: 0,
   151|   151|      };
   152|   152|    const params: Record<string, string | number> = {
   153|   153|      league: league || config.leagueId,
   154|   154|      season: season || config.season || "",
   155|   155|    };
   156|   156|    const result = await apiSportsFetch<any>(
   157|   157|      config.baseUrl,
   158|   158|      config.endpoints.standings,
   159|   159|      params,
   160|   160|    );
   161|   161|    if (!result.ok) return result as any;
   162|   162|    // NFL standings have a different shape — normalize generically
   163|   163|    const normalized = result.data.map((raw: any) => ({
   164|   164|      apiSportsTeamId: raw.team?.id ?? 0,
   165|   165|      teamName: raw.team?.name ?? "Unknown",
   166|   166|      sport: SPORT,
   167|   167|      season: parseInt(season || config.season || "0", 10),
   168|   168|      conference: raw.group?.name,
   169|   169|      wins: raw.won ?? 0,
   170|   170|      losses: raw.lost ?? 0,
   171|   171|      winPct: (raw.won ?? 0) / Math.max(1, (raw.won ?? 0) + (raw.lost ?? 0)),
   172|   172|      rank: raw.position,
   173|   173|      provider: "api_sports" as const,
   174|   174|      lastUpdated: Date.now(),
   175|   175|    }));
   176|   176|    return { ...result, data: normalized };
   177|   177|  },
   178|   178|
   179|   179|  async getPlayerStats(_sport: string, playerId: string, season?: string) {
   180|   180|    const config = getSportConfig(SPORT);
   181|   181|    if (!config.endpoints.playerStats)
   182|   182|      return {
   183|   183|        ok: false,
   184|   184|        data: [],
   185|   185|        requestsUsed: 0,
   186|   186|        requestsRemaining: 0,
   187|   187|      };
   188|   188|    const params: Record<string, string | number> = {
   189|   189|      id: playerId,
   190|   190|      league: config.leagueId,
   191|   191|      season: season || config.season || "",
   192|   192|    };
   193|   193|    const result = await apiSportsFetch<any>(
   194|   194|      config.baseUrl,
   195|   195|      config.endpoints.playerStats,
   196|   196|      params,
   197|   197|    );
   198|   198|    if (!result.ok) return result as any;
   199|   199|    const normalized = result.data.map((raw: any) => ({
   200|   200|      apiSportsPlayerId: raw.player?.id ?? parseInt(playerId, 10),
   201|   201|      playerName: raw.player?.name ?? "Unknown",
   202|   202|      apiSportsGameId: raw.game?.id ?? 0,
   203|   203|      sport: SPORT,
   204|   204|      stats: raw.statistics || {},
   205|   205|      provider: "api_sports" as const,
   206|   206|      lastUpdated: Date.now(),
   207|   207|    }));
   208|   208|    return { ...result, data: normalized };
   209|   209|  },
   210|   210|
   211|   211|  async getTeamStats(_sport: string, _teamId: string, _season?: string) {
   212|   212|    return {
   213|   213|      ok: false,
   214|   214|      data: [],
   215|   215|      requestsUsed: 0,
   216|   216|      requestsRemaining: 0,
   217|   217|    };
   218|   218|  },
   219|   219|
   220|   220|  async getInjuries(_sport: string, teamId?: string) {
   221|   221|    const config = getSportConfig(SPORT);
   222|   222|    if (!config.endpoints.injuries)
   223|   223|      return {
   224|   224|        ok: false,
   225|   225|        data: [],
   226|   226|        requestsUsed: 0,
   227|   227|        requestsRemaining: 0,
   228|   228|      };
   229|   229|    const params: Record<string, string | number> = { league: config.leagueId };
   230|   230|    if (config.season) params.season = config.season;
   231|   231|    if (teamId) params.team = teamId;
   232|   232|    const result = await apiSportsFetch<RawFootballInjury>(
   233|   233|      config.baseUrl,
   234|   234|      config.endpoints.injuries,
   235|   235|      params,
   236|   236|    );
   237|   237|    if (!result.ok) return result as any;
   238|   238|    return { ...result, data: result.data.map(normalizeInjury) };
   239|   239|  },
   240|   240|
   241|   241|  async getLiveScores() {
   242|   242|    const config = getSportConfig(SPORT);
   243|   243|    const result = await apiSportsFetch<RawFootballGame>(
   244|   244|      config.baseUrl,
   245|   245|      config.endpoints.liveScores || config.endpoints.games,
   246|   246|      {
   247|   247|        league: config.leagueId,
   248|   248|        live: "all",
   249|   249|      },
   250|   250|    );
   251|   251|    if (!result.ok) return result as any;
   252|   252|    return { ...result, data: result.data.map(normalizeGame) };
   253|   253|  },
   254|   254|};
   255|   255|