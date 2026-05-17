import { Hono } from 'hono'

const users = new Hono()

// GET /me — get current user profile
users.get('/me', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// PATCH /me — update current user profile
users.patch('/me', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST /upsert — upsert user (used by Clerk webhook or login hook)
users.post('/upsert', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// GET /me/subscription — get subscription status for current user
users.get('/me/subscription', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// PATCH /admin/:id — admin update a user by id
users.patch('/admin/:id', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

export default users
