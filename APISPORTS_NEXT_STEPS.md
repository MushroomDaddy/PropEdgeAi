# R15.6 Step 6: API-SPORTS Honesty — Next Implementation Plan

## Current Status (from code review)

### Implemented (via API-SPORTS)
- ✅ Teams (syncTeams)
- ✅ Games (syncGames)
- ✅ Standings (syncStandings)
- ✅ Injuries (syncInjuries)
- ✅ Live Scores (syncLiveScores)

### Not Implemented (Coming Soon)
- ❌ NBA Players (getPlayers exists but unused in apiSportsSync.ts)
- ❌ NBA Player Stats (storeApiSportsPlayerStats defined but not wired)
- ❌ NBA Team Stats
- ❌ NFL Injuries (different sport, needs testing)

## UI Labeling Status
- "Coming Soon" labels present in UI (DataSourcesPage.tsx:279)
- Need to audit buttons for NBA Players, Player Stats, Team Stats, Injuries
- Disable buttons or show "Coming Soon" badges where endpoints return not_implemented

## Next Implementation Priority (from checklist)

### A. NBA Players
- Wire up `getPlayers` from `convex/lib/apiSports/index.ts`
- Create `syncPlayers` action in `convex/apiSportsSync.ts`
- Cache results in `apiSportsCache`
- Log usage to `providerUsageLog`
- Update `providerConfig`

### B. NBA Player Stats / Game Logs
- Wire up `getPlayerStats` from `convex/lib/apiSports/index.ts`
- Use `storeApiSportsPlayerStats` (already defined)
- Cache results in `apiSportsCache`
- Log usage to `providerUsageLog`

### C. NBA Team Stats
- Implement `getTeamStats` in API-SPORTS provider
- Create `syncTeamStats` action
- Cache results in `apiSportsCache`

### D. NFL Injuries
- Test existing `syncInjuries` with sport="NFL"
- Verify API-SPORTS endpoint works for NFL
- Update UI to show NFL Injuries as available

### E. MLB/NHL Equivalents
- Extend sync actions to support MLB, NHL
- Update `supportedSports` in providers
- Test with API-SPORTS endpoints

## Requirements for Each Implementation
1. Use API-SPORTS official endpoints
2. Cache results in `apiSportsCache` table
3. Log every sync to `providerUsageLog`
4. Update `providerConfig` after each sync
5. Add "Coming Soon" labels in UI until fully tested
6. Disable buttons that call not_implemented endpoints

## Notes
- `getPlayerStats` and `getInjuries` were unused imports in apiSportsSync.ts (fixed in Step 1)
- `storeApiSportsPlayerStats` mutation exists but isn't called
- API-SPORTS key is API_SPORTS_KEY (not SPORTSDATA_IO_KEY)
- TheSportsDB is separate provider (media only, not stats)
