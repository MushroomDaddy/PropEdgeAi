import { Hono } from 'hono'

const props = new Hono()

// GET / — list props with optional filters
props.get('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// GET /:id — get a single prop
props.get('/:id', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST / — create a prop
props.post('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// PATCH /:id/analysis — update analysis on a prop
props.patch('/:id/analysis', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// DELETE /:id — delete a prop
props.delete('/:id', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST /batch — batch create/upsert props
props.post('/batch', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST /:id/result — record the result of a prop
props.post('/:id/result', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

export default props
