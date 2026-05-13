/**
 * PropEdge AI — Import System (R10.1 hardened)
 *
 * Manual slip entry, CSV import, and import job tracking.
 * NO credential-based sportsbook syncing.
 *
 * R10.1 fixes:
 * - Imported picks no longer attach to a random first propId
 * - Each imported pick stores sourceType, importJobId, matchStatus,
 *   originalLine, and originalPlatform for full traceability
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Get recent import jobs for the logged-in user */
export const myImports = query({
  args: {},
  returns: undefined as any,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("importJobs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

/** Try to match an imported pick to an existing prop in the DB */
async function tryMatchProp(
  ctx: any,
  playerName: string,
  statType: string,
  _line: number,
): Promise<{ propId: any; matchStatus: string }> {
  // Search by player name in props table
  const candidates = await ctx.db.query("props").collect();
  const nameLower = playerName.toLowerCase();

  // Exact player + stat match
  const exact = candidates.find(
    (p: any) =>
      p.playerName.toLowerCase() === nameLower &&
      p.statType.toLowerCase() === statType.toLowerCase(),
  );
  if (exact) {
    return { propId: exact._id, matchStatus: "matched" };
  }

  // Partial player match (name only)
  const partial = candidates.find(
    (p: any) => p.playerName.toLowerCase() === nameLower,
  );
  if (partial) {
    return { propId: partial._id, matchStatus: "partial" };
  }

  // No match — leave propId undefined
  return { propId: undefined, matchStatus: "unmatched" };
}

/** Manual slip entry — create picks from a form */
export const manualSlipEntry = mutation({
  args: {
    picks: v.array(
      v.object({
        playerName: v.string(),
        statType: v.string(),
        line: v.number(),
        overUnder: v.string(),
        platform: v.string(),
        sport: v.string(),
      }),
    ),
    importSource: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, { picks, importSource }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    // Create the import job FIRST so we can reference its ID
    const importJobId = await ctx.db.insert("importJobs", {
      userId,
      importSource,
      status: "processing",
      totalPicks: picks.length,
      successfulPicks: 0,
      failedPicks: 0,
      errors: [],
      createdAt: now,
    });

    let created = 0;

    for (const pick of picks) {
      // Try to match to an existing prop (but don't require it)
      const { propId, matchStatus } = await tryMatchProp(
        ctx,
        pick.playerName,
        pick.statType,
        pick.line,
      );

      await ctx.db.insert("picks", {
        userId,
        propId,                                   // undefined if unmatched
        playerName: pick.playerName,
        statType: pick.statType,
        line: pick.line,
        projection: pick.line,                    // same as line for manual imports
        edge: 0,
        overUnder: pick.overUnder,
        platform: pick.platform,
        sport: pick.sport,
        status: "active",
        addedAt: now,
        // Import tracking (R10.1)
        sourceType: "manual_import",
        importJobId,
        matchStatus,
        originalLine: pick.line,
        originalPlatform: pick.platform,
      });
      created++;
    }

    // Update the import job with final counts
    await ctx.db.patch(importJobId, {
      status: "completed",
      successfulPicks: created,
      failedPicks: picks.length - created,
      completedAt: now,
    });

    return { picksCreated: created, picksAttempted: picks.length, importJobId };
  },
});

/** CSV import — parse and create picks from CSV text */
export const csvImport = mutation({
  args: {
    csvContent: v.string(),
    platform: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, { csvContent, platform }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const lines = csvContent.trim().split("\n").filter((l) => l.trim());
    const errors: string[] = [];
    const now = Date.now();

    // Create import job first
    const importJobId = await ctx.db.insert("importJobs", {
      userId,
      importSource: "csv",
      status: "processing",
      totalPicks: lines.length,
      successfulPicks: 0,
      failedPicks: 0,
      errors: [],
      createdAt: now,
    });

    let parsed = 0;

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(",").map((s) => s.trim());
      if (parts.length < 4) {
        errors.push(`Line ${i + 1}: expected at least 4 columns`);
        continue;
      }

      const [playerName, statType, lineStr, overUnder, sport] = parts;
      const line = parseFloat(lineStr);

      if (!playerName || !statType || isNaN(line)) {
        errors.push(`Line ${i + 1}: invalid data`);
        continue;
      }

      // Try to match to an existing prop (but don't require it)
      const { propId, matchStatus } = await tryMatchProp(
        ctx,
        playerName,
        statType,
        line,
      );

      await ctx.db.insert("picks", {
        userId,
        propId,                                   // undefined if unmatched
        playerName,
        statType,
        line,
        projection: line,
        edge: 0,
        overUnder: (overUnder || "over").toLowerCase(),
        platform,
        sport: sport || "NBA",
        status: "active",
        addedAt: now,
        // Import tracking (R10.1)
        sourceType: "csv_import",
        importJobId,
        matchStatus,
        originalLine: line,
        originalPlatform: platform,
      });
      parsed++;
    }

    // Update import job with final counts
    await ctx.db.patch(importJobId, {
      status: errors.length === 0 ? "completed" : "partial",
      successfulPicks: parsed,
      failedPicks: lines.length - parsed,
      errors,
      completedAt: now,
    });

    return { parsed, errors, importJobId };
  },
});
