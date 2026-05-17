import { pgTable, text, integer, boolean, timestamp, numeric, jsonb, pgEnum, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'elite'])
export const gameStatusEnum = pgEnum('game_status', ['scheduled', 'live', 'final', 'postponed'])
export const pickStatusEnum = pgEnum('pick_status', ['pending', 'won', 'lost', 'push'])
export const providerStatusValEnum = pgEnum('provider_status_val', ['active', 'error', 'inactive'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const sports = pgTable('sports', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  active: boolean('active').default(true),
  lastUpdated: timestamp('last_updated').defaultNow(),
})

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  sportId: uuid('sport_id').references(() => sports.id),
  name: text('name').notNull(),
  abbreviation: text('abbreviation').notNull(),
  city: text('city').notNull(),
  conference: text('conference'),
  division: text('division'),
  active: boolean('active').default(true),
})

export const games = pgTable('games', {
  id: uuid('id').defaultRandom().primaryKey(),
  sportId: uuid('sport_id').references(() => sports.id),
  homeTeamId: uuid('home_team_id').references(() => teams.id),
  awayTeamId: uuid('away_team_id').references(() => teams.id),
  gameDate: timestamp('game_date').notNull(),
  status: gameStatusEnum('status').default('scheduled'),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  season: text('season').notNull(),
  week: integer('week'),
  externalId: text('external_id').unique(),
  venue: text('venue'),
  provider: text('provider'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  gameDateIdx: index('games_game_date_idx').on(t.gameDate),
  statusIdx: index('games_status_idx').on(t.status),
}))

export const props = pgTable('props', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: text('game_id'),
  playerId: text('player_id'),
  playerName: text('player_name').notNull(),
  team: text('team').notNull(),
  opponent: text('opponent').notNull(),
  sport: text('sport').notNull(),
  statType: text('stat_type').notNull(),
  line: numeric('line').notNull(),
  overOdds: integer('over_odds').notNull(),
  underOdds: integer('under_odds').notNull(),
  gameDate: timestamp('game_date').notNull(),
  provider: text('provider'),
  externalId: text('external_id'),
  confidence: numeric('confidence'),
  edge: numeric('edge'),
  modelPrediction: numeric('model_prediction'),
  recommendation: text('recommendation'),
  reasoning: text('reasoning'),
  hitRate: numeric('hit_rate'),
  actualValue: numeric('actual_value'),
  result: text('result'),
  active: boolean('active').default(true),
  aiInsight: text('ai_insight'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (t) => ({
  sportIdx: index('props_sport_idx').on(t.sport),
  activeIdx: index('props_active_idx').on(t.active),
}))

export const picks = pgTable('picks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  propId: uuid('prop_id').references(() => props.id),
  direction: text('direction').notNull(),
  stake: numeric('stake'),
  odds: integer('odds'),
  notes: text('notes'),
  status: pickStatusEnum('status').default('pending'),
  profit: numeric('profit'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const results = pgTable('results', {
  id: uuid('id').defaultRandom().primaryKey(),
  pickId: uuid('pick_id').references(() => picks.id),
  outcome: text('outcome').notNull(),
  actualValue: numeric('actual_value').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const modelPredictions = pgTable('model_predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  propId: uuid('prop_id').references(() => props.id),
  modelVersion: text('model_version').notNull(),
  prediction: numeric('prediction').notNull(),
  confidence: numeric('confidence').notNull(),
  features: jsonb('features'),
  actualValue: numeric('actual_value'),
  correct: boolean('correct'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const providerStatus = pgTable('provider_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: text('provider').notNull().unique(),
  status: providerStatusValEnum('status').notNull(),
  lastSync: timestamp('last_sync'),
  errorMessage: text('error_message'),
  recordCount: integer('record_count'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const providerRequestLog = pgTable('provider_request_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: text('provider').notNull(),
  endpoint: text('endpoint'),
  requestCost: numeric('request_cost'),
  budgetUsed: numeric('budget_used'),
  budgetLimit: numeric('budget_limit'),
  responseStatus: integer('response_status'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const apiCache = pgTable('api_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const odds = pgTable('odds', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id').references(() => games.id),
  bookmaker: text('bookmaker').notNull(),
  market: text('market').notNull(),
  homeOdds: integer('home_odds'),
  awayOdds: integer('away_odds'),
  homeSpread: numeric('home_spread'),
  awaySpread: numeric('away_spread'),
  total: numeric('total'),
  overOdds: integer('over_odds'),
  underOdds: integer('under_odds'),
  timestamp: timestamp('timestamp').defaultNow(),
})

export const rateLimits = pgTable('rate_limits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  count: integer('count').notNull(),
  windowStart: timestamp('window_start').notNull(),
  windowEnd: timestamp('window_end').notNull(),
})
