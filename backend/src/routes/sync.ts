/**
 * sync.ts — Backend-only data sync endpoint
 *
 * Moves API key usage to the server side so secrets are never
 * exposed in frontend code. The dashboard "Trigger Global Sync"
 * button calls this instead of hitting third-party APIs directly.
 */
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { props, players, liveEvents, providerConfig } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY ?? '';
const THE_ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// POST /api/sync/trigger — run a full data sync from configured providers
app.post('/trigger', requireAuth, async (c) => {
  if (!THE_ODDS_API_KEY) {
    return c.json({ error: 'THE_ODDS_API_KEY not configured on server' }, 503);
  }

  const results: { provider: string; status: string; count: number }[] = [];

  try {
    // 1. Fetch NBA odds from The Odds API
    const oddsRes = await fetch(
      `${THE_ODDS_API_BASE}/sports/basketball_nba/odds?apiKey=${THE_ODDS_API_KEY}&regions=us&markets=h2h`
    );

    if (!oddsRes.ok) {
      return c.json({
        error: 'The Odds API request failed',
        status: oddsRes.status,
        detail: await oddsRes.text(),
      }, 502);
    }

    const games: any[] = await oddsRes.json();
    results.push({ provider: 'the_odds_api', status: 'ok', count: games.length });

    // 2. Transform odds data into props
    const now = Date.now();
    let inserted = 0;

    for (const game of games.slice(0, 20)) {
      const homeTeam = game.home_team ?? '';
      const awayTeam = game.away_team ?? '';

      // Create a prop entry for the game
      const propData = {
        sport: 'NBA',
        playerName: `${homeTeam} vs ${awayTeam}`,
        team: homeTeam,
        statType: 'Moneyline',
        line: 0,
        projection: 0,
        projectionSources: [{ source: 'the_odds_api', value: 0 }],
        platform: 'The Odds API',
        edge: 0,
        confidence: 50,
        hitRate: 50,
        overUnder: 'over' as const,
        variance: 0,
        matchupRating: 5,
        dataSource: 'live',
        lastUpdated: now,
        provider: 'the_odds_api',
      };

      // Extract odds from first bookmaker
      const bookmaker = game.bookmakers?.[0];
      if (bookmaker?.markets?.[0]?.outcomes) {
        const outcomes = bookmaker.markets[0].outcomes;
        const homeOutcome = outcomes.find((o: any) => o.name === homeTeam);
        const awayOutcome = outcomes.find((o: any) => o.name === awayTeam);

        if (homeOutcome) {
          propData.line = homeOutcome.price;
          propData.projection = homeOutcome.price;
          const impliedProb = homeOutcome.price > 0
            ? 100 / (homeOutcome.price + 100)
            : Math.abs(homeOutcome.price) / (Math.abs(homeOutcome.price) + 100);
          propData.confidence = Math.round(impliedProb * 100);
          propData.edge = Math.round((impliedProb - 0.5) * 100 * 10) / 10;
        }
      }

      try {
        await db.insert(props).values(propData);
        inserted++;
      } catch (err: any) {
        console.warn(`[sync] Failed to insert prop for ${homeTeam}:`, err.message);
      }
    }

    results.push({ provider: 'props_upserted', status: 'ok', count: inserted });

    return c.json({
      success: true,
      message: `Synced ${games.length} games, inserted ${inserted} props`,
      results,
      timestamp: now,
    });
  } catch (err: any) {
    console.error('[sync] Error:', err.message);
    return c.json({ error: 'Sync failed', detail: err.message }, 500);
  }
});

// GET /api/sync/status — check provider connection health
app.get('/status', async (c) => {
  const providers = await db.select().from(providerConfig);
  return c.json({
    providers,
    theOddsApiConfigured: !!THE_ODDS_API_KEY,
    ballDontLieConfigured: !!process.env.BALLDONTLIE_API_KEY,
  });
});

export default app;
