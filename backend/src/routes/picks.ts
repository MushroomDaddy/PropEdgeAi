import { Hono } from 'hono'

const picks = new Hono()

// GET / — list picks
picks.get('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// GET /:id — get a single pick
picks.get('/:id', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST / — create a pick
picks.post('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// PATCH /:id/result — update the result of a pick
picks.patch('/:id/result', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// DELETE /:id — delete a pick
picks.delete('/:id', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// GET /stats — get pick statistics
picks.get('/stats', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

export default picks
