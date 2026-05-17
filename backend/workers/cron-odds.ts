/**
 * cron-odds.ts — Fetch live odds from The Odds API and store in live_odds table
 * Railway: Schedule every 10 minutes
 */
import "dotenv/config";
import { db } from "../src/db/client.js";
import { liveOdds, liveEvents, providerConfig } from "../src/db/schema.js";
import { eq, and } from "drizzle-orm";

const THE_ODDS_API_KEY = process.env.THE_ODDS_API_KEY ?? "";
const THE_ODDS_API_BASE = "https://api.the-odds-api.com/v4";

const SPORT_KEYS = [
  "basketball_nba",
  "americanfootball_nfl",
  "baseball_mlb",
  "icehockey_nhl",
];

const SPORT_KEY_REVERSE: Record<string, string> = {
  basketball_nba: "NBA",
  americanfootball_nfl: "NFL",
  baseball_mlb: "MLB",
  icehockey_nhl: "NHL",
};

function americanToImplied(odds: number): number {
  if (odds > 0) return Math.round((100 / (odds + 100)) * 10000) / 100;
  return Math.round((Math.abs(odds) / (Math.abs(odds) + 100)) * 10000) / 100;
}

async function main() {
  if (!THE_ODDS_API_KEY) {
    console.warn("[cron-odds] THE_ODDS_API_KEY not set — skipping");
    return;
  }
  const now = Date.now();

  for (const sportKey of SPORT_KEYS) {
    try {
      const url = `${THE_ODDS_API_BASE}/sports/${sportKey}/odds?apiKey=${THE_ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[cron-odds] ${sportKey} fetch failed: ${res.status}`);
        continue;
      }
      const events: any[] = await res.json();
      const sport = SPORT_KEY_REVERSE[sportKey] ?? sportKey;

      for (const ev of events) {
        for (const bookmaker of (ev.bookmakers ?? [])) {
          for (const market of (bookmaker.markets ?? [])) {
            const values: any = {
              provider: "the_odds_api",
              eventExternalId: ev.id,
              sport,
              bookmaker: bookmaker.key,
              marketType: market.key,
              sourceType: "live",
              lastUpdated: now,
              staleAfterMinutes: 10,
              refreshStatus: "fresh",
            };

            if (market.key === "h2h" && market.outcomes?.length >= 2) {
              const home = market.outcomes.find((o: any) => o.name === ev.home_team);
              const away = market.outcomes.find((o: any) => o.name === ev.away_team);
              values.homeOdds = home?.price ?? null;
              values.awayOdds = away?.price ?? null;
            }

            const existing = await db
              .select({ id: liveOdds.id })
              .from(liveOdds)
              .where(and(
                eq(liveOdds.eventExternalId, ev.id),
                eq(liveOdds.bookmaker, bookmaker.key),
                eq(liveOdds.marketType, market.key),
              ))
              .limit(1);

            if (existing.length) {
              await db
                .update(liveOdds)
                .set(values)
                .where(eq(liveOdds.id, existing[0].id));
            } else {
              await db.insert(liveOdds).values(values);
            }
          }
        }
      }

      await db
        .update(providerConfig)
        .set({ lastSyncTime: now, lastSyncStatus: "success", lastSyncRecords: events.length, updatedAt: now })
        .where(eq(providerConfig.provider, "the_odds_api"));
    } catch (err: any) {
      console.error(`[cron-odds] ${sportKey} error:`, err.message);
    }
  }

  console.log("[cron-odds] Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[cron-odds] Fatal:", err);
  process.exit(1);
});
