import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const myPicks = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, { status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (status) {
      return await ctx.db
        .query("picks")
        .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", status))
        .collect();
    }
    return await ctx.db
      .query("picks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addPick = mutation({
  args: {
    propId: v.id("props"),
  },
  returns: v.union(v.id("picks"), v.null()),
  handler: async (ctx, { propId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const prop = await ctx.db.get(propId);
    if (!prop) return null;

    // Check if already picked
    const existingPicks = await ctx.db
      .query("picks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const alreadyPicked = existingPicks.find(
      (p) => p.propId === propId && p.status === "pending"
    );
    if (alreadyPicked) return alreadyPicked._id;

    return await ctx.db.insert("picks", {
      userId,
      propId,
      playerName: prop.playerName,
      statType: prop.statType,
      line: prop.line,
      projection: prop.projection,
      edge: prop.edge,
      overUnder: prop.overUnder,
      platform: prop.platform,
      sport: prop.sport,
      team: prop.team,
      gameId: prop.gameId,
      status: "pending",
      addedAt: Date.now(),
    });
  },
});

export const removePick = mutation({
  args: { pickId: v.id("picks") },
  returns: v.null(),
  handler: async (ctx, { pickId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pick = await ctx.db.get(pickId);
    if (!pick) throw new Error("Pick not found");
    if (pick.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(pickId);
    return null;
  },
});

export const myEntries = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("entries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createEntry = mutation({
  args: {
    pickIds: v.array(v.id("picks")),
    platform: v.string(),
    entryType: v.string(),
    stake: v.optional(v.number()),
  },
  returns: v.union(v.id("entries"), v.null()),
  handler: async (ctx, { pickIds, platform, entryType, stake }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify every pick belongs to the authenticated user
    for (const pickId of pickIds) {
      const pick = await ctx.db.get(pickId);
      if (!pick) throw new Error(`Pick ${pickId} not found`);
      if (pick.userId !== userId) throw new Error("Not authorized — pick belongs to another user");
    }

    return await ctx.db.insert("entries", {
      userId,
      platform,
      pickIds,
      entryType,
      status: "active",
      stake: stake || 10,
      createdAt: Date.now(),
    });
  },
});

// Correlation analysis for the pick builder
export const analyzeCorrelations = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { warnings: [], suggestions: [], diversificationScore: 0 };

    const picks = await ctx.db
      .query("picks")
      .withIndex("by_userId_status", (q) => q.eq("userId", userId).eq("status", "pending"))
      .collect();

    if (picks.length < 2) return { warnings: [], suggestions: [], diversificationScore: 100 };

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 1. Same-game detection
    const gameGroups: Record<string, typeof picks> = {};
    for (const p of picks) {
      const gameKey = p.gameId?.toString() || `${p.sport}-${p.team}`;
      if (!gameGroups[gameKey]) gameGroups[gameKey] = [];
      gameGroups[gameKey].push(p);
    }

    for (const [, group] of Object.entries(gameGroups)) {
      if (group.length >= 2) {
        const names = group.map(p => p.playerName).join(" & ");
        const teams = [...new Set(group.map(p => p.team))];
        
        if (teams.length === 1) {
          warnings.push(`🔗 ${names} are teammates — their stats are positively correlated. Both hitting is more likely (or both missing).`);
          suggestions.push(`💡 Consider: If ${group[0].playerName} has a big game, ${group[1]?.playerName || "teammates"} may benefit too. Good for upside plays.`);
        } else {
          warnings.push(`⚔️ ${names} are in the same game — game flow affects both. If one team blows out, the other's players may see reduced minutes.`);
        }
      }
    }

    // 2. Stat correlation detection
    const statCorrelations: Record<string, string[]> = {
      "Points": ["Pts+Reb+Ast", "Fantasy Points", "3-Pointers"],
      "Rebounds": ["Pts+Reb+Ast"],
      "Assists": ["Pts+Reb+Ast"],
      "Pts+Reb+Ast": ["Points", "Rebounds", "Assists"],
      "Passing Yards": ["Passing TDs", "Fantasy Points"],
      "Receiving Yards": ["Receptions"],
      "Receptions": ["Receiving Yards"],
      "Total Bases": ["Hits+Runs+RBIs", "Home Runs"],
      "Shots on Goal": ["Goals", "Points"],
    };

    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        if (picks[i].playerName === picks[j].playerName) {
          const correlated = statCorrelations[picks[i].statType];
          if (correlated?.includes(picks[j].statType)) {
            warnings.push(`📊 ${picks[i].playerName}: ${picks[i].statType} and ${picks[j].statType} are statistically correlated (r > 0.7). Picking the same direction on both adds risk.`);
          }
        }
      }
    }

    // 3. Over/Under balance check
    const overs = picks.filter(p => p.overUnder === "over").length;
    const unders = picks.filter(p => p.overUnder === "under").length;
    if (overs > 0 && unders === 0 && picks.length >= 3) {
      suggestions.push(`📈 All ${overs} picks are OVER — consider adding an under for balance. All-over entries are higher variance.`);
    } else if (unders > 0 && overs === 0 && picks.length >= 3) {
      suggestions.push(`📉 All ${unders} picks are UNDER — consider mixing in an over for diversification.`);
    }

    // 4. Sport concentration
    const sportCounts: Record<string, number> = {};
    for (const p of picks) {
      sportCounts[p.sport] = (sportCounts[p.sport] || 0) + 1;
    }
    const sportEntries = Object.entries(sportCounts);
    if (sportEntries.length === 1 && picks.length >= 4) {
      suggestions.push(`🏟️ All picks from ${sportEntries[0][0]} — diversifying across sports reduces correlated loss risk.`);
    }

    // 5. Negative correlation warning
    for (let i = 0; i < picks.length; i++) {
      for (let j = i + 1; j < picks.length; j++) {
        if (picks[i].gameId && picks[i].gameId === picks[j].gameId) {
          const iTeam = picks[i].team;
          const jTeam = picks[j].team;
          if (iTeam !== jTeam) {
            if (
              (picks[i].statType.includes("Points") && picks[j].statType.includes("Points")) &&
              (picks[i].overUnder === "over" && picks[j].overUnder === "over")
            ) {
              warnings.push(`⚠️ ${picks[i].playerName} & ${picks[j].playerName} are opposing players — both OVER on scoring is a high-pace game bet.`);
            }
          }
        }
      }
    }

    // Diversification score (0-100)
    const uniqueGames = Object.keys(gameGroups).length;
    const uniqueSports = sportEntries.length;
    const overUnderBalance = Math.min(overs, unders) / Math.max(overs, unders, 1);
    
    const gameDiv = Math.min(1, uniqueGames / picks.length);
    const sportDiv = Math.min(1, uniqueSports / Math.min(4, picks.length));
    const balanceScore = 0.3 + overUnderBalance * 0.7;
    
    const diversificationScore = Math.round((gameDiv * 0.4 + sportDiv * 0.3 + balanceScore * 0.3) * 100);

    return { warnings, suggestions, diversificationScore };
  },
});

// ===== Quick Pack Generators =====
export const generateQuickPack = query({
  args: {
    packType: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, { packType }) => {
    const allProps = await ctx.db.query("props").collect();
    const validProps = allProps.filter(p => isFinite(p.edge));

    const usedPlayers = new Set<string>();
    function pickUnique(pool: any[], count: number) {
      const result: any[] = [];
      for (const p of pool) {
        if (result.length >= count) break;
        if (usedPlayers.has(p.playerName)) continue;
        result.push(p);
        usedPlayers.add(p.playerName);
      }
      return result;
    }

    switch (packType) {
      case "bestEdge4": {
        const sorted = [...validProps].sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
        const picks = pickUnique(sorted, 4);
        return { name: "🎯 Best Edge 4-Pack", description: "Top 4 highest absolute edge plays", picks, avgEdge: avg(picks.map(p => Math.abs(p.edge))), avgConfidence: avg(picks.map(p => p.confidence)), sports: [...new Set(picks.map(p => p.sport))] };
      }
      case "highConfidence3": {
        const sorted = [...validProps].sort((a, b) => b.confidence - a.confidence);
        const picks = pickUnique(sorted, 3);
        return { name: "🛡️ High Confidence 3-Pack", description: "Safest picks with highest confidence scores", picks, avgEdge: avg(picks.map(p => Math.abs(p.edge))), avgConfidence: avg(picks.map(p => p.confidence)), sports: [...new Set(picks.map(p => p.sport))] };
      }
      case "balancedMix": {
        const overs = [...validProps].filter(p => p.edge > 5).sort((a, b) => b.edge - a.edge);
        const unders = [...validProps].filter(p => p.edge < -5).sort((a, b) => a.edge - b.edge);
        const overPicks = pickUnique(overs, 2);
        const underPicks = pickUnique(unders, 2);
        const picks = [...overPicks, ...underPicks];
        return { name: "⚖️ Balanced EV Mix", description: "2 overs + 2 unders for balanced exposure", picks, avgEdge: avg(picks.map(p => Math.abs(p.edge))), avgConfidence: avg(picks.map(p => p.confidence)), sports: [...new Set(picks.map(p => p.sport))] };
      }
      case "kalshiBest": {
        const kalshi = validProps.filter(p => p.platform === "Kalshi" || p.isKalshiMarket);
        const sorted = [...kalshi].sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
        const picks = pickUnique(sorted, 4);
        return { name: "💹 Kalshi Best Markets", description: "Highest edge Kalshi binary markets", picks, avgEdge: avg(picks.map(p => Math.abs(p.edge))), avgConfidence: avg(picks.map(p => p.confidence)), sports: [...new Set(picks.map(p => p.sport))] };
      }
      case "underdogFlex": {
        const udProps = validProps.filter(p => p.platform === "Underdog" || Math.abs(p.edge) > 8);
        const sorted = [...udProps].sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
        const picks = pickUnique(sorted, 6);
        return { name: "🐕 Underdog 6-Pick Flex", description: "Optimized for Underdog Flex Play (5/6 or 6/6 win)", picks, avgEdge: avg(picks.map(p => Math.abs(p.edge))), avgConfidence: avg(picks.map(p => p.confidence)), sports: [...new Set(picks.map(p => p.sport))] };
      }
      case "prizePicksPower": {
        const ppProps = validProps.filter(p => p.edge > 3).sort((a, b) => b.confidence - a.confidence);
        const picks = pickUnique(ppProps, 4);
        return { name: "⚡ PrizePicks Power Play", description: "4-pick power play — all must hit for 10x", picks, avgEdge: avg(picks.map(p => Math.abs(p.edge))), avgConfidence: avg(picks.map(p => p.confidence)), sports: [...new Set(picks.map(p => p.sport))] };
      }
      // R4 NEW: Value Score based pack
      case "topValue5": {
        const scored = validProps.map(p => {
          const absEdge = Math.min(40, Math.abs(p.edge) * 2.5);
          const cons = p.projectionConsensus;
          const cf = cons ? (p.edge > 0 ? (cons.numOverLine / cons.numSources) * 25 : ((cons.numSources - cons.numOverLine) / cons.numSources) * 25) : 10;
          const hr = Math.min(20, ((p.historicalHitRate?.similarLines || p.hitRate || 50) / 100) * 20);
          const br = Math.min(15, ((100 - (p.bustRisk ?? 40)) / 100) * 15);
          return { ...p, valueScore: Math.round(Math.min(100, absEdge + cf + hr + br)) };
        });
        scored.sort((a, b) => b.valueScore - a.valueScore);
        const picks = pickUnique(scored, 5);
        return { name: "💎 Top Value 5-Pack", description: "Highest composite Value Score picks", picks, avgEdge: avg(picks.map(p => Math.abs(p.edge))), avgConfidence: avg(picks.map(p => p.confidence)), sports: [...new Set(picks.map(p => p.sport))] };
      }
      default:
        return { name: "Unknown", picks: [], avgEdge: 0, avgConfidence: 0, sports: [] };
    }
  },
});

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

export const pickStats = query({
  args: {},
  returns: v.object({
    totalPicks: v.number(),
    pendingPicks: v.number(),
    wonPicks: v.number(),
    lostPicks: v.number(),
    winRate: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalPicks: 0, pendingPicks: 0, wonPicks: 0, lostPicks: 0, winRate: 0 };

    const picks = await ctx.db
      .query("picks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const totalPicks = picks.length;
    const pendingPicks = picks.filter((p) => p.status === "pending").length;
    const wonPicks = picks.filter((p) => p.status === "won").length;
    const lostPicks = picks.filter((p) => p.status === "lost").length;
    const decided = wonPicks + lostPicks;
    const winRate = decided > 0 ? Math.round((wonPicks / decided) * 1000) / 10 : 0;

    return { totalPicks, pendingPicks, wonPicks, lostPicks, winRate };
  },
});
