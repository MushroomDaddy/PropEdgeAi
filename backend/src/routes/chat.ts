import { Hono } from 'hono';
import { db } from '../db/client.js';
import { chatMessages } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, asc } from 'drizzle-orm';

const app = new Hono();

const VIKTOR_URL = process.env.VIKTOR_URL ?? 'https://getviktor.com/api';
const VIKTOR_PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET ?? '';

// GET /api/chat/messages
app.get('/messages', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(asc(chatMessages.timestamp))
    .limit(100);
  return c.json(rows);
});

// POST /api/chat/ask
app.post('/ask', requireAuth, async (c) => {
  const { userId } = c.get('auth');
  const body = await c.req.json();
  const userMessage: string = body.message ?? '';
  if (!userMessage.trim()) return c.json({ error: 'message required' }, 400);

  // Save user message
  const now = Date.now();
  await db.insert(chatMessages).values({
    userId,
    role: 'user',
    content: userMessage,
    timestamp: now,
  });

  // Proxy to Viktor gateway
  let assistantContent = '';
  try {
    const resp = await fetch(VIKTOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VIKTOR_PROJECT_SECRET}`,
      },
      body: JSON.stringify({ message: userMessage, userId }),
    });
    const data = await resp.json() as any;
    assistantContent = data.response ?? data.message ?? 'No response';
  } catch (err) {
    assistantContent = 'Viktor is unavailable right now.';
  }

  // Save assistant response
  await db.insert(chatMessages).values({
    userId,
    role: 'assistant',
    content: assistantContent,
    timestamp: Date.now(),
  });

  return c.json({ response: assistantContent });
});

export default app;
