import { Hono } from 'hono'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { requireAuth } from '../middleware/auth.js'
import { adminOnly } from '../middleware/adminOnly'

const usersRouter = new Hono()

// All user routes require auth
usersRouter.use('/*', requireAuth)

// GET /me — get current user profile
usersRouter.get('/me', async (c) => {
  const auth = c.get('auth') as { userId: string; email?: string }
  const result = await db
    .select()
    .from(users)
    .where(eq(users.authId, auth.userId))
    .limit(1)

  const user = result[0]
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user, 200)
})

// PATCH /me — update current user profile
const updateProfileSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
})

usersRouter.patch('/me', async (c) => {
  const auth = c.get('auth') as { userId: string; email?: string }
  const body = await c.req.json()

  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid update data', details: parsed.error.flatten() }, 400)
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (parsed.data.username !== undefined) updateData.username = parsed.data.username
  if (parsed.data.displayName !== undefined) updateData.displayName = parsed.data.displayName
  if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.authId, auth.userId))
    .returning()

  const updated = result[0]
  if (!updated) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(updated, 200)
})

// POST /upsert — create or update user on first login
const upsertSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
})

usersRouter.post('/upsert', async (c) => {
  const auth = c.get('auth') as { userId: string; email?: string }

  const body = await c.req.json()
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid data', details: parsed.error.flatten() }, 400)
  }

  // Check if user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.authId, auth.userId))
    .limit(1)
    .then(r => r[0])

  if (existing) {
    const updateData: Record<string, unknown> = {
      email: parsed.data.email,
      updatedAt: new Date(),
    }
    if (parsed.data.username !== undefined) updateData.username = parsed.data.username
    if (parsed.data.displayName !== undefined) updateData.displayName = parsed.data.displayName

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.authId, auth.userId))
      .returning()

    return c.json(result[0], 200)
  }

  // Create new user profile
  const createData: Record<string, unknown> = {
    authId: auth.userId,
    email: parsed.data.email,
    username: parsed.data.username ?? parsed.data.email.split('@')[0],
    displayName: parsed.data.displayName ?? parsed.data.email.split('@')[0],
    role: 'user',
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
  }

  const result = await db.insert(users).values(createData as any).returning()
  return c.json(result[0], 201)
})

// GET /me/subscription — get subscription status
usersRouter.get('/me/subscription', async (c) => {
  const auth = c.get('auth') as { userId: string; email?: string }
  const result = await db
    .select({
      subscriptionTier: users.subscriptionTier,
      subscriptionStatus: users.subscriptionStatus,
      email: users.email,
    })
    .from(users)
    .where(eq(users.authId, auth.userId))
    .limit(1)

  const user = result[0]
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user, 200)
})

// PATCH /admin/:id — admin update any user by id
const adminUpdateSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  subscriptionTier: z.string().optional(),
  subscriptionStatus: z.string().optional(),
  username: z.string().min(2).max(50).optional(),
  displayName: z.string().min(1).max(100).optional(),
})

usersRouter.patch('/admin/:id', adminOnly, async (c) => {
  const userUuid = c.req.param('id')
  const body = await c.req.json()

  const parsed = adminUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid update data', details: parsed.error.flatten() }, 400)
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role
  if (parsed.data.subscriptionTier !== undefined) updateData.subscriptionTier = parsed.data.subscriptionTier
  if (parsed.data.subscriptionStatus !== undefined) updateData.subscriptionStatus = parsed.data.subscriptionStatus
  if (parsed.data.username !== undefined) updateData.username = parsed.data.username
  if (parsed.data.displayName !== undefined) updateData.displayName = parsed.data.displayName

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userUuid))
    .returning()

  const updated = result[0]
  if (!updated) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(updated, 200)
})

export default usersRouter
