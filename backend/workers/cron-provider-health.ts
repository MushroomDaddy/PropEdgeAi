/**
 * cron-provider-health.ts — Ping all providers, update provider_config health status
 * Railway: Schedule hourly
 */
import "dotenv/config";
import { db } from "../src/db/client.js";
import { providerConfig, providerUsageLog } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

interface ProviderCheck {
  provider: string;
  checkUrl: string;
  apiKeyEnv: string;
}

const PROVIDERS: ProviderCheck[] = [
  {
    provider: "the_odds_api",
    checkUrl: `https://api.the-odds-api.com/v4/sports?apiKey=${process.env.THE_ODDS_API_KEY ?? ""}`,
    apiKeyEnv: "THE_ODDS_API_KEY",
  },
  {
    provider: "balldontlie",
    checkUrl: "https://api.balldontlie.io/v1/players?per_page=1",
    apiKeyEnv: "BALLDONTLIE_API_KEY",
  },
];

async function checkProvider(p: ProviderCheck): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env[p.apiKeyEnv];
  if (!apiKey) return { ok: false, error: `${p.apiKeyEnv} not set` };
  try {
    const res = await fetch(p.checkUrl, {
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    return { ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  const now = Date.now();

  for (const p of PROVIDERS) {
    const result = await checkProvider(p);
    const status = result.ok ? "success" : "error";
    console.log(`[cron-provider-health] ${p.provider}: ${status}`);

    // Upsert provider config
    const [existing] = await db
      .select({ id: providerConfig.id })
      .from(providerConfig)
      .where(eq(providerConfig.provider, p.provider))
      .limit(1);

    const values: any = {
      provider: p.provider,
      enabled: result.ok,
      apiKeyConfigured: !!process.env[p.apiKeyEnv],
      supportedSports: ["NBA", "NFL", "MLB", "NHL"],
      supportedMarkets: ["h2h", "spreads", "totals", "player_props"],
      requestsUsedThisMonth: 0,
      lastSyncTime: now,
      lastSyncStatus: status,
      lastSyncError: result.error ?? null,
      lastSyncRecords: 0,
      staleAfterMinutes: 60,
      updatedAt: now,
    };

    if (existing) {
      await db.update(providerConfig).set(values).where(eq(providerConfig.provider, p.provider));
    } else {
      await db.insert(providerConfig).values(values);
    }

    // Log usage
    await db.insert(providerUsageLog).values({
      provider: p.provider,
      endpoint: "health_check",
      sport: "all",
      requestsUsed: 1,
      recordsFetched: 0,
      success: result.ok,
      error: result.error ?? null,
      timestamp: now,
    });
  }

  console.log("[cron-provider-health] Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[cron-provider-health] Fatal:", err);
  process.exit(1);
});
