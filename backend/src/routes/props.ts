import { Hono } from 'hono';
import { db } from '../db/client.js';
import { props } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { computeValueScore } from '../lib/valueScore.js';

const app = new Hono();

// GET /api/props?sport=&platform=
app.get('/', requireAuth, async (c) => {
  const sport = c.req.query('sport');
  const platform = c.req.query('platform');
  const conditions = [];
  if (sport) conditions.push(eq(props.sport, sport));
  if (platform) conditions.push(eq(props.platform, platform));
  const rows = await db
    .select()
    .from(props)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(props.edge))
    .limit(200);
  return c.json(rows);
});

// GET /api/props/top-edges?limit=
app.get('/top-edges', requireAuth, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10), 100);
  const rows = await db
    .select()
    .from(props)
    .orderBy(desc(props.edge))
    .limit(limit);
  return c.json(rows);
});

// GET /api/props/top-value?limit=
app.get('/top-value', requireAuth, async (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10), 100);
  const rows = await db
    .select()
    .from(props)
    .orderBy(desc(props.edge))
    .limit(limit * 5); // fetch more to score and filter
  const scored = rows
    .map((p) => ({ ...p, valueScore: computeValueScore(p as any) }))
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, limit);
  return c.json(scored);
});

// GET /api/props/stats
app.get('/stats', requireAuth, async (c) => {
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      avgEdge: sql<number>`avg(edge)`,
      avgConfidence: sql<number>`avg(confidence)`,
    })
    .from(props);
  return c.json(result[0] ?? { total: 0, avgEdge: 0, avgConfidence: 0 });
});

// POST /api/props/diversification-suggestions
app.post('/diversification-suggestions', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { sport, platform, count = 5 } = body;
  const conditions = [];
  if (sport) conditions.push(eq(props.sport, sport));
  if (platform) conditions.push(eq(props.platform, platform));
  const rows = await db
    .select()
    .from(props)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(props.edge))
    .limit(50);
  // Simple diversification: pick from different stat types
  const seen = new Set<string>();
  const diversified = [];
  for (const row of rows) {
    const key = `${row.statType}-${row.playerName}`;
    if (!seen.has(key) && diversified.length < count) {
      seen.add(key);
      diversified.push({ ...row, valueScore: computeValueScore(row as any) });
    }
  }
  return c.json(diversified);
});

export default app;
