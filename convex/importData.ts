/**
 * PropEdge AI — Import System
 *
 * Manual slip entry, CSV import, and import job tracking.
 * NO credential-based sportsbook syncing.
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
      })
    ),
    importSource: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, { picks, importSource }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let created = 0;
    const now = Date.now();

    // Find a demo prop ID to reference (picks table requires propId)
    const anyProp = await ctx.db.query("props").first();
    if (!anyProp) {
      // No props exist — can't create picks without a prop reference.
      // Record the import as failed.
      await ctx.db.insert("importJobs", {
        userId,
        importSource,
        status: "failed",
        totalPicks: picks.length,
        successfulPicks: 0,
        failedPicks: picks.length,
        errors: ["No props in database — seed demo data first"],
        createdAt: now,
      });
      return { picksCreated: 0, picksAttempted: picks.length };
    }

    for (const pick of picks) {
      await ctx.db.insert("picks", {
        userId,
        propId: anyProp._id, // placeholder reference
        playerName: pick.playerName,
        statType: pick.statType,
        line: pick.line,
        projection: pick.line, // same as line for manual imports
        edge: 0,
        overUnder: pick.overUnder,
        platform: pick.platform,
        sport: pick.sport,
        status: "active",
        addedAt: now,
      });
      created++;
    }

    // Record import job
    await ctx.db.insert("importJobs", {
      userId,
      importSource,
      status: "completed",
      totalPicks: picks.length,
      successfulPicks: created,
      failedPicks: 0,
      errors: [],
      createdAt: now,
    });

    return { picksCreated: created, picksAttempted: picks.length };
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
    let parsed = 0;
    const now = Date.now();

    const anyProp = await ctx.db.query("props").first();

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

      if (!anyProp) {
        errors.push(`Line ${i + 1}: no props in database — seed demo data first`);
        continue;
      }

      await ctx.db.insert("picks", {
        userId,
        propId: anyProp._id,
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
      });
      parsed++;
    }

    // Record import job
    await ctx.db.insert("importJobs", {
      userId,
      importSource: "csv",
      status: errors.length === 0 ? "completed" : "partial",
      totalPicks: lines.length,
      successfulPicks: parsed,
      failedPicks: lines.length - parsed,
      errors,
      createdAt: now,
    });

    return { parsed, errors };
  },
});
