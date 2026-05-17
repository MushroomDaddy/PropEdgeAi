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
      pending: sql<number>`count(*) filter (where result_status = 'pending')::int`,
      avgRoi: sql<number>`avg(roi)`,
      avgClv: sql<number>`avg(clv)`,
    })
    .from(pickResults)
    .where(eq(pickResults.userId, userId));
  return c.json(result[0] ?? {});
});

// GET /api/results/model-performance
app.get('/model-performance', requireAuth, async (c) => {
  const result = await db
    .select({
      confidenceBucket: modelPredictions.confidenceBucket,
      total: sql<number>`count(*)::int`,
      hits: sql<number>`count(*) filter (where hit = true)::int`,
      hitRate: sql<number>`avg(case when hit then 1.0 else 0.0 end)`,
    })
    .from(modelPredictions)
    .groupBy(modelPredictions.confidenceBucket);
  return c.json(result);
});

export default app;
