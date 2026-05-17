import type { MiddlewareHandler } from 'hono'
import { verifyToken } from '@clerk/backend'

export interface AuthContext {
  userId: string
  email?: string
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
  }
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401)
  }
  const token = authHeader.slice(7)
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    })
    c.set('auth', { userId: payload.sub })
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}
