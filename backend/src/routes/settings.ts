import { Hono } from 'hono';
import { db } from '../db/client.js';
import { userSettings } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/settings
app.get('/', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const [row] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  if (!row) {
    // Return sensible defaults if no settings yet
    return c.json({
      favoriteSports: [],
      favoritePlatforms: [],
      riskTolerance: 'medium',
      darkMode: true,
      notifications: true,
      defaultBankroll: null,
    });
  }
  return c.json(row);
});

// PUT /api/settings
app.put('/', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const body = await c.req.json();
  const [existing] = await db
    .select({ id: userSettings.id })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  if (existing) {
    const [updated] = await db
      .update(userSettings)
      .set({
        favoriteSports: body.favoriteSports ?? [],
        favoritePlatforms: body.favoritePlatforms ?? [],
        riskTolerance: body.riskTolerance ?? 'medium',
        darkMode: body.darkMode ?? true,
        notifications: body.notifications ?? true,
        defaultBankroll: (body.defaultBankroll ?? null) as number | null,
      })
      .where(eq(userSettings.userId, userId))
      .returning();
    return c.json(updated);
  }
  const [inserted] = await db
    .insert(userSettings)
    .values({
      userId,
      favoriteSports: body.favoriteSports ?? [],
      favoritePlatforms: body.favoritePlatforms ?? [],
      riskTolerance: body.riskTolerance ?? 'medium',
      darkMode: body.darkMode ?? true,
      notifications: body.notifications ?? true,
      defaultBankroll: (body.defaultBankroll ?? null) as number | null,
    })
    .returning();
  return c.json(inserted);
});

export default app;
