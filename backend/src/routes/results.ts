import { Hono } from 'hono'

const results = new Hono()

// GET / — list results
results.get('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST / — create a result
results.post('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

export default results
