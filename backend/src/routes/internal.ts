import { Hono } from 'hono'

const internal = new Hono()

// GET /smoke-test — basic smoke test for internal health checks
internal.get('/smoke-test', (c) => {
  return c.json({ ok: true, checks: [] })
})

export default internal
