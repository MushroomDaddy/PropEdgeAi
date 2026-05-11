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

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Fill in your Convex deployment URL and project secret

# Deploy Convex functions
bunx convex deploy

# Seed demo data
bunx convex run seed:clearAndReseed
bunx convex run seedR5:seedGameDetails

# Run validation tests
bunx convex run tests:runAll

# Start dev server
bun run dev
```

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
