import { Hono } from 'hono';
import { db } from '../db/client.js';
import { providerConfig } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const app = new Hono();

// GET /api/providers/status
app.get('/status', requireAuth, async (c) => {
  const rows = await db.select().from(providerConfig);
  return c.json(rows);
});

export default app;
