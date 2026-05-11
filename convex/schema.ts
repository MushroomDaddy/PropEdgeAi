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
    // R5: Game detail fields
    playByPlay: v.optional(v.array(v.object({
      time: v.string(),
      quarter: v.string(),
      description: v.string(),
      team: v.string(),
      type: v.string(), // "score", "foul", "turnover", "timeout", "substitution"
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
        out: v.array(v.object({
          name: v.string(),
          reason: v.string(),
        })),
      }),
      away: v.object({
        active: v.array(v.string()),
        out: v.array(v.object({
          name: v.string(),
          reason: v.string(),
        })),
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
    projectionSources: v.array(v.object({
      source: v.string(),
      value: v.number(),
    })),
    platform: v.string(),
    edge: v.number(),
    confidence: v.number(),
    hitRate: v.number(),
    overUnder: v.string(),
    propType: v.optional(v.string()), // "over_under", "moneyline", "spread", "total", "first_scorer", "alt_line", etc.
    variance: v.number(),
    matchupRating: v.number(),
    // R2 fields
    last10Trend: v.optional(v.string()),
    last10Hits: v.optional(v.number()),
    dvpRank: v.optional(v.number()),
    correlatedWith: v.optional(v.array(v.string())),
    impliedProb: v.optional(v.number()),
    isKalshiMarket: v.optional(v.boolean()),
    kalshiPayout: v.optional(v.object({
      yesPayout: v.number(),
      noPayout: v.number(),
    })),
    // R3 fields — Deeper Analytics
    bustRisk: v.optional(v.number()), // 0-100 bust probability
    projectionConsensus: v.optional(v.object({
      avg: v.number(),
      numSources: v.number(),
      numOverLine: v.number(),
      spread: v.number(), // max - min of sources
    })),
    hotColdStreak: v.optional(v.object({
      type: v.string(), // "hot", "cold", "neutral"
      games: v.number(), // streak length
      label: v.string(), // "🔥 5G Hot", "❄️ 3G Cold"
    })),
    monteCarloSim: v.optional(v.object({
      simulations: v.number(),
      hitRate: v.number(), // % that hit the line
      p10: v.number(), // 10th percentile outcome
      p50: v.number(), // median outcome
      p90: v.number(), // 90th percentile outcome
      stdDev: v.number(),
    })),
    historicalHitRate: v.optional(v.object({
      similarLines: v.number(), // % hit on similar lines historically
      sampleSize: v.number(),
      vsTeam: v.optional(v.number()), // % hit vs this specific team
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
    propId: v.id("props"),
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
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"]),

  // User entries (groups of picks submitted to platforms)
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

  // Leaderboard entries (mock)
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

  // Bankroll tracker (R3)
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
    roi: v.number(), // percentage
    winRate: v.number(),
    totalEntries: v.number(),
    wonEntries: v.number(),
    lostEntries: v.number(),
    bestWin: v.number(),
    worstLoss: v.number(),
    currentStreak: v.number(), // positive = winning, negative = losing
    lastUpdated: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_platform", ["userId", "platform"]),

  // Bankroll transactions (R3)
  bankrollTransactions: defineTable({
    userId: v.id("users"),
    platform: v.string(),
    type: v.string(), // "win", "loss", "deposit", "withdrawal"
    amount: v.number(),
    entryId: v.optional(v.id("entries")),
    sport: v.optional(v.string()),
    description: v.string(),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_platform", ["userId", "platform"]),
});

export default schema;
