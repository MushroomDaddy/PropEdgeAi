import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

import propsRoutes from './routes/props.js'
import gamesRoutes from './routes/games.js'
import picksRoutes from './routes/picks.js'
import usersRoutes from './routes/users.js'
import providersRoutes from './routes/providers.js'
import modelRoutes from './routes/model.js'
import resultsRoutes from './routes/results.js'
import internalRoutes from './routes/internal.js'

const app = new Hono()

app.use('*', logger())

// Health check
app.get('/health', (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString() })
})

// API routes
app.route('/api/props', propsRoutes)
app.route('/api/games', gamesRoutes)
app.route('/api/picks', picksRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/providers', providersRoutes)
app.route('/api/model', modelRoutes)
app.route('/api/results', resultsRoutes)

// Internal routes
app.route('/internal', internalRoutes)

const port = Number(process.env.PORT) || 3001

console.log(`PropEdge backend starting on port ${port}`)

serve({ fetch: app.fetch, port })

export default app
