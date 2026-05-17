import { createClient } from '@supabase/supabase-js'
import type { MiddlewareHandler } from 'hono'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    c.set('auth', {
      userId: user.id,
      email: user.email ?? undefined,
    })
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}
