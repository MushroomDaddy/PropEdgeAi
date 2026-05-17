import { Hono } from 'hono';
import { db } from '../db/client.js';
import { games } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, gt, and, asc } from 'drizzle-orm';

const app = new Hono();

// GET /api/games?sport=
app.get('/', requireAuth, async (c) => {
  const sport = c.req.query('sport');
  const rows = await db
    .select()
    .from(games)
    .where(sport ? eq(games.sport, sport) : undefined)
    .orderBy(asc(games.gameTime))
    .limit(100);
  return c.json(rows);
});

// GET /api/games/upcoming
app.get('/upcoming', requireAuth, async (c) => {
  const sport = c.req.query('sport');
  const now = Date.now();
  const conditions = [gt(games.gameTime, now), eq(games.status, 'upcoming')];
  if (sport) conditions.push(eq(games.sport, sport));
  const rows = await db
    .select()
    .from(games)
    .where(and(...conditions))
    .orderBy(asc(games.gameTime))
    .limit(50);
  return c.json(rows);
});

// GET /api/games/live
app.get('/live', requireAuth, async (c) => {
  const rows = await db
    .select()
    .from(games)
    .where(eq(games.status, 'live'))
    .orderBy(asc(games.gameTime))
    .limit(20);
  return c.json(rows);
});

// GET /api/games/:gameId
app.get('/:gameId', requireAuth, async (c) => {
  const gameId = c.req.param('gameId');
  const [row] = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

export default app;
