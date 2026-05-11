import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

// Player profile with all intelligence data
export const playerProfile = query({
  args: { playerName: v.string() },
  returns: v.any(),
  handler: async (ctx, { playerName }) => {
    // Find player record
    const players = await ctx.db.query("players").withIndex("by_name", (q) => q.eq("name", playerName)).collect();
    const player = players[0];
    if (!player) return null;

    // Game logs
    const gameLogs = await ctx.db
      .query("playerGameLogs")
      .withIndex("by_playerId", (q) => q.eq("playerId", player._id))
      .collect();
    const sortedLogs = gameLogs.sort((a, b) => b.gameDate - a.gameDate);
    const last5 = sortedLogs.slice(0, 5);
    const last10 = sortedLogs.slice(0, 10);

    // Calculate averages
    const calcAvg = (logs: typeof gameLogs, field: keyof typeof gameLogs[0]) => {
      const vals = logs.map((l) => l[field]).filter((v): v is number => typeof v === "number");
      return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : undefined;
    };

    const last5Avg = {
      points: calcAvg(last5, "points"),
      rebounds: calcAvg(last5, "rebounds"),
      assists: calcAvg(last5, "assists"),
      minutes: calcAvg(last5, "minutes"),
      threePointers: calcAvg(last5, "threePointers"),
    };
    const last10Avg = {
      points: calcAvg(last10, "points"),
      rebounds: calcAvg(last10, "rebounds"),
      assists: calcAvg(last10, "assists"),
      minutes: calcAvg(last10, "minutes"),
      threePointers: calcAvg(last10, "threePointers"),
    };
    const seasonAvg = {
      points: calcAvg(sortedLogs, "points"),
      rebounds: calcAvg(sortedLogs, "rebounds"),
      assists: calcAvg(sortedLogs, "assists"),
      minutes: calcAvg(sortedLogs, "minutes"),
      threePointers: calcAvg(sortedLogs, "threePointers"),
    };

    // Home/Away splits
    const homeLogs = sortedLogs.filter((l) => l.homeAway === "home");
    const awayLogs = sortedLogs.filter((l) => l.homeAway === "away");
    const homeAvg = { points: calcAvg(homeLogs, "points"), rebounds: calcAvg(homeLogs, "rebounds"), assists: calcAvg(homeLogs, "assists") };
    const awayAvg = { points: calcAvg(awayLogs, "points"), rebounds: calcAvg(awayLogs, "rebounds"), assists: calcAvg(awayLogs, "assists") };

    // Props for this player
    const props = await ctx.db.query("props").withIndex("by_playerId", (q) => q.eq("playerId", player._id)).collect();

    // Hit rate vs current prop lines
    const propHitRates = props.map((p) => {
      const relevantLogs = sortedLogs;
      let hitCount = 0;
      let field: keyof typeof gameLogs[0] = "points";
      if (p.statType.toLowerCase().includes("rebound")) field = "rebounds";
      else if (p.statType.toLowerCase().includes("assist")) field = "assists";
      else if (p.statType.toLowerCase().includes("three") || p.statType.toLowerCase().includes("3pt")) field = "threePointers";
      for (const log of relevantLogs) {
        const val = log[field];
        if (typeof val === "number") {
          if (p.overUnder === "over" && val > p.line) hitCount++;
          else if (p.overUnder === "under" && val < p.line) hitCount++;
        }
      }
      return {
        statType: p.statType,
        line: p.line,
        overUnder: p.overUnder,
        hitRate: relevantLogs.length > 0 ? Math.round((hitCount / relevantLogs.length) * 1000) / 10 : 0,
        sampleSize: relevantLogs.length,
      };
    });

    // Opponent matchup data from game logs
    const opponentStats: Record<string, { games: number; avgPoints: number }> = {};
    for (const log of sortedLogs) {
      if (!opponentStats[log.opponent]) opponentStats[log.opponent] = { games: 0, avgPoints: 0 };
      opponentStats[log.opponent].games++;
      opponentStats[log.opponent].avgPoints += (log.points || 0);
    }
    const matchups = Object.entries(opponentStats).map(([opp, d]) => ({
      opponent: opp, games: d.games, avgPoints: Math.round((d.avgPoints / d.games) * 10) / 10,
    }));

    // Minutes/usage trend (last 10)
    const minutesTrend = last10.map((l) => ({
      date: l.gameDate,
      opponent: l.opponent,
      minutes: l.minutes || 0,
      points: l.points || 0,
    })).reverse();

    // Model prediction history
    const predictions = await ctx.db.query("modelPredictions").collect();
    const playerPredictions = predictions
      .filter((p) => p.playerName === playerName)
      .sort((a, b) => b.predictedAt - a.predictedAt)
      .slice(0, 20);

    // Pick results history — only show current user's results (privacy)
    const userId = await getAuthUserId(ctx);
    const allPlayerResults = await ctx.db.query("pickResults").withIndex("by_playerName", (q) => q.eq("playerName", playerName)).collect();
    const results = userId
      ? allPlayerResults.filter((r) => r.userId === userId)
      : [];

    return {
      player: {
        name: player.name,
        team: player.team,
        position: player.position,
        sport: player.sport,
        injuryStatus: player.injuryStatus || "Active",
        recentForm: player.recentForm || "—",
        imageUrl: player.imageUrl,
        teamLogoUrl: player.teamLogoUrl,
        jerseyNumber: player.jerseyNumber,
        teamColor: player.teamColor,
      },
      gameLogs: sortedLogs.slice(0, 20),
      last5Avg,
      last10Avg,
      seasonAvg,
      homeAwaySplits: { home: homeAvg, away: awayAvg },
      propHitRates,
      matchups,
      minutesTrend,
      currentProps: props.map((p) => ({
        propId: p._id,
        statType: p.statType,
        line: p.line,
        projection: p.projection,
        edge: p.edge,
        platform: p.platform,
        overUnder: p.overUnder,
        confidence: p.confidence,
        modelProb: p.modelProb,
        marketImpliedProb: p.marketImpliedProb,
        projectionDiff: p.projectionDiff,
        bustRisk: p.bustRisk,
        valueScore: p.bustRisk !== undefined && p.projectionDiff !== undefined
          ? Math.round(Math.min(100,
              Math.min(40, Math.abs(p.edge) * 2.5)
              + Math.min(25, (p.projectionConsensus?.numOverLine ?? 0) / Math.max(1, p.projectionConsensus?.numSources ?? 1) * 25)
              + Math.min(20, (p.hitRate / 100) * 20)
              + Math.min(15, ((100 - (p.bustRisk ?? 50)) / 100) * 15)
            ))
          : undefined,
        dataSource: p.dataSource || "demo",
        lastUpdated: p.lastUpdated,
        provider: p.provider,
      })),
      // Prop snapshots for line movement (keyed by propId string)
      propSnapshots: await (async () => {
        const snapMap: Record<string, any[]> = {};
        for (const p of props) {
          const snaps = await ctx.db
            .query("propSnapshots")
            .withIndex("by_propId", (q) => q.eq("propId", p._id))
            .collect();
          snapMap[String(p._id)] = snaps.sort((a, b) => a.timestamp - b.timestamp);
        }
        return snapMap;
      })(),
      predictionHistory: playerPredictions,
      resultHistory: results.sort((a, b) => b.pickedAt - a.pickedAt).slice(0, 20),
      dataSource: "demo",
    };
  },
});

// Line movement for a specific prop
export const lineMovement = query({
  args: { propId: v.string() },
  returns: v.any(),
  handler: async (ctx, { propId }) => {
    // Validate propId by querying propSnapshots
    const allSnapshots = await ctx.db.query("propSnapshots").collect();
    const snapshots = allSnapshots.filter((s) => String(s.propId) === propId);
    return snapshots.sort((a, b) => a.timestamp - b.timestamp);
  },
});

// Search players
export const searchPlayers = query({
  args: { searchTerm: v.string() },
  returns: v.any(),
  handler: async (ctx, { searchTerm }) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const allPlayers = await ctx.db.query("players").collect();
    return allPlayers
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10);
  },
});
