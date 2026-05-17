import { Hono } from 'hono';
import { db } from '../db/client.js';
import { leaderboard } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { asc } from 'drizzle-orm';

const app = new Hono();

// GET /api/leaderboard
app.get('/', requireAuth, async (c) => {
  const rows = await db
    .select()
    .from(leaderboard)
    .orderBy(asc(leaderboard.rank))
    .limit(100);
  return c.json(rows);
});

export default app;
