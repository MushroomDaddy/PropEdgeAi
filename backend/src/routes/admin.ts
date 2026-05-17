import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { db } from '../db/client.js';
import { providerConfig } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

// All admin routes require auth + admin check
app.use('/*', requireAuth, adminOnly);

// POST /api/admin/sync/full
app.post('/sync/full', async (c) => {
  // Trigger all sync workers (in production these are Railway cron jobs)
  // Here we just acknowledge and let Railway crons handle it
  return c.json({ status: 'queued', message: 'Full sync queued — cron workers will execute' });
});

// POST /api/admin/sync/games
app.post('/sync/games', async (c) => {
  return c.json({ status: 'queued', message: 'Games sync queued' });
});

// POST /api/admin/sync/odds
app.post('/sync/odds', async (c) => {
  return c.json({ status: 'queued', message: 'Odds sync queued' });
});

// POST /api/admin/sync/props
app.post('/sync/props', async (c) => {
  return c.json({ status: 'queued', message: 'Props sync queued' });
});

// POST /api/admin/sync/api-sports/full
app.post('/sync/api-sports/full', async (c) => {
  return c.json({ status: 'queued', message: 'API-Sports full sync queued' });
});

// POST /api/admin/sync/api-sports/teams
app.post('/sync/api-sports/teams', async (c) => {
  return c.json({ status: 'queued', message: 'API-Sports teams sync queued' });
});

// POST /api/admin/sync/api-sports/games
app.post('/sync/api-sports/games', async (c) => {
  return c.json({ status: 'queued', message: 'API-Sports games sync queued' });
});

// POST /api/admin/sync/api-sports/standings
app.post('/sync/api-sports/standings', async (c) => {
  return c.json({ status: 'queued', message: 'API-Sports standings sync queued' });
});

// POST /api/admin/sync/api-sports/live-scores
app.post('/sync/api-sports/live-scores', async (c) => {
  return c.json({ status: 'queued', message: 'API-Sports live scores sync queued' });
});

// POST /api/admin/sync/api-sports/injuries
app.post('/sync/api-sports/injuries', async (c) => {
  return c.json({ status: 'queued', message: 'API-Sports injuries sync queued' });
});

// GET /api/admin/providers — list all provider configs for admin
app.get('/providers', async (c) => {
  const rows = await db.select().from(providerConfig);
  return c.json(rows);
});

// PUT /api/admin/providers/:provider — update provider config
app.put('/providers/:provider', async (c) => {
  const provider = c.req.param('provider');
  const body = await c.req.json();
  const [updated] = await db
    .update(providerConfig)
    .set({ enabled: body.enabled, updatedAt: Date.now() })
    .where(eq(providerConfig.provider, provider))
    .returning();
  if (!updated) return c.json({ error: 'Provider not found' }, 404);
  return c.json(updated);
});

export default app;
