import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  real,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Sports ───────────────────────────────────────────────────────────────────
export const sports = pgTable(
  "sports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    icon: text("icon").notNull(),
    active: boolean("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("sports_slug_idx").on(t.slug)],
);

// ─── Players ──────────────────────────────────────────────────────────────────
export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    team: text("team").notNull(),
    position: text("position").notNull(),
    sport: text("sport").notNull(),
    imageUrl: text("image_url"),
    teamLogoUrl: text("team_logo_url"),
    jerseyNumber: integer("jersey_number"),
    teamColor: text("team_color"),
    headshotUrl: text("headshot_url"),
    teamColors: jsonb("team_colors"), // { primary, secondary, accent? }
    league: text("league"),
    externalIds: jsonb("external_ids"), // { sportsDataIoId?, sportradarId?, espnId?, ... }
    injuryStatus: text("injury_status"),
    recentForm: text("recent_form"),
    seasonAvg: jsonb("season_avg"), // { points?, rebounds?, assists?, threePointers? }
    last5Avg: jsonb("last_5_avg"),  // same shape
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("players_sport_idx").on(t.sport),
    index("players_name_idx").on(t.name),
    index("players_team_idx").on(t.team),
  ],
);

// ─── Games ────────────────────────────────────────────────────────────────────
export const games = pgTable(
  "games",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sport: text("sport").notNull(),
    homeTeam: text("home_team").notNull(),
    awayTeam: text("away_team").notNull(),
    gameTime: real("game_time").notNull(), // ms epoch stored as real
    status: text("status").notNull(),
    homeScore: real("home_score"),
    awayScore: real("away_score"),
    venue: text("venue"),
    quarter: text("quarter"),
    gameClock: text("game_clock"),
    broadcast: text("broadcast"),
    playByPlay: jsonb("play_by_play"),   // array of play objects
    boxScore: jsonb("box_score"),        // { home: Player[], away: Player[] }
    roster: jsonb("roster"),             // { home: { active, out }, away: { active, out } }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("games_sport_idx").on(t.sport),
    index("games_status_idx").on(t.status),
    index("games_sport_status_idx").on(t.sport, t.status),
  ],
);

// ─── Props ────────────────────────────────────────────────────────────────────
export const props = pgTable(
  "props",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id").references(() => players.id),
    gameId: uuid("game_id").references(() => games.id),
    sport: text("sport").notNull(),
    playerName: text("player_name").notNull(),
    team: text("team").notNull(),
    statType: text("stat_type").notNull(),
    line: real("line").notNull(),
    projection: real("projection").notNull(),
    projectionSources: jsonb("projection_sources").notNull(), // [{ source, value }]
    platform: text("platform").notNull(),
    edge: real("edge").notNull(),
    modelProb: real("model_prob"),
    marketImpliedProb: real("market_implied_prob"),
    projectionDiff: real("projection_diff"),
    confidence: real("confidence").notNull(),
    hitRate: real("hit_rate").notNull(),
    overUnder: text("over_under").notNull(),
    propType: text("prop_type"),
    dataSource: text("data_source"),
    lastUpdated: real("last_updated"),
    provider: text("provider"),
    variance: real("variance").notNull(),
    matchupRating: real("matchup_rating").notNull(),
    last10Trend: text("last_10_trend"),
    last10Hits: real("last_10_hits"),
    dvpRank: real("dvp_rank"),
    correlatedWith: text("correlated_with").array(),
    impliedProb: real("implied_prob"),
    isKalshiMarket: boolean("is_kalshi_market"),
    kalshiPayout: jsonb("kalshi_payout"),              // { yesPayout, noPayout }
    bustRisk: real("bust_risk"),
    projectionConsensus: jsonb("projection_consensus"), // { avg, numSources, numOverLine, spread }
    hotColdStreak: jsonb("hot_cold_streak"),            // { type, games, label }
    monteCarloSim: jsonb("monte_carlo_sim"),            // { simulations, hitRate, p10, p50, p90, stdDev }
    historicalHitRate: jsonb("historical_hit_rate"),    // { similarLines, sampleSize, vsTeam? }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("props_sport_idx").on(t.sport),
    index("props_platform_idx").on(t.platform),
    index("props_edge_idx").on(t.edge),
    index("props_player_id_idx").on(t.playerId),
    index("props_game_id_idx").on(t.gameId),
    index("props_sport_platform_idx").on(t.sport, t.platform),
  ],
);

// ─── Picks ────────────────────────────────────────────────────────────────────
export const picks = pgTable(
  "picks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(), // FK to auth.users (Supabase)
    propId: uuid("prop_id").references(() => props.id),
    playerName: text("player_name").notNull(),
    statType: text("stat_type").notNull(),
    line: real("line").notNull(),
    projection: real("projection").notNull(),
    edge: real("edge").notNull(),
    overUnder: text("over_under").notNull(),
    platform: text("platform").notNull(),
    sport: text("sport").notNull(),
    team: text("team"),
    gameId: uuid("game_id").references(() => games.id),
    status: text("status").notNull(),
    result: real("result"),
    addedAt: real("added_at").notNull(),
    sourceType: text("source_type"),
    importJobId: uuid("import_job_id"),
    matchStatus: text("match_status"),
    matchedPropId: uuid("matched_prop_id").references(() => props.id),
    matchConfidence: real("match_confidence"),
    originalImportedLine: real("original_imported_line"),
    originalImportedPlatform: text("original_imported_platform"),
    originalImportedPlayer: text("original_imported_player"),
    originalImportedStatType: text("original_imported_stat_type"),
    originalImportedDirection: text("original_imported_direction"),
    originalImportedSport: text("original_imported_sport"),
    originalImportedOdds: real("original_imported_odds"),
    originalImportedStake: real("original_imported_stake"),
    reviewStatus: text("review_status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("picks_user_id_idx").on(t.userId),
    index("picks_user_id_status_idx").on(t.userId, t.status),
  ],
);

// ─── Entries ──────────────────────────────────────────────────────────────────
export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    platform: text("platform").notNull(),
    entryType: text("entry_type").notNull(),
    status: text("status").notNull(),
    payout: real("payout"),
    stake: real("stake"),
    createdAt: real("created_at").notNull(),
  },
  (t) => [
    index("entries_user_id_idx").on(t.userId),
    index("entries_user_id_status_idx").on(t.userId, t.status),
  ],
);

// ─── Entries ↔ Picks join table (replaces Convex pickIds array) ───────────────
export const entriesPicks = pgTable(
  "entries_picks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entryId: uuid("entry_id").notNull().references(() => entries.id, { onDelete: "cascade" }),
    pickId: uuid("pick_id").notNull().references(() => picks.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("entries_picks_entry_id_idx").on(t.entryId),
    index("entries_picks_pick_id_idx").on(t.pickId),
  ],
);

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    timestamp: real("timestamp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("chat_messages_user_id_idx").on(t.userId)],
);

// ─── User Settings ────────────────────────────────────────────────────────────
export const userSettings = pgTable(
  "user_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    favoriteSports: text("favorite_sports").array().notNull().default([]),
    favoritePlatforms: text("favorite_platforms").array().notNull().default([]),
    riskTolerance: text("risk_tolerance").notNull(),
    darkMode: boolean("dark_mode").notNull().default(true),
    notifications: boolean("notifications").notNull().default(true),
    defaultBankroll: real("default_bankroll"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_settings_user_id_idx").on(t.userId)],
);

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const leaderboard = pgTable(
  "leaderboard",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    username: text("username").notNull(),
    avatar: text("avatar").notNull(),
    winRate: real("win_rate").notNull(),
    totalPicks: integer("total_picks").notNull(),
    profit: real("profit").notNull(),
    streak: integer("streak").notNull(),
    rank: integer("rank").notNull(),
    tier: text("tier").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("leaderboard_rank_idx").on(t.rank)],
);

// ─── Bankroll ─────────────────────────────────────────────────────────────────
export const bankroll = pgTable(
  "bankroll",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    platform: text("platform").notNull(),
    sport: text("sport"),
    totalDeposited: real("total_deposited").notNull(),
    totalWithdrawn: real("total_withdrawn").notNull(),
    currentBalance: real("current_balance").notNull(),
    totalWagered: real("total_wagered").notNull(),
    totalWon: real("total_won").notNull(),
    totalLost: real("total_lost").notNull(),
    roi: real("roi").notNull(),
    winRate: real("win_rate").notNull(),
    totalEntries: integer("total_entries").notNull(),
    wonEntries: integer("won_entries").notNull(),
    lostEntries: integer("lost_entries").notNull(),
    bestWin: real("best_win").notNull(),
    worstLoss: real("worst_loss").notNull(),
    currentStreak: integer("current_streak").notNull(),
    lastUpdated: real("last_updated").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("bankroll_user_id_idx").on(t.userId),
    index("bankroll_user_id_platform_idx").on(t.userId, t.platform),
  ],
);

// ─── Bankroll Transactions ────────────────────────────────────────────────────
export const bankrollTransactions = pgTable(
  "bankroll_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    platform: text("platform").notNull(),
    type: text("type").notNull(),
    amount: real("amount").notNull(),
    entryId: uuid("entry_id").references(() => entries.id),
    sport: text("sport"),
    description: text("description").notNull(),
    timestamp: real("timestamp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("bankroll_txn_user_id_idx").on(t.userId),
    index("bankroll_txn_user_id_platform_idx").on(t.userId, t.platform),
  ],
);

// ─── Pick Results ─────────────────────────────────────────────────────────────
export const pickResults = pgTable(
  "pick_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    pickId: uuid("pick_id").references(() => picks.id),
    propId: uuid("prop_id").references(() => props.id),
    playerName: text("player_name").notNull(),
    statType: text("stat_type").notNull(),
    sport: text("sport").notNull(),
    platform: text("platform").notNull(),
    propType: text("prop_type"),
    pickLine: real("pick_line").notNull(),
    pickProjection: real("pick_projection").notNull(),
    pickEdge: real("pick_edge").notNull(),
    pickModelProb: real("pick_model_prob"),
    pickMarketImpliedProb: real("pick_market_implied_prob"),
    overUnder: text("over_under").notNull(),
    pickedAt: real("picked_at").notNull(),
    resultStatus: text("result_status").notNull(), // "won" | "lost" | "push" | "void" | "pending"
    actualStat: real("actual_stat"),
    closingLine: real("closing_line"),
    closingOdds: real("closing_odds"),
    clv: real("clv"),
    ev: real("ev"),
    roi: real("roi"),
    gradedAt: real("graded_at"),
    dataSource: text("data_source").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("pick_results_user_id_idx").on(t.userId),
    index("pick_results_user_id_status_idx").on(t.userId, t.resultStatus),
    index("pick_results_sport_idx").on(t.sport),
    index("pick_results_platform_idx").on(t.platform),
    index("pick_results_player_name_idx").on(t.playerName),
    index("pick_results_user_id_player_name_idx").on(t.userId, t.playerName),
  ],
);

// ─── Prop Snapshots (line movement history) ───────────────────────────────────
export const propSnapshots = pgTable(
  "prop_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propId: uuid("prop_id").notNull().references(() => props.id),
    playerName: text("player_name").notNull(),
    statType: text("stat_type").notNull(),
    line: real("line").notNull(),
    projection: real("projection").notNull(),
    edge: real("edge").notNull(),
    modelProb: real("model_prob"),
    marketImpliedProb: real("market_implied_prob"),
    odds: real("odds"),
    snapshotType: text("snapshot_type").notNull(), // "opening" | "current" | "closing" | "update"
    timestamp: real("timestamp").notNull(),
    dataSource: text("data_source").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("prop_snapshots_prop_id_idx").on(t.propId),
    index("prop_snapshots_prop_id_type_idx").on(t.propId, t.snapshotType),
  ],
);

// ─── Player Game Logs ─────────────────────────────────────────────────────────
export const playerGameLogs = pgTable(
  "player_game_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id").notNull().references(() => players.id),
    playerName: text("player_name").notNull(),
    sport: text("sport").notNull(),
    team: text("team").notNull(),
    opponent: text("opponent").notNull(),
    gameDate: real("game_date").notNull(),
    homeAway: text("home_away").notNull(),
    points: real("points"),
    rebounds: real("rebounds"),
    assists: real("assists"),
    steals: real("steals"),
    blocks: real("blocks"),
    turnovers: real("turnovers"),
    threePointers: real("three_pointers"),
    minutes: real("minutes"),
    fg: text("fg"),
    hits: real("hits"),
    rbi: real("rbi"),
    runs: real("runs"),
    strikeoutsP: real("strikeouts_p"),
    inningsPitched: real("innings_pitched"),
    goals: real("goals"),
    shotsOnGoal: real("shots_on_goal"),
    saves: real("saves"),
    dataSource: text("data_source").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("player_game_logs_player_id_idx").on(t.playerId),
    index("player_game_logs_player_name_idx").on(t.playerName),
    index("player_game_logs_player_id_date_idx").on(t.playerId, t.gameDate),
  ],
);

// ─── Model Predictions ────────────────────────────────────────────────────────
export const modelPredictions = pgTable(
  "model_predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propId: uuid("prop_id").references(() => props.id),
    playerName: text("player_name").notNull(),
    statType: text("stat_type").notNull(),
    sport: text("sport").notNull(),
    platform: text("platform").notNull(),
    propType: text("prop_type"),
    line: real("line").notNull(),
    modelProb: real("model_prob").notNull(),
    marketImpliedProb: real("market_implied_prob").notNull(),
    edge: real("edge").notNull(),
    confidenceBucket: text("confidence_bucket").notNull(),
    edgeBucket: text("edge_bucket").notNull(),
    overUnder: text("over_under").notNull(),
    predictedAt: real("predicted_at").notNull(),
    resultStatus: text("result_status"),
    actualStat: real("actual_stat"),
    hit: boolean("hit"),
    gradedAt: real("graded_at"),
    dataSource: text("data_source").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("model_predictions_sport_idx").on(t.sport),
    index("model_predictions_confidence_bucket_idx").on(t.confidenceBucket),
    index("model_predictions_edge_bucket_idx").on(t.edgeBucket),
    index("model_predictions_platform_idx").on(t.platform),
  ],
);

// ─── Import Jobs ──────────────────────────────────────────────────────────────
export const importJobs = pgTable(
  "import_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    importSource: text("import_source").notNull(),
    status: text("status").notNull(),
    totalPicks: integer("total_picks").notNull(),
    successfulPicks: integer("successful_picks").notNull(),
    failedPicks: integer("failed_picks").notNull(),
    errors: text("errors").array().notNull().default([]),
    createdAt: real("created_at").notNull(),
    completedAt: real("completed_at"),
  },
  (t) => [
    index("import_jobs_user_id_idx").on(t.userId),
    index("import_jobs_user_id_status_idx").on(t.userId, t.status),
  ],
);

// ─── Kalshi Markets ───────────────────────────────────────────────────────────
export const kalshiMarkets = pgTable(
  "kalshi_markets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    marketTicker: text("market_ticker").notNull(),
    eventTicker: text("event_ticker").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    sport: text("sport"),
    yesPrice: real("yes_price").notNull(),
    noPrice: real("no_price").notNull(),
    yesBid: real("yes_bid").notNull(),
    noBid: real("no_bid").notNull(),
    impliedYesProbability: real("implied_yes_probability").notNull(),
    impliedNoProbability: real("implied_no_probability").notNull(),
    marketVolume: real("market_volume").notNull(),
    liquidityScore: real("liquidity_score").notNull(),
    settlementStatus: text("settlement_status").notNull(),
    closeTime: real("close_time"),
    expirationTime: real("expiration_time"),
    expectedPayout: real("expected_payout"),
    provider: text("provider").notNull(),
    sourceType: text("source_type").notNull(),
    externalId: text("external_id"),
    lastUpdated: real("last_updated").notNull(),
    staleAfterMinutes: real("stale_after_minutes").notNull(),
    refreshStatus: text("refresh_status").notNull(),
    confidenceInSource: real("confidence_in_source").notNull(),
    dataSource: text("data_source").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("kalshi_markets_market_ticker_idx").on(t.marketTicker),
    index("kalshi_markets_event_ticker_idx").on(t.eventTicker),
    index("kalshi_markets_sport_idx").on(t.sport),
    index("kalshi_markets_settlement_status_idx").on(t.settlementStatus),
  ],
);

// ─── Provider Config ──────────────────────────────────────────────────────────
export const providerConfig = pgTable(
  "provider_config",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    enabled: boolean("enabled").notNull(),
    apiKeyConfigured: boolean("api_key_configured").notNull(),
    supportedSports: text("supported_sports").array().notNull().default([]),
    supportedMarkets: text("supported_markets").array().notNull().default([]),
    rateLimitPerMonth: integer("rate_limit_per_month"),
    requestsUsedThisMonth: integer("requests_used_this_month").notNull().default(0),
    rateLimitResetAt: real("rate_limit_reset_at"),
    lastSyncTime: real("last_sync_time"),
    lastSyncStatus: text("last_sync_status").notNull(),
    lastSyncError: text("last_sync_error"),
    lastSyncRecords: integer("last_sync_records").notNull().default(0),
    nextSyncAfter: real("next_sync_after"),
    staleAfterMinutes: integer("stale_after_minutes").notNull(),
    updatedAt: real("updated_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("provider_config_provider_idx").on(t.provider)],
);

// ─── Live Events ──────────────────────────────────────────────────────────────
export const liveEvents = pgTable(
  "live_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    externalId: text("external_id").notNull(),
    sport: text("sport").notNull(),
    sportKey: text("sport_key").notNull(),
    homeTeam: text("home_team").notNull(),
    awayTeam: text("away_team").notNull(),
    commenceTime: real("commence_time").notNull(),
    status: text("status").notNull(),
    sourceType: text("source_type").notNull(),
    lastUpdated: real("last_updated").notNull(),
    staleAfterMinutes: integer("stale_after_minutes").notNull(),
    refreshStatus: text("refresh_status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("live_events_provider_idx").on(t.provider),
    index("live_events_sport_idx").on(t.sport),
    index("live_events_external_id_idx").on(t.externalId),
    index("live_events_status_idx").on(t.status),
  ],
);

// ─── Live Odds ────────────────────────────────────────────────────────────────
export const liveOdds = pgTable(
  "live_odds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    eventExternalId: text("event_external_id").notNull(),
    liveEventId: uuid("live_event_id").references(() => liveEvents.id),
    sport: text("sport").notNull(),
    bookmaker: text("bookmaker").notNull(),
    marketType: text("market_type").notNull(),
    playerName: text("player_name"),
    statType: text("stat_type"),
    line: real("line"),
    overPrice: real("over_price"),
    underPrice: real("under_price"),
    overImplied: real("over_implied"),
    underImplied: real("under_implied"),
    homeOdds: real("home_odds"),
    awayOdds: real("away_odds"),
    drawOdds: real("draw_odds"),
    spread: real("spread"),
    total: real("total"),
    sourceType: text("source_type").notNull(),
    externalId: text("external_id"),
    lastUpdated: real("last_updated").notNull(),
    staleAfterMinutes: integer("stale_after_minutes").notNull(),
    refreshStatus: text("refresh_status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("live_odds_provider_idx").on(t.provider),
    index("live_odds_event_external_id_idx").on(t.eventExternalId),
    index("live_odds_sport_market_type_idx").on(t.sport, t.marketType),
    index("live_odds_bookmaker_idx").on(t.bookmaker),
  ],
);

// ─── Live Odds Snapshots ──────────────────────────────────────────────────────
export const liveOddsSnapshots = pgTable(
  "live_odds_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    liveOddsId: uuid("live_odds_id").notNull().references(() => liveOdds.id),
    eventExternalId: text("event_external_id").notNull(),
    bookmaker: text("bookmaker").notNull(),
    marketType: text("market_type").notNull(),
    playerName: text("player_name"),
    statType: text("stat_type"),
    line: real("line"),
    previousOverPrice: real("previous_over_price"),
    currentOverPrice: real("current_over_price"),
    previousUnderPrice: real("previous_under_price"),
    currentUnderPrice: real("current_under_price"),
    openingOverPrice: real("opening_over_price"),
    openingUnderPrice: real("opening_under_price"),
    closingOverPrice: real("closing_over_price"),
    closingUnderPrice: real("closing_under_price"),
    previousHomeOdds: real("previous_home_odds"),
    currentHomeOdds: real("current_home_odds"),
    previousAwayOdds: real("previous_away_odds"),
    currentAwayOdds: real("current_away_odds"),
    previousSpread: real("previous_spread"),
    currentSpread: real("current_spread"),
    previousTotal: real("previous_total"),
    currentTotal: real("current_total"),
    movementDirection: text("movement_direction"),
    snapshotTime: real("snapshot_time").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("live_odds_snapshots_live_odds_id_idx").on(t.liveOddsId),
    index("live_odds_snapshots_event_external_id_idx").on(t.eventExternalId),
    index("live_odds_snapshots_snapshot_time_idx").on(t.snapshotTime),
  ],
);

// ─── Model Versions ───────────────────────────────────────────────────────────
export const modelVersions = pgTable(
  "model_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: text("version").notNull(),
    modelType: text("model_type").notNull(),
    trainedAt: real("trained_at").notNull(),
    trainingRows: integer("training_rows").notNull(),
    featureCount: integer("feature_count").notNull(),
    accuracy: real("accuracy").notNull(),
    logLoss: real("log_loss").notNull(),
    brierScore: real("brier_score").notNull(),
    auc: real("auc").notNull(),
    calibrationError: real("calibration_error").notNull(),
    sports: text("sports").array().notNull().default([]),
    statTypes: text("stat_types").array().notNull().default([]),
    notes: text("notes").notNull(),
    isActive: boolean("is_active").notNull(),
    isDemo: boolean("is_demo").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("model_versions_version_idx").on(t.version),
    index("model_versions_is_active_idx").on(t.isActive),
  ],
);

// ─── API-SPORTS Cache ─────────────────────────────────────────────────────────
export const apiSportsCache = pgTable(
  "api_sports_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dataType: text("data_type").notNull(),
    sport: text("sport").notNull(),
    apiSportsId: integer("api_sports_id").notNull(),
    data: jsonb("data").notNull(),
    lastUpdated: real("last_updated").notNull(),
    staleAfterMinutes: integer("stale_after_minutes").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("api_sports_cache_type_idx").on(t.dataType),
    index("api_sports_cache_type_sport_idx").on(t.dataType, t.sport),
    index("api_sports_cache_sport_idx").on(t.sport),
    index("api_sports_cache_api_sports_id_idx").on(t.apiSportsId),
  ],
);

// ─── Media Assets ─────────────────────────────────────────────────────────────
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    entityName: text("entity_name").notNull(),
    provider: text("provider").notNull(),
    sourceUrl: text("source_url").notNull(),
    cachedUrl: text("cached_url"),
    imageType: text("image_type").notNull(),
    license: text("license"),
    lastChecked: real("last_checked").notNull(),
    isFallback: boolean("is_fallback").notNull(),
    confidence: real("confidence").notNull(),
    sport: text("sport"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("media_assets_entity_idx").on(t.entityType, t.entityId),
    index("media_assets_entity_type_idx").on(t.entityType, t.imageType),
    index("media_assets_provider_idx").on(t.provider),
    index("media_assets_name_idx").on(t.entityName),
  ],
);

// ─── Provider Usage Log ───────────────────────────────────────────────────────
export const providerUsageLog = pgTable(
  "provider_usage_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    endpoint: text("endpoint").notNull(),
    sport: text("sport").notNull(),
    requestsUsed: integer("requests_used").notNull(),
    recordsFetched: integer("records_fetched").notNull(),
    success: boolean("success").notNull(),
    error: text("error"),
    timestamp: real("timestamp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("provider_usage_log_provider_idx").on(t.provider),
    index("provider_usage_log_timestamp_idx").on(t.timestamp),
    index("provider_usage_log_provider_timestamp_idx").on(t.provider, t.timestamp),
  ],
);

// ─── Player Intel Snapshots (renamed from Convex playerIntelSnapshots) ─────────
export const playerIntelSnapshots = pgTable(
  "player_intel_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id").references(() => players.id),
    playerName: text("player_name").notNull(),
    sport: text("sport").notNull(),
    snapshotData: jsonb("snapshot_data").notNull(), // flexible intel payload
    dataSource: text("data_source").notNull(),
    timestamp: real("timestamp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("player_intel_snapshots_player_id_idx").on(t.playerId),
    index("player_intel_snapshots_player_name_idx").on(t.playerName),
  ],
);
