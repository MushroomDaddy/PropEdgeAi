import { Hono } from 'hono';
import { db } from '../db/client.js';
import { importJobs, picks } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();

// GET /api/imports
app.get('/', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const rows = await db
    .select()
    .from(importJobs)
    .where(eq(importJobs.userId, userId))
    .orderBy(desc(importJobs.createdAt))
    .limit(50);
  return c.json(rows);
});

// POST /api/imports/manual - manual single slip entry
app.post('/manual', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const body = await c.req.json();
  const now = Date.now();

  // Create import job
  const [job] = await db
    .insert(importJobs)
    .values({
      userId,
      importSource: 'manual',
      status: 'processing',
      totalPicks: 1,
      successfulPicks: 0,
      failedPicks: 0,
      errors: [],
      createdAt: now,
    })
    .returning();

  try {
    const [pick] = await db
      .insert(picks)
      .values({
        userId,
        playerName: body.playerName,
        statType: body.statType,
        line: body.line,
        projection: body.projection ?? body.line,
        edge: body.edge ?? 0,
        overUnder: body.overUnder ?? 'over',
        platform: body.platform,
        sport: body.sport,
        team: body.team ?? null,
        status: 'active',
        addedAt: now,
        sourceType: 'manual',
        importJobId: job.id,
        originalImportedLine: body.line,
        originalImportedPlatform: body.platform,
        originalImportedPlayer: body.playerName,
        originalImportedStatType: body.statType,
        originalImportedDirection: body.overUnder ?? 'over',
        originalImportedSport: body.sport,
        originalImportedOdds: body.odds ?? null,
        originalImportedStake: body.stake ?? null,
      })
      .returning();

    await db
      .update(importJobs)
      .set({ status: 'completed', successfulPicks: 1, completedAt: Date.now() })
      .where(eq(importJobs.id, job.id));

    return c.json({ job, pick }, 201);
  } catch (err: any) {
    await db
      .update(importJobs)
      .set({ status: 'failed', failedPicks: 1, errors: [err.message], completedAt: Date.now() })
      .where(eq(importJobs.id, job.id));
    return c.json({ error: 'Import failed', details: err.message }, 500);
  }
});

// POST /api/imports/csv - bulk CSV import
app.post('/csv', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const body = await c.req.json();
  const rows: any[] = body.rows ?? [];
  const now = Date.now();

  const [job] = await db
    .insert(importJobs)
    .values({
      userId,
      importSource: 'csv',
      status: 'processing',
      totalPicks: rows.length,
      successfulPicks: 0,
      failedPicks: 0,
      errors: [],
      createdAt: now,
    })
    .returning();

  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      await db.insert(picks).values({
        userId,
        playerName: row.playerName,
        statType: row.statType,
        line: row.line,
        projection: row.projection ?? row.line,
        edge: row.edge ?? 0,
        overUnder: row.overUnder ?? 'over',
        platform: row.platform,
        sport: row.sport,
        status: 'active',
        addedAt: now,
        sourceType: 'csv',
        importJobId: job.id,
      });
      successful++;
    } catch (err: any) {
      failed++;
      errors.push(`Row ${successful + failed}: ${err.message}`);
    }
  }

  await db
    .update(importJobs)
    .set({ status: 'completed', successfulPicks: successful, failedPicks: failed, errors, completedAt: Date.now() })
    .where(eq(importJobs.id, job.id));

  return c.json({ job: { ...job, successfulPicks: successful, failedPicks: failed, errors } }, 201);
});

export default app;
