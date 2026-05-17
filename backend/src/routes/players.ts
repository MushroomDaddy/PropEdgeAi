import { Hono } from 'hono';
import { db } from '../db/client.js';
import { players, propSnapshots, props } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, ilike, desc } from 'drizzle-orm';

const app = new Hono();

// GET /api/players/search?q=
app.get('/search', requireAuth, async (c) => {
  const q = c.req.query('q') ?? '';
  if (!q.trim()) return c.json([]);
  const rows = await db
    .select()
    .from(players)
    .where(ilike(players.name, `%${q}%`))
    .limit(20);
  return c.json(rows);
});

// GET /api/players/:id/profile
app.get('/:id/profile', requireAuth, async (c) => {
  const id = c.req.param('id');
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.id, id))
    .limit(1);
  if (!player) return c.json({ error: 'Not found' }, 404);
  return c.json(player);
});

// GET /api/props/:propId/line-movement
app.get('/props/:propId/line-movement', requireAuth, async (c) => {
  const propId = c.req.param('propId');
  const snapshots = await db
    .select()
    .from(propSnapshots)
    .where(eq(propSnapshots.propId, propId))
    .orderBy(desc(propSnapshots.timestamp))
    .limit(50);
  return c.json(snapshots);
});

export default app;
