# Screenshots — Placeholder Until Convex Live

## Status: PLACEHOLDER (Do NOT update yet)

These screenshots are from the demo/seeded mode. They are **NOT** live data screenshots.

## Rules (R15.6 Step 9)

1. **Do NOT run Playwright screenshot tour** until:
   - Convex is deployed and live
   - Database is seeded with real data
   - API keys are configured and tested

2. **Real screenshot proof must show:**
   - Dashboard with demo + live/hybrid badge
   - Data Sources page with provider status
   - Props Analyzer cards
   - Player Intel with media/headshot fallback
   - Results page
   - Model Lab
   - Mobile layout

3. **Current screenshots are placeholders:**
   - `02-dashboard.png` — demo mode
   - `03-props.png` — demo mode
   - `04-chat.png` — demo mode
   - `05-builder.png` — demo mode
   - `06-my-picks.png` — demo mode
   - `07-leaderboard.png` — demo mode
   - `08-settings.png` — demo mode
   - `r2-*.png` — older demo screenshots

## Next Steps

After Convex is live and seeded:
```bash
# 1. Start dev server
npm run dev

# 2. In another terminal, run screenshot tour
cd /tmp/PropEdgeAi
npx playwright install chromium  # if not installed
npm run screenshot  # or: npx tsx scripts/screenshot-tour.ts

# 3. Replace placeholder screenshots with real ones
# 4. Update this README
```

## DO NOT RUN YET — WAIT FOR CONVEX LIVE
