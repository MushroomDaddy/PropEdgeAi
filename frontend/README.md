# PropEdge AI — Frontend

The React + Vite frontend for PropEdge AI. Communicates with the Hono backend API via fetch calls.

## Prerequisites

- Node.js 20+
- npm

## Setup

1. Copy `.env.example` to `.env.local` and fill in values
2. `npm install`
3. `npm run dev`

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_API_URL` | Backend API URL (default: http://localhost:3001) |

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run lint` — ESLint check

## Architecture

- **Auth:** Supabase (email/password)
- **Backend:** Hono REST API (see `backend/`)
- **State:** TanStack Query for API data
- **Styling:** Tailwind CSS + shadcn/ui components
