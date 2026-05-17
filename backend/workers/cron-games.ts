/**
 * cron-games.ts — Fetch live events from The Odds API and store in live_events table
 * Railway: Schedule every 15 minutes
 */
import "dotenv/config";
import { db } from "../src/db/client.js";
import { liveEvents, providerConfig } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

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

async function main() {
  if (!THE_ODDS_API_KEY) {
    console.warn("[cron-games] THE_ODDS_API_KEY not set — skipping");
    return;
  }
  const now = Date.now();
  let totalInserted = 0;

  for (const sportKey of SPORT_KEYS) {
    try {
      const url = `${THE_ODDS_API_BASE}/sports/${sportKey}/events?apiKey=${THE_ODDS_API_KEY}&dateFormat=unix`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`[cron-games] ${sportKey} fetch failed: ${res.status}`);
        continue;
      }
      const events: any[] = await res.json();
      console.log(`[cron-games] ${sportKey}: ${events.length} events`);

      for (const ev of events) {
        const existing = await db
          .select({ id: liveEvents.id })
          .from(liveEvents)
          .where(eq(liveEvents.externalId, ev.id))
          .limit(1);

        const status =
          ev.completed ? "completed" :
          ev.commence_time * 1000 <= now ? "live" : "upcoming";

        const values = {
          provider: "the_odds_api",
          externalId: ev.id,
          sport: SPORT_KEY_REVERSE[sportKey] ?? sportKey,
          sportKey,
          homeTeam: ev.home_team,
          awayTeam: ev.away_team,
          commenceTime: ev.commence_time * 1000,
          status,
          sourceType: "live",
          lastUpdated: now,
          staleAfterMinutes: 15,
          refreshStatus: "fresh",
        };

        if (existing.length) {
          await db
            .update(liveEvents)
            .set(values)
            .where(eq(liveEvents.externalId, ev.id));
        } else {
          await db.insert(liveEvents).values(values);
          totalInserted++;
        }
      }

      // Update provider config
      await db
        .update(providerConfig)
        .set({
          lastSyncTime: now,
          lastSyncStatus: "success",
          lastSyncRecords: events.length,
          updatedAt: now,
        })
        .where(eq(providerConfig.provider, "the_odds_api"));
    } catch (err: any) {
      console.error(`[cron-games] ${sportKey} error:`, err.message);
    }
  }

  console.log(`[cron-games] Done. Inserted ${totalInserted} new events.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[cron-games] Fatal:", err);
  process.exit(1);
});
