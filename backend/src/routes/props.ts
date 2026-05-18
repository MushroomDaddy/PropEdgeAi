import { Hono } from 'hono';
import { db } from '../db/client.js';
import { props, players } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, desc, sql, and, gt, ilike } from 'drizzle-orm';

const app = new Hono();

// GET /api/props — list props with optional filters
app.get('/', async (c) => {
  const sport = c.req.query('sport');
  const platform = c.req.query('platform');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '100', 10), 500);

  const conditions = [];
  if (sport) conditions.push(eq(props.sport, sport));
  if (platform) conditions.push(eq(props.platform, platform));

  const rows = await db
    .select({
      id: props.id,
      playerId: props.playerId,
      gameId: props.gameId,
      sport: props.sport,
      playerName: props.playerName,
      team: props.team,
      statType: props.statType,
      line: props.line,
      projection: props.projection,
      projectionSources: props.projectionSources,
      platform: props.platform,
      edge: props.edge,
      modelProb: props.modelProb,
      marketImpliedProb: props.marketImpliedProb,
      confidence: props.confidence,
      hitRate: props.hitRate,
      overUnder: props.overUnder,
      propType: props.propType,
      dataSource: props.dataSource,
      lastUpdated: props.lastUpdated,
      provider: props.provider,
      variance: props.variance,
      matchupRating: props.matchupRating,
      last10Trend: props.last10Trend,
      last10Hits: props.last10Hits,
      dvpRank: props.dvpRank,
      bustRisk: props.bustRisk,
      hotColdStreak: props.hotColdStreak,
      monteCarloSim: props.monteCarloSim,
      historicalHitRate: props.historicalHitRate,
      createdAt: props.createdAt,
      // Player fields (may be null if no playerId)
      playerImage: players.headshotUrl,
      playerTeamColor: players.teamColor,
      playerTeamColors: players.teamColors,
      playerTeamLogo: players.teamLogoUrl,
      playerJerseyNumber: players.jerseyNumber,
      playerPosition: players.position,
    })
    .from(props)
    .leftJoin(players, eq(props.playerId, players.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(props.edge))
    .limit(limit);

  return c.json(rows);
});

// GET /api/props/stats — aggregate stats from the props table
app.get('/stats', async (c) => {
  const result = await db
    .select({
      totalProps: sql<number>`count(*)::int`,
      avgEdge: sql<number>`round(avg(${props.edge})::numeric, 1)`,
      positiveEdgeCount: sql<number>`count(*) filter (where ${props.edge} > 0)::int`,
      topSport: sql<string>`(
        select ${props.sport} from ${props}
        group by ${props.sport}
        order by count(*) desc
        limit 1
      )`,
    })
    .from(props);

  const stats = result[0] ?? { totalProps: 0, avgEdge: 0, positiveEdgeCount: 0, topSport: 'NBA' };
  return c.json(stats);
});

// GET /api/props/top-value — highest edge props with player images/colors
app.get('/top-value', async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') ?? '12', 10), 50);

  const rows = await db
    .select({
      id: props.id,
      playerName: props.playerName,
      team: props.team,
      sport: props.sport,
      statType: props.statType,
      line: props.line,
      projection: props.projection,
      edge: props.edge,
      confidence: props.confidence,
      overUnder: props.overUnder,
      platform: props.platform,
      dataSource: props.dataSource,
      lastUpdated: props.lastUpdated,
      hitRate: props.hitRate,
      variance: props.variance,
      matchupRating: props.matchupRating,
      bustRisk: props.bustRisk,
      hotColdStreak: props.hotColdStreak,
      // Player enrichment
      playerImage: players.headshotUrl,
      playerImageUrl: players.imageUrl,
      playerTeamColor: players.teamColor,
      playerTeamColors: players.teamColors,
      playerTeamLogo: players.teamLogoUrl,
      playerJerseyNumber: players.jerseyNumber,
      playerPosition: players.position,
    })
    .from(props)
    .leftJoin(players, eq(props.playerId, players.id))
    .where(gt(props.edge, 0))
    .orderBy(desc(props.edge))
    .limit(limit);

  return c.json(rows);
});

// GET /api/props/top-edges — highest absolute edge props
app.get('/top-edges', async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10), 50);

  const rows = await db
    .select({
      id: props.id,
      playerName: props.playerName,
      team: props.team,
      sport: props.sport,
      statType: props.statType,
      line: props.line,
      projection: props.projection,
      edge: props.edge,
      confidence: props.confidence,
      overUnder: props.overUnder,
      platform: props.platform,
      lastUpdated: props.lastUpdated,
      playerImage: players.headshotUrl,
      playerTeamColor: players.teamColor,
      playerTeamColors: players.teamColors,
      playerTeamLogo: players.teamLogoUrl,
    })
    .from(props)
    .leftJoin(players, eq(props.playerId, players.id))
    .orderBy(sql`abs(${props.edge}) desc`)
    .limit(limit);

  return c.json(rows);
});

// POST /api/props/diversification-suggestions — find diverse prop mix
app.post('/diversification-suggestions', async (c) => {
  const body = await c.req.json();
  const sport = body.sport;
  const count = Math.min(body.count ?? 10, 30);

  // Get a diverse set: one per player, spread across stat types
  const conditions = [];
  if (sport) conditions.push(eq(props.sport, sport));
  conditions.push(gt(props.edge, 0));

  const rows = await db
    .select({
      id: props.id,
      playerName: props.playerName,
      team: props.team,
      sport: props.sport,
      statType: props.statType,
      line: props.line,
      projection: props.projection,
      edge: props.edge,
      confidence: props.confidence,
      platform: props.platform,
    })
    .from(props)
    .where(and(...conditions))
    .orderBy(desc(props.edge))
    .limit(count * 3); // fetch extra for filtering

  // Deduplicate by player name to get diversity
  const seen = new Set<string>();
  const diverse = rows.filter((r) => {
    if (seen.has(r.playerName)) return false;
    seen.add(r.playerName);
    return true;
  }).slice(0, count);

  return c.json(diverse);
});

export default app;
