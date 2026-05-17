# PropEdge AI — Monorepo

This repo is organized as an npm workspace monorepo, migrated from Convex to a self-hosted Postgres/Hono backend.

## Structure

```
PropEdgeAi/
  frontend/     # Vite + React app (previously the repo root)
  backend/      # Hono API server with Drizzle ORM (new)
  db/           # Drizzle schema and migrations (new)
```

## Packages

### frontend/
The original React + Vite frontend. Communicates with the backend API via fetch calls.

- Framework: React + Vite
- Auth: Supabase
- Styling: Tailwind + shadcn/ui

### backend/
New Hono-based REST API server running on Node.js.

- Runtime: Node.js (ESM)
- Framework: Hono + @hono/node-server
- ORM: Drizzle ORM
- Database: Postgres (via Supabase)
- Auth: Supabase JWT verification

Start dev server:
```
cd backend && npm run dev
```

Routes:
- GET /health
- /api/props
- /api/games
- /api/picks
- /api/users
- /api/providers
- /api/model
- /api/results
- /internal/smoke-test

### db/
Shared Drizzle schema and migration config. The schema.ts file defines all Postgres tables.

Run migrations:
```
cd db && npx drizzle-kit generate
npx drizzle-kit migrate
```

## Getting Started

1. Copy .env.example to .env and fill in values
2. Install dependencies: `npm install` (from repo root)
3. Run backend: `npm run dev:backend`
4. Run frontend: `npm run dev:frontend`

## Environment Variables

See `.env.example` at the repo root for required variables. Each package also has its own `.env.example`.
