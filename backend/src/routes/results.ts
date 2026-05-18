import { Hono } from 'hono';
import { db } from '../db/client.js';
import { pickResults, modelPredictions } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, and, sql } from 'drizzle-orm';

const app = new Hono();

// GET /api/results?sport=&platform=&status=
app.get('/', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const sport = c.req.query('sport');
  const platform = c.req.query('platform');
  const status = c.req.query('status');
  const conditions = [eq(pickResults.userId, userId)];
  if (sport) conditions.push(eq(pickResults.sport, sport));
  if (platform) conditions.push(eq(pickResults.platform, platform));
  if (status) conditions.push(eq(pickResults.resultStatus, status));
  const rows = await db
    .select()
    .from(pickResults)
    .where(and(...conditions))
    .orderBy(pickResults.pickedAt)
    .limit(200);
  return c.json(rows);
});

// GET /api/results/summary
app.get('/summary', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      won: sql<number>`count(*) filter (where result_status = 'won')::int`,
      lost: sql<number>`count(*) filter (where result_status = 'lost')::int`,
      push: sql<number>`count(*) filter (where result_status = 'push')::int`,
      voided: sql<number>`count(*) filter (where result_status = 'void')::int`,
      pending: sql<number>`count(*) filter (where result_status = 'pending')::int`,
      avgEdge: sql<number>`coalesce(round(avg(pick_edge)::numeric, 1), 0)`,
      avgCLV: sql<number>`coalesce(round(avg(clv)::numeric, 2), 0)`,
      avgRoi: sql<number>`coalesce(round(avg(roi)::numeric, 2), 0)`,
    })
    .from(pickResults)
    .where(eq(pickResults.userId, userId));
  const row = result[0] ?? { total: 0, won: 0, lost: 0, push: 0, voided: 0, pending: 0, avgEdge: 0, avgCLV: 0, avgRoi: 0 };
  const graded = (row.won ?? 0) + (row.lost ?? 0);
  const winRate = graded > 0 ? Math.round(((row.won ?? 0) / graded) * 1000) / 10 : 0;
  return c.json({ ...row, winRate });
});

// GET /api/results/model-performance
app.get('/model-performance', requireAuth, async (c) => {
  const buckets = await db
    .select({
      confidenceBucket: modelPredictions.confidenceBucket,
      total: sql<number>`count(*)::int`,
      hits: sql<number>`count(*) filter (where hit = true)::int`,
      hitRate: sql<number>`avg(case when hit then 1.0 else 0.0 end)`,
    })
    .from(modelPredictions)
    .groupBy(modelPredictions.confidenceBucket);

  // Compute aggregate stats for the frontend
  const totalPredictions = buckets.reduce((sum, b) => sum + (b.total ?? 0), 0);
  const totalHits = buckets.reduce((sum, b) => sum + (b.hits ?? 0), 0);
  const overallHitRate = totalPredictions > 0
    ? Math.round((totalHits / totalPredictions) * 1000) / 10
    : 0;

  return c.json({ overallHitRate, totalPredictions, buckets });
});

export default app;
