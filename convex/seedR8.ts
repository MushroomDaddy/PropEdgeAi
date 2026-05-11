import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seeds Results Tracking, Player Game Logs, Model Predictions, Prop Snapshots
 * All data is DEMO — marked with dataSource: "demo"
 */
export const seedResultsAndIntel = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get existing data to build from
    const props = await ctx.db.query("props").collect();
    const players = await ctx.db.query("players").collect();
    const users = await ctx.db.query("users").collect();
    if (users.length === 0 || props.length === 0 || players.length === 0) return null;

    // Clear previous R8 data
    for (const r of await ctx.db.query("pickResults").collect()) await ctx.db.delete(r._id);
    for (const s of await ctx.db.query("propSnapshots").collect()) await ctx.db.delete(s._id);
    for (const l of await ctx.db.query("playerGameLogs").collect()) await ctx.db.delete(l._id);
    for (const m of await ctx.db.query("modelPredictions").collect()) await ctx.db.delete(m._id);

    const now = Date.now();
    const DAY = 86400000;

    // ─── 1. PICK RESULTS (50 graded + 10 pending) ───
    const statuses: Array<"won" | "lost" | "push" | "void" | "pending"> = ["won", "lost", "push", "void", "pending"];
    const resultWeights = [28, 18, 2, 2, 10]; // ~47% win rate on graded
    const resultPool: typeof statuses[number][] = [];
    for (let i = 0; i < statuses.length; i++) {
      for (let j = 0; j < resultWeights[i]; j++) resultPool.push(statuses[i]);
    }

    // Seed results for EVERY user so any logged-in user sees data
    for (const user of users) {
    for (let i = 0; i < 60; i++) {
      const prop = props[i % props.length];
      const status = resultPool[i % resultPool.length];
      const daysAgo = Math.floor(i * 0.5) + 1;
      const pickEdge = prop.edge + (Math.random() * 4 - 2);
      const pickModelProb = prop.modelProb || 55;
      const pickMarketImplied = prop.marketImpliedProb || 50;
      const actualStat = status === "pending" ? undefined
        : status === "won" ? (prop.overUnder === "over" ? prop.line + 2 + Math.random() * 5 : prop.line - 2 - Math.random() * 3)
        : status === "lost" ? (prop.overUnder === "over" ? prop.line - 1 - Math.random() * 3 : prop.line + 1 + Math.random() * 3)
        : prop.line; // push
      const closingLine = status !== "pending" ? prop.line + (Math.random() * 2 - 1) : undefined;
      const clv = closingLine !== undefined ? Math.round((prop.line - closingLine) * (prop.overUnder === "over" ? 1 : -1) * 10) / 10 : undefined;
      const roi = status === "won" ? Math.round((80 + Math.random() * 40) * 10) / 10
        : status === "lost" ? -100
        : 0;

      await ctx.db.insert("pickResults", {
        userId: user._id,
        playerName: prop.playerName,
        statType: prop.statType,
        sport: prop.sport,
        platform: prop.platform,
        propType: prop.propType || "over_under",
        pickLine: prop.line,
        pickProjection: prop.projection,
        pickEdge: Math.round(pickEdge * 10) / 10,
        pickModelProb: Math.round(pickModelProb),
        pickMarketImpliedProb: Math.round(pickMarketImplied),
        overUnder: prop.overUnder,
        pickedAt: now - daysAgo * DAY + Math.random() * DAY * 0.5,
        resultStatus: status,
        actualStat: actualStat !== undefined ? Math.round(actualStat * 10) / 10 : undefined,
        closingLine,
        closingOdds: closingLine !== undefined ? -110 + Math.round(Math.random() * 20 - 10) : undefined,
        clv,
        ev: Math.round(pickEdge * 1.5 * 10) / 10,
        roi: status !== "pending" ? roi : undefined,
        gradedAt: status !== "pending" ? now - (daysAgo - 0.5) * DAY : undefined,
        dataSource: "demo",
      });
    }
    } // end for each user

    // ─── 2. PROP SNAPSHOTS (line movement for each prop) ───
    for (const prop of props.slice(0, 30)) {
      const baseTs = now - 3 * DAY;
      const lineJitter = () => Math.round((Math.random() * 1.5 - 0.75) * 10) / 10;
      const edgeJitter = () => Math.round((Math.random() * 3 - 1.5) * 10) / 10;

      // Opening
      await ctx.db.insert("propSnapshots", {
        propId: prop._id,
        playerName: prop.playerName,
        statType: prop.statType,
        line: prop.line + lineJitter() * 2,
        projection: prop.projection - 0.5 + Math.random(),
        edge: prop.edge + edgeJitter(),
        modelProb: prop.modelProb,
        marketImpliedProb: (prop.marketImpliedProb || 50) + Math.round(Math.random() * 4 - 2),
        odds: -110,
        snapshotType: "opening",
        timestamp: baseTs,
        dataSource: "demo",
      });

      // 3-4 update snapshots
      const numUpdates = 3 + Math.floor(Math.random() * 2);
      for (let u = 1; u <= numUpdates; u++) {
        await ctx.db.insert("propSnapshots", {
          propId: prop._id,
          playerName: prop.playerName,
          statType: prop.statType,
          line: prop.line + lineJitter(),
          projection: prop.projection + (Math.random() * 0.8 - 0.4),
          edge: prop.edge + edgeJitter(),
          modelProb: prop.modelProb,
          marketImpliedProb: prop.marketImpliedProb,
          odds: -110 + Math.round(Math.random() * 10 - 5),
          snapshotType: "update",
          timestamp: baseTs + u * (DAY * 0.5),
          dataSource: "demo",
        });
      }

      // Current
      await ctx.db.insert("propSnapshots", {
        propId: prop._id,
        playerName: prop.playerName,
        statType: prop.statType,
        line: prop.line,
        projection: prop.projection,
        edge: prop.edge,
        modelProb: prop.modelProb,
        marketImpliedProb: prop.marketImpliedProb,
        odds: -110,
        snapshotType: "current",
        timestamp: now,
        dataSource: "demo",
      });
    }

    // ─── 3. PLAYER GAME LOGS (last 15 games per player) ───
    const opponents: Record<string, string[]> = {
      NBA: ["Lakers", "Warriors", "Nets", "Heat", "Bucks", "76ers", "Suns", "Nuggets", "Celtics", "Knicks"],
      NFL: ["Chiefs", "Bills", "49ers", "Cowboys", "Eagles", "Ravens", "Dolphins", "Lions", "Bengals", "Packers"],
      MLB: ["Yankees", "Dodgers", "Braves", "Astros", "Phillies", "Padres", "Mets", "Rangers", "Orioles", "Twins"],
      NHL: ["Panthers", "Oilers", "Stars", "Rangers", "Bruins", "Avalanche", "Hurricanes", "Jets", "Canucks", "Kings"],
    };

    for (const player of players) {
      const sportOpps = opponents[player.sport] || opponents.NBA;
      const isBball = player.sport === "NBA";
      const isFootball = player.sport === "NFL";
      const isBaseball = player.sport === "MLB";
      const isHockey = player.sport === "NHL";

      for (let g = 0; g < 15; g++) {
        const opp = sportOpps[(g + player.name.length) % sportOpps.length];
        const ha = g % 3 === 0 ? "away" : "home";
        const basePoints = isBball ? (player.seasonAvg?.points || 20) : isFootball ? 15 : isBaseball ? 1.5 : 0.8;
        const variance = isBball ? 8 : isFootball ? 10 : isBaseball ? 1.5 : 1;

        await ctx.db.insert("playerGameLogs", {
          playerId: player._id,
          playerName: player.name,
          sport: player.sport,
          team: player.team,
          opponent: opp,
          gameDate: now - (g + 1) * (isBball ? 2 * DAY : isFootball ? 7 * DAY : 1.5 * DAY),
          homeAway: ha,
          points: isBball ? Math.round(basePoints + (Math.random() * variance * 2 - variance)) : isHockey ? Math.floor(Math.random() * 3) : undefined,
          rebounds: isBball ? Math.round((player.seasonAvg?.rebounds || 5) + (Math.random() * 4 - 2)) : undefined,
          assists: isBball ? Math.round((player.seasonAvg?.assists || 4) + (Math.random() * 4 - 2)) : undefined,
          steals: isBball ? Math.floor(Math.random() * 3) : undefined,
          blocks: isBball ? Math.floor(Math.random() * 2) : undefined,
          turnovers: isBball ? Math.floor(Math.random() * 4) : undefined,
          threePointers: isBball ? Math.floor(Math.random() * 5) : undefined,
          minutes: isBball ? Math.round(28 + Math.random() * 12) : undefined,
          fg: isBball ? `${Math.floor(5 + Math.random() * 7)}/${Math.floor(12 + Math.random() * 10)}` : undefined,
          hits: isBaseball ? Math.floor(Math.random() * 4) : undefined,
          rbi: isBaseball ? Math.floor(Math.random() * 3) : undefined,
          runs: isBaseball ? Math.floor(Math.random() * 3) : undefined,
          strikeoutsP: isBaseball && player.position === "P" ? Math.floor(3 + Math.random() * 8) : undefined,
          inningsPitched: isBaseball && player.position === "P" ? Math.round((4 + Math.random() * 4) * 10) / 10 : undefined,
          goals: isHockey ? Math.floor(Math.random() * 3) : undefined,
          shotsOnGoal: isHockey ? Math.floor(2 + Math.random() * 5) : undefined,
          saves: isHockey && player.position === "G" ? Math.floor(20 + Math.random() * 15) : undefined,
          dataSource: "demo",
        });
      }
    }

    // ─── 4. MODEL PREDICTIONS (200 predictions with grading) ───
    for (let i = 0; i < 200; i++) {
      const prop = props[i % props.length];
      const modelProb = 50 + Math.random() * 45;
      const marketImplied = modelProb - (2 + Math.random() * 18);
      const edge = modelProb - marketImplied;
      const confBucket = modelProb >= 90 ? "90+" : modelProb >= 80 ? "80-90" : modelProb >= 70 ? "70-80" : modelProb >= 60 ? "60-70" : "50-60";
      const edgeBucket = edge >= 15 ? "15+" : edge >= 10 ? "10-15" : edge >= 5 ? "5-10" : "0-5";
      const daysAgo = Math.floor(i * 0.15) + 1;
      // Higher model prob → higher hit chance (calibrated)
      const hitChance = modelProb / 100 - 0.05 + Math.random() * 0.1;
      const hit = Math.random() < hitChance;
      const actualStat = hit
        ? (prop.overUnder === "over" ? prop.line + 1 + Math.random() * 5 : prop.line - 1 - Math.random() * 3)
        : (prop.overUnder === "over" ? prop.line - 1 - Math.random() * 3 : prop.line + 1 + Math.random() * 3);

      await ctx.db.insert("modelPredictions", {
        propId: prop._id,
        playerName: prop.playerName,
        statType: prop.statType,
        sport: prop.sport,
        platform: prop.platform,
        propType: prop.propType || "over_under",
        line: prop.line,
        modelProb: Math.round(modelProb * 10) / 10,
        marketImpliedProb: Math.round(marketImplied * 10) / 10,
        edge: Math.round(edge * 10) / 10,
        confidenceBucket: confBucket,
        edgeBucket: edgeBucket,
        overUnder: prop.overUnder,
        predictedAt: now - daysAgo * DAY,
        resultStatus: hit ? "won" : "lost",
        actualStat: Math.round(actualStat * 10) / 10,
        hit,
        gradedAt: now - (daysAgo - 0.5) * DAY,
        dataSource: "demo",
      });
    }

    return null;
  },
});
