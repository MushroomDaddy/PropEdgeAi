import { createClient } from '@supabase/supabase-js'
import type { MiddlewareHandler } from 'hono'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const isDev = process.env.NODE_ENV === 'development'

let supabaseAdmin: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
} else if (!isDev) {
  console.warn('[auth] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — auth will reject all requests')
}

export interface AuthContext {
  userId: string
  email?: string
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
  }
}

/**
 * requireAuth — Validates Bearer token via Supabase Auth.
 *
 * In development mode (NODE_ENV=development), if no token is provided
 * the request passes through with a placeholder auth context so the
 * frontend preview works without login.
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  // If we have a token AND supabase is configured, validate it
  if (token && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    c.set('auth', {
      userId: data.user.id,
      email: data.user.email,
    })
    return await next()
  }

  // Dev mode bypass — allow requests without token for local preview
  if (isDev && !token) {
    c.set('auth', { userId: 'dev-preview', email: 'dev@localhost' })
    return await next()
  }

  // Production with no token → reject
  if (!token) {
    return c.json({ error: 'Unauthorized — Bearer token required' }, 401)
  }

  // Token present but Supabase not configured → reject
  if (!supabaseAdmin) {
    return c.json({ error: 'Auth service not configured' }, 503)
  }

  return c.json({ error: 'Unauthorized' }, 401)
}
