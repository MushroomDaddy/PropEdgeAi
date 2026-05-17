import { Hono } from 'hono';
import { db } from '../db/client.js';
import { bankroll, bankrollTransactions } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, and, desc } from 'drizzle-orm';

const app = new Hono();

// GET /api/bankroll
app.get('/', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const platform = c.req.query('platform');
  const conditions = [eq(bankroll.userId, userId)];
  if (platform) conditions.push(eq(bankroll.platform, platform));
  const rows = await db
    .select()
    .from(bankroll)
    .where(and(...conditions));
  return c.json(rows);
});

// GET /api/bankroll/transactions
app.get('/transactions', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const platform = c.req.query('platform');
  const conditions = [eq(bankrollTransactions.userId, userId)];
  if (platform) conditions.push(eq(bankrollTransactions.platform, platform));
  const rows = await db
    .select()
    .from(bankrollTransactions)
    .where(and(...conditions))
    .orderBy(desc(bankrollTransactions.timestamp))
    .limit(200);
  return c.json(rows);
});

// GET /api/bankroll/summary
app.get('/summary', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const rows = await db
    .select()
    .from(bankroll)
    .where(eq(bankroll.userId, userId));
  const total = {
    currentBalance: rows.reduce((s, r) => s + r.currentBalance, 0),
    totalWagered: rows.reduce((s, r) => s + r.totalWagered, 0),
    totalWon: rows.reduce((s, r) => s + r.totalWon, 0),
    totalLost: rows.reduce((s, r) => s + r.totalLost, 0),
    roi: rows.length ? rows.reduce((s, r) => s + r.roi, 0) / rows.length : 0,
    winRate: rows.length ? rows.reduce((s, r) => s + r.winRate, 0) / rows.length : 0,
    platforms: rows,
  };
  return c.json(total);
});

export default app;
