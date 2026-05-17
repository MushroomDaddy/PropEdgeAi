import { Hono } from 'hono';
import { db } from '../db/client.js';
import { modelPredictions, modelVersions } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, desc, sql } from 'drizzle-orm';

const app = new Hono();

// GET /api/model/learning-insights
app.get('/learning-insights', requireAuth, async (c) => {
  const [activeVersion] = await db
    .select()
    .from(modelVersions)
    .where(eq(modelVersions.isActive, true))
    .limit(1);

  const buckets = await db
    .select({
      edgeBucket: modelPredictions.edgeBucket,
      confidenceBucket: modelPredictions.confidenceBucket,
      total: sql<number>`count(*)::int`,
      hits: sql<number>`count(*) filter (where hit = true)::int`,
      accuracy: sql<number>`avg(case when hit then 1.0 else 0.0 end)`,
    })
    .from(modelPredictions)
    .groupBy(modelPredictions.edgeBucket, modelPredictions.confidenceBucket)
    .orderBy(desc(sql`count(*)`));

  return c.json({ activeVersion: activeVersion ?? null, buckets });
});

export default app;
