import { Hono } from 'hono'

const games = new Hono()

// GET / — list games
games.get('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// GET /:id — get a single game
games.get('/:id', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST / — create a game
games.post('/', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// PATCH /:id — update a game
games.patch('/:id', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

// POST /batch — batch create/upsert games
games.post('/batch', (c) => {
  return c.json({ error: 'Not Implemented' }, 501)
})

export default games
