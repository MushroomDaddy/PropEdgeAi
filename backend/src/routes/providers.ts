import { Hono } from 'hono'

const providers = new Hono()

// GET /status — get status of all providers
providers.get('/status', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// GET /:name/status — get status of a specific provider
providers.get('/:name/status', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// PATCH /:name/status — update status of a specific provider
providers.patch('/:name/status', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

export default providers
