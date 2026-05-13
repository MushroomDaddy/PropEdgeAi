import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Sports / leagues
  sports: defineTable({
    name: v.string(), // "NFL", "NBA", "MLB", "NHL"
    slug: v.string(),
    icon: v.string(), // emoji
    active: v.boolean(),
  }).index("by_slug", ["slug"]),

  // Players
  players: defineTable({
    name: v.string(),
    team: v.string(),
    position: v.string(),
    sport: v.string(),
    imageUrl: v.optional(v.string()),
    teamLogoUrl: v.optional(v.string()),
    jerseyNumber: v.optional(v.number()),
    teamColor: v.optional(v.string()),
    injuryStatus: v.optional(v.string()),
    recentForm: v.optional(v.string()),
    seasonAvg: v.optional(v.object({
      points: v.optional(v.number()),
      rebounds: v.optional(v.number()),
      assists: v.optional(v.number()),
      threePointers: v.optional(v.number()),
    })),
    last5Avg: v.optional(v.object({
      points: v.optional(v.number()),
      rebounds: v.optional(v.number()),
      assists: v.optional(v.number()),
      threePointers: v.optional(v.number()),
    })),
  })
    .index("by_sport", ["sport"])
    .index("by_name", ["name"])
    .index("by_team", ["team"]),

  // Games
  games: defineTable({
    sport: v.string(),
    homeTeam: v.string(),
    awayTeam: v.string(),
    gameTime: v.number(),
    status: v.string(),
    homeScore: v.optional(v.number()),
    awayScore: v.optional(v.number()),
    venue: v.optional(v.string()),
    quarter: v.optional(v.string()),
    gameClock: v.optional(v.string()),
    broadcast: v.optional(v.string()),
    playByPlay: v.optional(v.array(v.object({
      time: v.string(),
      quarter: v.string(),
      description: v.string(),
      team: v.string(),
      type: v.string(),
      points: v.optional(v.number()),
    }))),
    boxScore: v.optional(v.object({
      home: v.array(v.object({
        name: v.string(),
        position: v.string(),
        minutes: v.number(),
        points: v.number(),
        rebounds: v.number(),
        assists: v.number(),
        steals: v.number(),
        blocks: v.number(),
        turnovers: v.number(),
        fg: v.string(),
        threePt: v.string(),
        ft: v.string(),
        plusMinus: v.number(),
      })),
      away: v.array(v.object({
        name: v.string(),
        position: v.string(),
        minutes: v.number(),
        points: v.number(),
        rebounds: v.number(),
        assists: v.number(),
        steals: v.number(),
        blocks: v.number(),
        turnovers: v.number(),
        fg: v.string(),
        threePt: v.string(),
        ft: v.string(),
        plusMinus: v.number(),
      })),
    })),
    roster: v.optional(v.object({
      home: v.object({
        active: v.array(v.string()),
        out: v.array(v.object({ name: v.string(), reason: v.string() })),
      }),
      away: v.object({
        active: v.array(v.string()),
        out: v.array(v.object({ name: v.string(), reason: v.string() })),
      }),
    })),
  })
    .index("by_sport", ["sport"])
    .index("by_status", ["status"])
    .index("by_sport_status", ["sport", "status"]),

  // Player props (the core data)
  props: defineTable({
    playerId: v.id("players"),
    gameId: v.id("games"),
    sport: v.string(),
    playerName: v.string(),
    team: v.string(),
    statType: v.string(),
    line: v.number(),
    projection: v.number(),
    projectionSources: v.array(v.object({ source: v.string(), value: v.number() })),
    platform: v.string(),
    edge: v.number(),
    modelProb: v.optional(v.number()),
    marketImpliedProb: v.optional(v.number()),
    projectionDiff: v.optional(v.number()),
    confidence: v.number(),
    hitRate: v.number(),
    overUnder: v.string(),
    propType: v.optional(v.string()),
    dataSource: v.optional(v.string()),
    lastUpdated: v.optional(v.number()),
    provider: v.optional(v.string()),
    variance: v.number(),
    matchupRating: v.number(),
    last10Trend: v.optional(v.string()),
    last10Hits: v.optional(v.number()),
    dvpRank: v.optional(v.number()),
    correlatedWith: v.optional(v.array(v.string())),
    impliedProb: v.optional(v.number()),
    isKalshiMarket: v.optional(v.boolean()),
    kalshiPayout: v.optional(v.object({ yesPayout: v.number(), noPayout: v.number() })),
    bustRisk: v.optional(v.number()),
    projectionConsensus: v.optional(v.object({
      avg: v.number(), numSources: v.number(), numOverLine: v.number(), spread: v.number(),
    })),
    hotColdStreak: v.optional(v.object({ type: v.string(), games: v.number(), label: v.string() })),
    monteCarloSim: v.optional(v.object({
      simulations: v.number(), hitRate: v.number(), p10: v.number(), p50: v.number(), p90: v.number(), stdDev: v.number(),
    })),
    historicalHitRate: v.optional(v.object({
      similarLines: v.number(), sampleSize: v.number(), vsTeam: v.optional(v.number()),
    })),
  })
    .index("by_sport", ["sport"])
    .index("by_platform", ["platform"])
    .index("by_edge", ["edge"])
    .index("by_playerId", ["playerId"])
    .index("by_gameId", ["gameId"])
    .index("by_sport_platform", ["sport", "platform"]),

  // User picks
  picks: defineTable({
    userId: v.id("users"),
    propId: v.optional(v.id("props")), // optional for imported picks
    playerName: v.string(),
    statType: v.string(),
    line: v.number(),
    projection: v.number(),
    edge: v.number(),
    overUnder: v.string(),
    platform: v.string(),
    sport: v.string(),
    team: v.optional(v.string()),
    gameId: v.optional(v.id("games")),
    status: v.string(),
    result: v.optional(v.number()),
    addedAt: v.number(),
    // Import tracking (R10.1)
    sourceType: v.optional(v.string()),              // "manual" | "csv" | "screenshot" | "live" | "demo"
    importJobId: v.optional(v.id("importJobs")),
    // Match result
    matchStatus: v.optional(v.string()),              // "matched" | "unmatched" | "partial" | "needs_review"
    matchedPropId: v.optional(v.id("props")),         // the matched prop (if any)
    matchConfidence: v.optional(v.number()),           // 0-1 confidence in the match
    // Original imported data (full audit trail)
    originalImportedLine: v.optional(v.number()),
    originalImportedPlatform: v.optional(v.string()),
    originalImportedPlayer: v.optional(v.string()),
    originalImportedStatType: v.optional(v.string()),
    originalImportedDirection: v.optional(v.string()), // "over" | "under"
    originalImportedSport: v.optional(v.string()),
    originalImportedOdds: v.optional(v.number()),      // e.g. -110, +120
    originalImportedStake: v.optional(v.number()),     // wager amount
    // Review workflow
    reviewStatus: v.optional(v.string()),              // "pending" | "accepted" | "rejected" | "corrected"
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  // User entries
  entries: defineTable({
    userId: v.id("users"),
    platform: v.string(),
    pickIds: v.array(v.id("picks")),
    entryType: v.string(),
    status: v.string(),
    payout: v.optional(v.number()),
    stake: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  // Chat messages
  chatMessages: defineTable({
    userId: v.id("users"),
    role: v.string(),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_userId", ["userId"]),

  // User settings
  userSettings: defineTable({
    userId: v.id("users"),
    favoriteSports: v.array(v.string()),
    favoritePlatforms: v.array(v.string()),
    riskTolerance: v.string(),
    darkMode: v.boolean(),
    notifications: v.boolean(),
    defaultBankroll: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  // Leaderboard
  leaderboard: defineTable({
    username: v.string(),
    avatar: v.string(),
    winRate: v.number(),
    totalPicks: v.number(),
    profit: v.number(),
    streak: v.number(),
    rank: v.number(),
    tier: v.string(),
  }).index("by_rank", ["rank"]),

  // Bankroll tracker
  bankroll: defineTable({
    userId: v.id("users"),
    platform: v.string(),
    sport: v.optional(v.string()),
    totalDeposited: v.number(),
    totalWithdrawn: v.number(),
    currentBalance: v.number(),
    totalWagered: v.number(),
    totalWon: v.number(),
    totalLost: v.number(),
    roi: v.number(),
    winRate: v.number(),
    totalEntries: v.number(),
    wonEntries: v.number(),
    lostEntries: v.number(),
    bestWin: v.number(),
    worstLoss: v.number(),
    currentStreak: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_platform", ["userId", "platform"]),

  // Bankroll transactions
  bankrollTransactions: defineTable({
    userId: v.id("users"),
    platform: v.string(),
    type: v.string(),
    amount: v.number(),
    entryId: v.optional(v.id("entries")),
    sport: v.optional(v.string()),
    description: v.string(),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_platform", ["userId", "platform"]),

  // ─── R8: Pick Results (grading) ───
  pickResults: defineTable({
    userId: v.id("users"),
    pickId: v.optional(v.id("picks")),
    propId: v.optional(v.id("props")),
    playerName: v.string(),
    statType: v.string(),
    sport: v.string(),
    platform: v.string(),
    propType: v.optional(v.string()),
    // Pick-time snapshot
    pickLine: v.number(),
    pickProjection: v.number(),
    pickEdge: v.number(),
    pickModelProb: v.optional(v.number()),
    pickMarketImpliedProb: v.optional(v.number()),
    overUnder: v.string(),
    pickedAt: v.number(),
    // Result
    resultStatus: v.string(), // "won" | "lost" | "push" | "void" | "pending"
    actualStat: v.optional(v.number()),
    closingLine: v.optional(v.number()),
    closingOdds: v.optional(v.number()),
    clv: v.optional(v.number()), // closing line value
    ev: v.optional(v.number()),
    roi: v.optional(v.number()),
    gradedAt: v.optional(v.number()),
    // Data tracking
    dataSource: v.string(), // "demo" | "live"
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "resultStatus"])
    .index("by_sport", ["sport"])
    .index("by_platform", ["platform"])
    .index("by_playerName", ["playerName"])
    .index("by_userId_playerName", ["userId", "playerName"]),

  // ─── R8: Prop Snapshots (line movement history) ───
  propSnapshots: defineTable({
    propId: v.id("props"),
    playerName: v.string(),
    statType: v.string(),
    line: v.number(),
    projection: v.number(),
    edge: v.number(),
    modelProb: v.optional(v.number()),
    marketImpliedProb: v.optional(v.number()),
    odds: v.optional(v.number()),
    snapshotType: v.string(), // "opening" | "current" | "closing" | "update"
    timestamp: v.number(),
    dataSource: v.string(),
  })
    .index("by_propId", ["propId"])
    .index("by_propId_type", ["propId", "snapshotType"]),

  // ─── R8: Player Game Logs ───
  playerGameLogs: defineTable({
    playerId: v.id("players"),
    playerName: v.string(),
    sport: v.string(),
    team: v.string(),
    opponent: v.string(),
    gameDate: v.number(),
    homeAway: v.string(), // "home" | "away"
    // Stats (flexible — different per sport)
    points: v.optional(v.number()),
    rebounds: v.optional(v.number()),
    assists: v.optional(v.number()),
    steals: v.optional(v.number()),
    blocks: v.optional(v.number()),
    turnovers: v.optional(v.number()),
    threePointers: v.optional(v.number()),
    minutes: v.optional(v.number()),
    fg: v.optional(v.string()),
    // MLB
    hits: v.optional(v.number()),
    rbi: v.optional(v.number()),
    runs: v.optional(v.number()),
    strikeoutsP: v.optional(v.number()), // pitcher Ks
    inningsPitched: v.optional(v.number()),
    // NHL
    goals: v.optional(v.number()),
    shotsOnGoal: v.optional(v.number()),
    saves: v.optional(v.number()),
    dataSource: v.string(),
  })
    .index("by_playerId", ["playerId"])
    .index("by_playerName", ["playerName"])
    .index("by_playerId_date", ["playerId", "gameDate"]),

  // ─── R8: Model Predictions (track model accuracy) ───
  modelPredictions: defineTable({
    propId: v.optional(v.id("props")),
    playerName: v.string(),
    statType: v.string(),
    sport: v.string(),
    platform: v.string(),
    propType: v.optional(v.string()),
    line: v.number(),
    modelProb: v.number(),
    marketImpliedProb: v.number(),
    edge: v.number(),
    confidenceBucket: v.string(), // "50-60", "60-70", "70-80", "80-90", "90+"
    edgeBucket: v.string(), // "0-5", "5-10", "10-15", "15+"
    overUnder: v.string(),
    predictedAt: v.number(),
    // Result (filled after grading)
    resultStatus: v.optional(v.string()),
    actualStat: v.optional(v.number()),
    hit: v.optional(v.boolean()),
    gradedAt: v.optional(v.number()),
    dataSource: v.string(),
  })
    .index("by_sport", ["sport"])
    .index("by_confidenceBucket", ["confidenceBucket"])
    .index("by_edgeBucket", ["edgeBucket"])
    .index("by_platform", ["platform"]),

  // ─── R10: Import Jobs ───
  importJobs: defineTable({
    userId: v.id("users"),
    importSource: v.string(), // "manual" | "csv" | "screenshot"
    status: v.string(),       // "pending" | "processing" | "completed" | "failed"
    totalPicks: v.number(),
    successfulPicks: v.number(),
    failedPicks: v.number(),
    errors: v.array(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  // ─── R10: Kalshi Markets ───
  kalshiMarkets: defineTable({
    marketTicker: v.string(),
    eventTicker: v.string(),
    title: v.string(),
    category: v.string(),
    sport: v.optional(v.string()),
    yesPrice: v.number(),
    noPrice: v.number(),
    yesBid: v.number(),
    noBid: v.number(),
    impliedYesProbability: v.number(),
    impliedNoProbability: v.number(),
    marketVolume: v.number(),
    liquidityScore: v.number(),
    settlementStatus: v.string(),
    closeTime: v.optional(v.number()),
    expirationTime: v.optional(v.number()),
    expectedPayout: v.optional(v.number()),
    // Provider meta
    provider: v.string(),
    sourceType: v.string(),
    externalId: v.optional(v.string()),
    lastUpdated: v.number(),
    staleAfterMinutes: v.number(),
    refreshStatus: v.string(),
    confidenceInSource: v.number(),
    dataSource: v.string(),
  })
    .index("by_marketTicker", ["marketTicker"])
    .index("by_eventTicker", ["eventTicker"])
    .index("by_sport", ["sport"])
    .index("by_settlementStatus", ["settlementStatus"]),

  // ─── R10: Model Versions ───
  modelVersions: defineTable({
    version: v.string(),
    modelType: v.string(),
    trainedAt: v.number(),
    trainingRows: v.number(),
    featureCount: v.number(),
    accuracy: v.number(),
    logLoss: v.number(),
    brierScore: v.number(),
    auc: v.number(),
    calibrationError: v.number(),
    sports: v.array(v.string()),
    statTypes: v.array(v.string()),
    notes: v.string(),
    isActive: v.boolean(),
    isDemo: v.boolean(),
  })
    .index("by_version", ["version"])
    .index("by_isActive", ["isActive"]),
});

export default schema;
