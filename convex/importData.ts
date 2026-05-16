/**
 * PropEdge AI — Import System (R10.1 hardened)
 *
 * Manual slip entry, CSV import, and import job tracking.
 * NO credential-based sportsbook syncing.
 *
 * R10.1 fixes:
 * - Imported picks no longer attach to a random first propId
 * - Each imported pick stores sourceType, importJobId, matchStatus,
 *   Full audit trail: originalImported* fields (14 total) for traceability
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Get recent import jobs for the logged-in user */
export const myImports = query({
  args: {},
  returns: undefined as any,
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("importJobs")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
  },
});

/** Try to match an imported pick to an existing prop in the DB */
async function tryMatchProp(
  ctx: any,
  playerName: string,
  statType: string,
  line: number,
  overUnder: string,
  platform: string,
  sport: string,
): Promise<{
  propId: any;
  matchedPropId: any;
  matchConfidence: number;
  matchStatus: string;
}> {
  const candidates = await ctx.db.query("props").collect();
  const nameLower = playerName.toLowerCase();
  const statLower = statType.toLowerCase();
  const ouLower = overUnder.toLowerCase();
  const platLower = platform.toLowerCase();
  const sportLower = sport.toLowerCase();

  // Score each candidate for best match
  let bestMatch: any = null;
  let bestScore = 0;

  for (const p of candidates) {
    if (p.playerName.toLowerCase() !== nameLower) continue;

    let score = 0.3; // Player name match = 30%

    if (p.statType.toLowerCase() === statLower) score += 0.25; // +25% stat type
    if (Math.abs(p.line - line) < 0.5) score += 0.15; // +15% line within 0.5
    if (p.overUnder.toLowerCase() === ouLower) score += 0.1; // +10% over/under
    if (p.platform.toLowerCase() === platLower) score += 0.1; // +10% platform
    if (p.sport.toLowerCase() === sportLower) score += 0.1; // +10% sport

    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
    }
  }

  if (bestMatch && bestScore >= 0.55) {
    // Good match (at least player + stat type)
    return {
      propId: bestMatch._id,
      matchedPropId: bestMatch._id,
      matchConfidence: Math.round(bestScore * 100) / 100,
      matchStatus: bestScore >= 0.8 ? "matched" : "partial",
    };
  }

  // No usable match
  return {
    propId: undefined,
    matchedPropId: undefined,
    matchConfidence: bestMatch ? Math.round(bestScore * 100) / 100 : 0,
    matchStatus: "unmatched",
  };
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
        odds: v.optional(v.number()),
        stake: v.optional(v.number()),
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
      // Try to match to an existing prop by player/stat/line/overUnder/platform/sport
      const match = await tryMatchProp(
        ctx,
        pick.playerName,
        pick.statType,
        pick.line,
        pick.overUnder,
        pick.platform,
        pick.sport,
      );

      await ctx.db.insert("picks", {
        userId,
        propId: match.propId, // undefined if unmatched
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
        // Import tracking (R10.1)
        sourceType: "manual",
        importJobId,
        matchStatus: match.matchStatus,
        matchedPropId: match.matchedPropId,
        matchConfidence: match.matchConfidence,
        // Full audit trail
        originalImportedLine: pick.line,
        originalImportedPlatform: pick.platform,
        originalImportedPlayer: pick.playerName,
        originalImportedStatType: pick.statType,
        originalImportedDirection: pick.overUnder,
        originalImportedSport: pick.sport,
        originalImportedOdds: pick.odds,
        originalImportedStake: pick.stake,
        // Review workflow
        reviewStatus:
          match.matchStatus === "unmatched" ? "pending" : "accepted",
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

    const lines = csvContent
      .trim()
      .split("\n")
      .filter(l => l.trim());
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
      const parts = lines[i].split(",").map(s => s.trim());
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

      const csvOverUnder = (overUnder || "over").toLowerCase();
      const csvSport = sport || "NBA";
      // Optional columns: odds (col 5), stake (col 6)
      const csvOdds = parts[5] ? parseFloat(parts[5]) : undefined;
      const csvStake = parts[6] ? parseFloat(parts[6]) : undefined;

      // Try to match to an existing prop by player/stat/line/overUnder/platform/sport
      const match = await tryMatchProp(
        ctx,
        playerName,
        statType,
        line,
        csvOverUnder,
        platform,
        csvSport,
      );

      await ctx.db.insert("picks", {
        userId,
        propId: match.propId, // undefined if unmatched
        playerName,
        statType,
        line,
        projection: line,
        edge: 0,
        overUnder: csvOverUnder,
        platform,
        sport: csvSport,
        status: "active",
        addedAt: now,
        // Import tracking (R10.1)
        sourceType: "csv",
        importJobId,
        matchStatus: match.matchStatus,
        matchedPropId: match.matchedPropId,
        matchConfidence: match.matchConfidence,
        // Full audit trail
        originalImportedLine: line,
        originalImportedPlatform: platform,
        originalImportedPlayer: playerName,
        originalImportedStatType: statType,
        originalImportedDirection: csvOverUnder,
        originalImportedSport: csvSport,
        originalImportedOdds: isNaN(csvOdds ?? NaN) ? undefined : csvOdds,
        originalImportedStake: isNaN(csvStake ?? NaN) ? undefined : csvStake,
        // Review workflow
        reviewStatus:
          match.matchStatus === "unmatched" ? "pending" : "accepted",
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
