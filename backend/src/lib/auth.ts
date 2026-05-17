import { createMiddleware } from 'hono/factory'
import { verifyToken } from '@clerk/backend'

export type AuthVariables = {
  userId: string
}

/**
 * Clerk JWT middleware for Hono.
 * Reads the Authorization: Bearer <token> header, verifies the JWT,
 * and adds userId to the Hono context.
 *
 * Usage: app.use('/protected/*', clerkAuth())
 */
export const clerkAuth = () =>
  createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.slice(7)

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      })
      c.set('userId', payload.sub)
      await next()
    } catch (err) {
      return c.json({ error: 'Invalid or expired token' }, 401)
    }
  })
