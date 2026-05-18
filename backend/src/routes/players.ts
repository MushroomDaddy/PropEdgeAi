import { Hono } from 'hono';
import { db } from '../db/client.js';
import { players, propSnapshots, props, playerGameLogs } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, ilike, desc, sql } from 'drizzle-orm';

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

  // Fetch current props for this player
  const currentProps = await db
    .select()
    .from(props)
    .where(eq(props.playerId, player.id))
    .orderBy(desc(props.createdAt))
    .limit(20);

  // Compute last-10-game averages if game logs exist
  const gameLogs = await db
    .select()
    .from(playerGameLogs)
    .where(eq(playerGameLogs.playerId, player.id))
    .orderBy(desc(playerGameLogs.gameDate))
    .limit(10);

  let last10Avg: Record<string, number | null> = {};
  if (gameLogs.length > 0) {
    const avg = (field: (keyof typeof gameLogs[0])) => {
      const vals = gameLogs.map((g) => g[field]).filter((v): v is number => v != null);
      return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };
    last10Avg = {
      points: avg('points'),
      rebounds: avg('rebounds'),
      assists: avg('assists'),
      steals: avg('steals'),
      blocks: avg('blocks'),
      threePointers: avg('threePointers'),
      minutes: avg('minutes'),
    };
  }

  return c.json({ player, currentProps, last10Avg });
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
