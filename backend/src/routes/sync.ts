/**
 * sync.ts — Backend-only data sync endpoints
 *
 * Moves API key usage to the server side so secrets are never
 * exposed in frontend code. The dashboard "Trigger Global Sync"
 * button calls this instead of hitting third-party APIs directly.
 */
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { props, players, liveEvents, providerConfig } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { eq, sql } from 'drizzle-orm';

const app = new Hono();

const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY ?? '';
const BALLDONTLIE_API_KEY = process.env.BALLDONTLIE_API_KEY ?? '';
const THE_ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const BALLDONTLIE_BASE = 'https://api.balldontlie.io/v1';

// ─── NBA team metadata (colors + logos) ──────────────────────────────────────
interface TeamMeta {
  abbr: string;
  primary: string;
  secondary: string;
  logo: string;
}

const NBA_TEAMS: Record<string, TeamMeta> = {
  "Atlanta Hawks":          { abbr: "ATL", primary: "#E03A3E", secondary: "#C1D32F", logo: "https://cdn.nba.com/logos/nba/1610612737/primary/L/logo.svg" },
  "Boston Celtics":         { abbr: "BOS", primary: "#007A33", secondary: "#BA9653", logo: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg" },
  "Brooklyn Nets":          { abbr: "BKN", primary: "#000000", secondary: "#FFFFFF", logo: "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg" },
  "Charlotte Hornets":      { abbr: "CHA", primary: "#1D1160", secondary: "#00788C", logo: "https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg" },
  "Chicago Bulls":          { abbr: "CHI", primary: "#CE1141", secondary: "#000000", logo: "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg" },
  "Cleveland Cavaliers":    { abbr: "CLE", primary: "#6F263D", secondary: "#FFB81C", logo: "https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg" },
  "Dallas Mavericks":       { abbr: "DAL", primary: "#00538C", secondary: "#002B5E", logo: "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg" },
  "Denver Nuggets":         { abbr: "DEN", primary: "#0E2240", secondary: "#FEC524", logo: "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg" },
  "Detroit Pistons":        { abbr: "DET", primary: "#C8102E", secondary: "#1D42BA", logo: "https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg" },
  "Golden State Warriors":  { abbr: "GSW", primary: "#1D428A", secondary: "#FFC72C", logo: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg" },
  "Houston Rockets":        { abbr: "HOU", primary: "#CE1141", secondary: "#000000", logo: "https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg" },
  "Indiana Pacers":         { abbr: "IND", primary: "#002D62", secondary: "#FDBB30", logo: "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg" },
  "LA Clippers":            { abbr: "LAC", primary: "#C8102E", secondary: "#1D428A", logo: "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg" },
  "Los Angeles Lakers":     { abbr: "LAL", primary: "#552583", secondary: "#FDB927", logo: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg" },
  "Memphis Grizzlies":      { abbr: "MEM", primary: "#5D76A9", secondary: "#12173F", logo: "https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg" },
  "Miami Heat":             { abbr: "MIA", primary: "#98002E", secondary: "#F9A01B", logo: "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg" },
  "Milwaukee Bucks":        { abbr: "MIL", primary: "#00471B", secondary: "#EEE1C6", logo: "https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg" },
  "Minnesota Timberwolves": { abbr: "MIN", primary: "#0C2340", secondary: "#236192", logo: "https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg" },
  "New Orleans Pelicans":   { abbr: "NOP", primary: "#0C2340", secondary: "#C8102E", logo: "https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg" },
  "New York Knicks":        { abbr: "NYK", primary: "#006BB6", secondary: "#F58426", logo: "https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg" },
  "Oklahoma City Thunder":  { abbr: "OKC", primary: "#007AC1", secondary: "#EF6B01", logo: "https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg" },
  "Orlando Magic":          { abbr: "ORL", primary: "#0077C0", secondary: "#C4CED4", logo: "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg" },
  "Philadelphia 76ers":     { abbr: "PHI", primary: "#006BB6", secondary: "#ED174C", logo: "https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg" },
  "Phoenix Suns":           { abbr: "PHX", primary: "#1D1160", secondary: "#E56020", logo: "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg" },
  "Portland Trail Blazers": { abbr: "POR", primary: "#E03A3E", secondary: "#000000", logo: "https://cdn.nba.com/logos/nba/1610612757/primary/L/logo.svg" },
  "Sacramento Kings":       { abbr: "SAC", primary: "#5A2D81", secondary: "#63727A", logo: "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg" },
  "San Antonio Spurs":      { abbr: "SAS", primary: "#C4CED4", secondary: "#000000", logo: "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg" },
  "Toronto Raptors":        { abbr: "TOR", primary: "#CE1141", secondary: "#000000", logo: "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg" },
  "Utah Jazz":              { abbr: "UTA", primary: "#002B5C", secondary: "#00471B", logo: "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg" },
  "Washington Wizards":     { abbr: "WAS", primary: "#002B5C", secondary: "#E31837", logo: "https://cdn.nba.com/logos/nba/1610612764/primary/L/logo.svg" },
};

function getTeamMeta(teamFullName: string): TeamMeta | null {
  return NBA_TEAMS[teamFullName] ?? null;
}

// POST /api/sync/trigger — run a full data sync from configured providers
app.post('/trigger', requireAuth, async (c) => {
  const results: { provider: string; status: string; count: number }[] = [];
  const now = Date.now();

  // ─── Odds sync (The Odds API) ──────────────────────────────────────
  if (THE_ODDS_API_KEY) {
    try {
      const oddsRes = await fetch(
        `${THE_ODDS_API_BASE}/sports/basketball_nba/odds?apiKey=${THE_ODDS_API_KEY}&regions=us&markets=h2h`
      );

      if (oddsRes.ok) {
        const games: any[] = await oddsRes.json();
        let inserted = 0;

        for (const game of games.slice(0, 20)) {
          const homeTeam = game.home_team ?? '';
          const awayTeam = game.away_team ?? '';

          const propData: any = {
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
            overUnder: 'over',
            variance: 0,
            matchupRating: 5,
            dataSource: 'live',
            lastUpdated: now,
            provider: 'the_odds_api',
          };

          const bookmaker = game.bookmakers?.[0];
          if (bookmaker?.markets?.[0]?.outcomes) {
            const outcomes = bookmaker.markets[0].outcomes;
            const homeOutcome = outcomes.find((o: any) => o.name === homeTeam);
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
            console.warn(`[sync] Prop insert for ${homeTeam}:`, err.message);
          }
        }

        results.push({ provider: 'the_odds_api', status: 'ok', count: games.length });
        results.push({ provider: 'odds_props_inserted', status: 'ok', count: inserted });
      } else {
        results.push({ provider: 'the_odds_api', status: 'error', count: 0 });
      }
    } catch (err: any) {
      results.push({ provider: 'the_odds_api', status: 'error', count: 0 });
    }
  } else {
    results.push({ provider: 'the_odds_api', status: 'skipped (no key)', count: 0 });
  }

  // ─── Player + Stats sync (BallDontLie) ─────────────────────────────
  if (BALLDONTLIE_API_KEY) {
    try {
      // Fetch active NBA players (page 1 — top 100)
      const pRes = await fetch(`${BALLDONTLIE_BASE}/players?per_page=100&page=1`, {
        headers: { Authorization: BALLDONTLIE_API_KEY },
      });

      if (pRes.ok) {
        const pJson: any = await pRes.json();
        const bdlPlayers: any[] = pJson.data ?? [];
        let upserted = 0;

        for (const bp of bdlPlayers) {
          const fullName = `${bp.first_name ?? ''} ${bp.last_name ?? ''}`.trim();
          if (!fullName) continue;

          const teamFull = bp.team?.full_name ?? '';
          const meta = getTeamMeta(teamFull);
          const abbr = meta?.abbr ?? (bp.team?.abbreviation ?? '');

          const values: any = {
            name: fullName,
            team: abbr,
            position: bp.position || 'N/A',
            sport: 'NBA',
            league: 'NBA',
            imageUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/${bp.id}.png`,
            headshotUrl: `https://cdn.nba.com/headshots/nba/latest/1040x760/${bp.id}.png`,
            teamLogoUrl: meta?.logo ?? null,
            teamColor: meta?.primary ?? null,
            teamColors: meta ? { primary: meta.primary, secondary: meta.secondary } : null,
            jerseyNumber: bp.jersey_number ? parseInt(bp.jersey_number, 10) : null,
            externalIds: { ballDontLieId: bp.id },
          };

          const [existing] = await db.select({ id: players.id }).from(players).where(eq(players.name, fullName)).limit(1);
          if (existing) {
            await db.update(players).set(values).where(eq(players.id, existing.id));
          } else {
            await db.insert(players).values(values);
          }
          upserted++;
        }

        results.push({ provider: 'balldontlie_players', status: 'ok', count: upserted });
      } else {
        results.push({ provider: 'balldontlie_players', status: 'error', count: 0 });
      }
    } catch (err: any) {
      results.push({ provider: 'balldontlie_players', status: 'error', count: 0 });
    }
  } else {
    results.push({ provider: 'balldontlie', status: 'skipped (no key)', count: 0 });
  }

  const totalCount = results.reduce((s, r) => s + r.count, 0);
  return c.json({
    success: true,
    message: `Sync complete — ${totalCount} records processed`,
    results,
    timestamp: now,
  });
});

// GET /api/sync/status — check provider connection health
app.get('/status', async (c) => {
  const providerRows = await db.select().from(providerConfig);

  // Also get counts from key tables
  const [propCount] = await db.select({ count: sql<number>`count(*)::int` }).from(props);
  const [playerCount] = await db.select({ count: sql<number>`count(*)::int` }).from(players);

  return c.json({
    providers: providerRows,
    theOddsApiConfigured: !!THE_ODDS_API_KEY,
    ballDontLieConfigured: !!BALLDONTLIE_API_KEY,
    counts: {
      props: propCount?.count ?? 0,
      players: playerCount?.count ?? 0,
    },
  });
});

export default app;
