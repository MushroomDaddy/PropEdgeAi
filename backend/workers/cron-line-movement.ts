/**
 * cron-line-movement.ts — Capture prop line movement snapshots
 * Railway: Schedule every 30 minutes
 */
import "dotenv/config";
import { db } from "../src/db/client.js";
import { props, propSnapshots } from "../src/db/schema.js";
import { gt } from "drizzle-orm";

async function main() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Snapshot all recently-updated props
  const recentProps = await db
    .select()
    .from(props)
    .where(gt(props.lastUpdated!, oneHourAgo))
    .limit(500);

  console.log(`[cron-line-movement] Snapshotting ${recentProps.length} props`);

  for (const prop of recentProps) {
    await db.insert(propSnapshots).values({
      propId: prop.id,
      playerName: prop.playerName,
      statType: prop.statType,
      line: prop.line,
      projection: prop.projection,
      edge: prop.edge,
      modelProb: prop.modelProb ?? null,
      marketImpliedProb: prop.marketImpliedProb ?? null,
      snapshotType: "update",
      timestamp: now,
      dataSource: prop.dataSource ?? "live",
    });
  }

  console.log(`[cron-line-movement] Done. ${recentProps.length} snapshots written.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[cron-line-movement] Fatal:", err);
  process.exit(1);
});
