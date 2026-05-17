import { Hono } from 'hono';
import { db } from '../db/client.js';
import { picks, entries, entriesPicks } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, desc, and, sql } from 'drizzle-orm';

const app = new Hono();

// GET /api/picks?status=
app.get('/', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const status = c.req.query('status');
  const conditions = [eq(picks.userId, userId)];
  if (status) conditions.push(eq(picks.status, status));
  const rows = await db
    .select()
    .from(picks)
    .where(and(...conditions))
    .orderBy(desc(picks.addedAt));
  return c.json(rows);
});

// POST /api/picks
app.post('/', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const body = await c.req.json();
  const [inserted] = await db
    .insert(picks)
    .values({
      userId,
      propId: body.propId ?? null,
      playerName: body.playerName,
      statType: body.statType,
      line: body.line,
      projection: body.projection,
      edge: body.edge,
      overUnder: body.overUnder,
      platform: body.platform,
      sport: body.sport,
      team: body.team ?? null,
      gameId: body.gameId ?? null,
      status: 'active',
      addedAt: Date.now(),
      sourceType: body.sourceType ?? 'manual',
    })
    .returning();
  return c.json(inserted, 201);
});

// DELETE /api/picks/:pickId
app.delete('/:pickId', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const pickId = c.req.param('pickId');
  const [deleted] = await db
    .delete(picks)
    .where(and(eq(picks.id, pickId), eq(picks.userId, userId)))
    .returning();
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

// GET /api/entries
app.get('/entries', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.createdAt));
  return c.json(rows);
});

// POST /api/entries
app.post('/entries', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const body = await c.req.json();
  const [inserted] = await db
    .insert(entries)
    .values({
      userId,
      platform: body.platform,
      entryType: body.entryType,
      status: 'active',
      payout: body.payout ?? null,
      stake: body.stake ?? null,
      createdAt: Date.now(),
    })
    .returning();
  // Insert join rows if pickIds provided
  const pickIds: string[] = body.pickIds ?? [];
  if (pickIds.length) {
    await db.insert(entriesPicks).values(
      pickIds.map((pickId) => ({ entryId: inserted.id, pickId }))
    );
  }
  return c.json(inserted, 201);
});

// GET /api/picks/stats
app.get('/stats', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status = 'active')::int`,
      won: sql<number>`count(*) filter (where status = 'won')::int`,
      lost: sql<number>`count(*) filter (where status = 'lost')::int`,
    })
    .from(picks)
    .where(eq(picks.userId, userId));
  return c.json(result[0] ?? { total: 0, active: 0, won: 0, lost: 0 });
});

// GET /api/picks/correlations
app.get('/correlations', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const rows = await db
    .select()
    .from(picks)
    .where(and(eq(picks.userId, userId), eq(picks.status, 'active')))
    .limit(50);
  // Simple correlation by same game / same stat type
  const correlations = rows.map((p) => ({
    pickId: p.id,
    playerName: p.playerName,
    statType: p.statType,
    correlated: rows
      .filter((q) => q.id !== p.id && (q.gameId === p.gameId || q.statType === p.statType))
      .map((q) => q.playerName),
  }));
  return c.json(correlations);
});

// GET /api/picks/quick-pack?sport=&platform=&count=
app.get('/quick-pack', requireAuth, async (c) => {
  // Returns suggested picks — delegated to the props top-value logic
  return c.json({ message: 'Use /api/props/top-value for quick-pack suggestions' });
});

export default app;
