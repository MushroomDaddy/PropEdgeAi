# PropEdge AI

A smart sports analyst and pick optimizer for daily fantasy pick'em platforms (PrizePicks, Underdog, Sleeper, DraftKings Pick6) and prediction markets (Kalshi).

## Features

- **Multi-Sport Dashboard** — NBA, NFL, MLB, NHL with live game ticker and Today's Best Edges
- **Prop Analyzer** — Deep statistical analysis with Value Score, Edge (Model Prob − Market Implied), Monte Carlo simulations, bust risk, and hit rate history
- **AI Analyst Chat** — Natural language queries with step-by-step statistical reasoning and 12+ presets
- **Pick Builder & Optimizer** — Smart correlation detection, diversification scoring, platform-specific entry building, one-click export
- **Bankroll Tracker** — Track wagers, P&L, ROI, and win rate over time
- **Game Detail View** — Play-by-play, box scores, and player stats for live games
- **Leaderboard** — Compare performance across users

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Convex (serverless database, real-time sync, server functions)
- **Auth:** Convex Auth with password-based accounts

## Getting Started

### Prerequisites
- Node.js 18+ (npm replaces bun in R15.6)
- Convex account (free tier OK) → https://convex.dev

### Install & Build
```bash
# Install dependencies (npm ci requires package-lock.json)
npm ci

# Type-check frontend
npx tsc -p tsconfig.app.json --noEmit

# Type-check Convex functions (requires generated types, see below)
npx tsc -p convex/tsconfig.json --noEmit

# Build frontend
npm run build
```

### Go-Live: Convex Setup
```bash
# 1. Login to Convex (first time only)
npx convex login

# 2. Initialize / link project (first time only)
npx convex init

# 3. Start Convex dev server (generates types, watches functions)
npx convex dev

# 4. In another terminal, generate Convex types
npx convex codegen

# 5. After codegen, rerun type checks / build
npx tsc -p tsconfig.app.json --noEmit
npx tsc -p convex/tsconfig.json --noEmit
npm run build
```

See [CONVEX_TYPES.md](./CONVEX_TYPES.md) for details on generated types status.

### Environment Variables
```bash
# Copy example env (frontend only needs VITE_CONVEX_URL)
cp .env.example .env.local
# Edit .env.local and set VITE_CONVEX_URL from Convex dashboard

# Server-side keys (THE_ODDS_API_KEY, API_SPORTS_KEY, etc.)
# Set these in: Convex Dashboard → Settings → Environment Variables
# NEVER prefix server keys with VITE_ (they'd leak to the browser)
```

### Seed Demo Data
```bash
npx convex run seed:clearAndReseed
npx convex run seedR5:seedGameDetails
```

### Run Validation Tests
```bash
npx convex run tests:runAll
```

### Start Dev Server
```bash
npm run dev
```

> **Note on Generated Types:**  
> Convex generates `convex/_generated/api.d.ts` after running `npx convex codegen`.  
> Currently, the generated API includes `api.adminSync.*` and `api.apiSportsSync.*`.  
> `api.goLiveSmokeTest.*` and `api.theSportsDbSync.*` will be added in upcoming steps (R15.6 Step 5).  
> Do not claim types are complete until these are present.

## Data

All data currently uses **demo projections** (not real-time). Each prop includes `dataSource`, `lastUpdated`, and `provider` fields to distinguish demo from live data when real APIs are connected.

### Edge Formula

```
edge = modelProbability − marketImpliedProbability
```

Projection difference (raw stat gap) is shown separately as `projectionDiff`.

### Value Score (0-100)

```
Edge Score (0-40):    min(40, |edge| × 2.5)
Consensus (0-25):     agreeing sources / total sources × 25
Hit Rate (0-20):      historicalHitRate / 100 × 20
Bust Risk (0-15):     (100 − bustRisk) / 100 × 15
```

## Validation Tests

Run `bunx convex run tests:runAll` — verifies implied probability, expected value, value score, bust risk, ROI, correlation detection, Kalshi pricing, edge formula, and authorization logic.

## License

Private — all rights reserved.
