import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Seed R5: Game detail data (play-by-play, box scores, rosters) + expanded prop types
export const seedGameDetails = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Find live games
    const liveGames = await ctx.db.query("games").withIndex("by_status", q => q.eq("status", "live")).collect();
    
    for (const game of liveGames) {
      if (game.sport === "NBA") {
        // Seed play-by-play
        const homeShort = game.homeTeam.split(" ").pop() || game.homeTeam;
        const awayShort = game.awayTeam.split(" ").pop() || game.awayTeam;
        
        const playByPlay = generateNBAPlayByPlay(game.homeTeam, game.awayTeam, homeShort, awayShort);
        const boxScore = generateNBABoxScore(game.homeTeam, game.awayTeam);
        const roster = generateNBARoster(game.homeTeam, game.awayTeam);
        
        await ctx.db.patch(game._id, {
          playByPlay,
          boxScore,
          roster,
        });
      }
    }

    // Add expanded prop types to existing props
    const allProps = await ctx.db.query("props").collect();
    for (const prop of allProps) {
      if (!prop.propType) {
        await ctx.db.patch(prop._id, { propType: "over_under" });
      }
    }

    // Add diverse prop types
    const firstPlayer = await ctx.db.query("players").first();
    const nbaGames = await ctx.db.query("games").withIndex("by_sport", q => q.eq("sport", "NBA")).collect();
    const nflGames = await ctx.db.query("games").withIndex("by_sport", q => q.eq("sport", "NFL")).collect();
    const mlbGames = await ctx.db.query("games").withIndex("by_sport", q => q.eq("sport", "MLB")).collect();
    const nhlGames = await ctx.db.query("games").withIndex("by_sport", q => q.eq("sport", "NHL")).collect();
    
    if (!firstPlayer) return null;

    // ===== MONEYLINES =====
    const moneylines = [
      ...(nbaGames.length > 0 ? [
        { sport: "NBA", gameId: nbaGames[0]._id, playerName: nbaGames[0].homeTeam, team: nbaGames[0].homeTeam, statType: "Moneyline", line: -180, projection: -200, edge: 5.2, platform: "DraftKings Pick6" },
        { sport: "NBA", gameId: nbaGames[0]._id, playerName: nbaGames[0].awayTeam, team: nbaGames[0].awayTeam, statType: "Moneyline", line: 155, projection: 140, edge: -3.8, platform: "PrizePicks" },
      ] : []),
      ...(nflGames.length > 0 ? [
        { sport: "NFL", gameId: nflGames[0]._id, playerName: nflGames[0].homeTeam, team: nflGames[0].homeTeam, statType: "Moneyline", line: -145, projection: -160, edge: 4.1, platform: "Kalshi" },
        { sport: "NFL", gameId: nflGames[0]._id, playerName: nflGames[0].awayTeam, team: nflGames[0].awayTeam, statType: "Moneyline", line: 125, projection: 110, edge: -6.2, platform: "Kalshi" },
      ] : []),
    ];

    // ===== SPREADS =====
    const spreads = [
      ...(nbaGames.length > 0 ? [
        { sport: "NBA", gameId: nbaGames[0]._id, playerName: nbaGames[0].homeTeam, team: nbaGames[0].homeTeam, statType: "Spread -4.5", line: -4.5, projection: -6.2, edge: 7.8, platform: "PrizePicks" },
        { sport: "NBA", gameId: nbaGames[0]._id, playerName: nbaGames[0].awayTeam, team: nbaGames[0].awayTeam, statType: "Spread +4.5", line: 4.5, projection: 6.2, edge: 7.8, platform: "Underdog" },
      ] : []),
      ...(nflGames.length > 0 ? [
        { sport: "NFL", gameId: nflGames[0]._id, playerName: nflGames[0].homeTeam, team: nflGames[0].homeTeam, statType: "Spread -3.0", line: -3.0, projection: -4.5, edge: 8.1, platform: "DraftKings Pick6" },
      ] : []),
    ];

    // ===== GAME TOTALS =====
    const totals = [
      ...(nbaGames.length > 0 ? [
        { sport: "NBA", gameId: nbaGames[0]._id, playerName: `${nbaGames[0].homeTeam.split(" ").pop()} vs ${nbaGames[0].awayTeam.split(" ").pop()}`, team: nbaGames[0].homeTeam, statType: "Game Total O/U 220.5", line: 220.5, projection: 224.1, edge: 5.4, platform: "PrizePicks" },
      ] : []),
      ...(nflGames.length > 0 ? [
        { sport: "NFL", gameId: nflGames[0]._id, playerName: `${nflGames[0].homeTeam.split(" ").pop()} vs ${nflGames[0].awayTeam.split(" ").pop()}`, team: nflGames[0].homeTeam, statType: "Game Total O/U 48.5", line: 48.5, projection: 51.2, edge: 6.3, platform: "DraftKings Pick6" },
      ] : []),
    ];

    // ===== SPORT-SPECIFIC PROPS =====
    const sportProps = [];
    
    // NBA First Basket, Alt Lines, Double-Double
    if (nbaGames.length > 0) {
      const nbaPlayers = await ctx.db.query("players").withIndex("by_sport", q => q.eq("sport", "NBA")).collect();
      for (let i = 0; i < Math.min(3, nbaPlayers.length); i++) {
        const p = nbaPlayers[i];
        sportProps.push(
          { sport: "NBA", gameId: nbaGames[0]._id, playerName: p.name, team: p.team, statType: "First Basket", line: 0.5, projection: 0.12, edge: 12.5, platform: "PrizePicks", propType: "first_scorer" },
          { sport: "NBA", gameId: nbaGames[0]._id, playerName: p.name, team: p.team, statType: "Alt Points O/U 29.5", line: 29.5, projection: 27.2, edge: -8.1, platform: "Underdog", propType: "alt_line" },
          { sport: "NBA", gameId: nbaGames[0]._id, playerName: p.name, team: p.team, statType: "Double-Double", line: 0.5, projection: 0.65, edge: 15.0, platform: "PrizePicks", propType: "player_special" },
        );
      }
    }

    // NFL TD Scorer, Passing Yards Alt, Rushing Props
    if (nflGames.length > 0) {
      const nflPlayers = await ctx.db.query("players").withIndex("by_sport", q => q.eq("sport", "NFL")).collect();
      for (let i = 0; i < Math.min(3, nflPlayers.length); i++) {
        const p = nflPlayers[i];
        sportProps.push(
          { sport: "NFL", gameId: nflGames[0]._id, playerName: p.name, team: p.team, statType: "Anytime TD Scorer", line: 0.5, projection: 0.72, edge: 9.3, platform: "PrizePicks", propType: "first_scorer" },
          { sport: "NFL", gameId: nflGames[0]._id, playerName: p.name, team: p.team, statType: "Alt Passing Yards O/U 299.5", line: 299.5, projection: 285.0, edge: -5.2, platform: "Underdog", propType: "alt_line" },
          { sport: "NFL", gameId: nflGames[0]._id, playerName: p.name, team: p.team, statType: "Longest Rush O/U 18.5", line: 18.5, projection: 22.1, edge: 11.4, platform: "DraftKings Pick6", propType: "player_special" },
        );
      }
    }

    // MLB Hits, Home Runs, Strikeouts, Stolen Bases
    if (mlbGames.length > 0) {
      const mlbPlayers = await ctx.db.query("players").withIndex("by_sport", q => q.eq("sport", "MLB")).collect();
      for (let i = 0; i < Math.min(3, mlbPlayers.length); i++) {
        const p = mlbPlayers[i];
        sportProps.push(
          { sport: "MLB", gameId: mlbGames[0]._id, playerName: p.name, team: p.team, statType: "Hits O/U 1.5", line: 1.5, projection: 1.8, edge: 7.5, platform: "PrizePicks", propType: "over_under" },
          { sport: "MLB", gameId: mlbGames[0]._id, playerName: p.name, team: p.team, statType: "Home Run", line: 0.5, projection: 0.28, edge: 14.2, platform: "Underdog", propType: "first_scorer" },
          { sport: "MLB", gameId: mlbGames[0]._id, playerName: p.name, team: p.team, statType: "Pitcher Strikeouts O/U 6.5", line: 6.5, projection: 7.3, edge: 8.8, platform: "DraftKings Pick6", propType: "over_under" },
          { sport: "MLB", gameId: mlbGames[0]._id, playerName: p.name, team: p.team, statType: "Stolen Bases O/U 0.5", line: 0.5, projection: 0.7, edge: 18.0, platform: "PrizePicks", propType: "over_under" },
        );
      }
    }

    // NHL Shots on Goal, Goals, Saves
    if (nhlGames.length > 0) {
      const nhlPlayers = await ctx.db.query("players").withIndex("by_sport", q => q.eq("sport", "NHL")).collect();
      for (let i = 0; i < Math.min(3, nhlPlayers.length); i++) {
        const p = nhlPlayers[i];
        sportProps.push(
          { sport: "NHL", gameId: nhlGames[0]._id, playerName: p.name, team: p.team, statType: "Shots on Goal O/U 3.5", line: 3.5, projection: 4.1, edge: 9.2, platform: "PrizePicks", propType: "over_under" },
          { sport: "NHL", gameId: nhlGames[0]._id, playerName: p.name, team: p.team, statType: "Anytime Goal Scorer", line: 0.5, projection: 0.35, edge: 11.5, platform: "Underdog", propType: "first_scorer" },
          { sport: "NHL", gameId: nhlGames[0]._id, playerName: p.name, team: p.team, statType: "Goalie Saves O/U 28.5", line: 28.5, projection: 31.2, edge: 6.4, platform: "DraftKings Pick6", propType: "over_under" },
        );
      }
    }

    // Insert all new props
    const allNewProps = [...moneylines, ...spreads, ...totals];
    for (const np of allNewProps) {
      const conf = Math.min(92, Math.max(35, Math.round(55 + Math.abs(np.edge) * 1.5)));
      await ctx.db.insert("props", {
        playerId: firstPlayer._id,
        gameId: np.gameId,
        sport: np.sport,
        playerName: np.playerName,
        team: np.team,
        statType: np.statType,
        line: np.line,
        projection: np.projection,
        projectionSources: [{ source: "Consensus", value: np.projection }, { source: "Model", value: np.projection * 1.02 }],
        platform: np.platform,
        edge: np.edge,
        confidence: conf,
        hitRate: Math.round(50 + np.edge * 0.8),
        overUnder: np.edge > 0 ? "over" : "under",
        propType: np.statType.includes("Moneyline") ? "moneyline" : np.statType.includes("Spread") ? "spread" : "total",
        variance: 8,
        matchupRating: 6,
        bustRisk: Math.round(40 - Math.abs(np.edge) * 0.5),
        projectionConsensus: { avg: np.projection, numSources: 2, numOverLine: np.edge > 0 ? 2 : 0, spread: 2 },
      });
    }

    for (const sp of sportProps) {
      const conf = Math.min(90, Math.max(30, Math.round(50 + Math.abs(sp.edge) * 1.2)));
      await ctx.db.insert("props", {
        playerId: firstPlayer._id,
        gameId: sp.gameId,
        sport: sp.sport,
        playerName: sp.playerName,
        team: sp.team,
        statType: sp.statType,
        line: sp.line,
        projection: sp.projection,
        projectionSources: [{ source: "Consensus", value: sp.projection }],
        platform: sp.platform,
        edge: sp.edge,
        confidence: conf,
        hitRate: Math.round(50 + sp.edge * 0.6),
        overUnder: sp.edge > 0 ? "over" : "under",
        propType: sp.propType,
        variance: 10,
        matchupRating: 5,
        bustRisk: Math.round(45 - Math.abs(sp.edge) * 0.3),
      });
    }

    return null;
  },
});

function generateNBAPlayByPlay(home: string, away: string, homeShort: string, awayShort: string) {
  const plays = [
    { time: "12:00", quarter: "Q1", description: `${awayShort} wins the tip, ${away} ball`, team: away, type: "other" as const },
    { time: "11:42", quarter: "Q1", description: `J. Butler drives left, layup GOOD`, team: away, type: "score" as const, points: 2 },
    { time: "11:18", quarter: "Q1", description: `J. Tatum 3-pointer from the wing — SPLASH!`, team: home, type: "score" as const, points: 3 },
    { time: "10:55", quarter: "Q1", description: `B. Adebayo offensive rebound and putback`, team: away, type: "score" as const, points: 2 },
    { time: "10:30", quarter: "Q1", description: `D. White steal, coast-to-coast layup`, team: home, type: "score" as const, points: 2 },
    { time: "10:01", quarter: "Q1", description: `T. Herro step-back three — BANG!`, team: away, type: "score" as const, points: 3 },
    { time: "9:44", quarter: "Q1", description: `J. Brown mid-range jumper is good`, team: home, type: "score" as const, points: 2 },
    { time: "9:22", quarter: "Q1", description: `Loose ball foul on ${homeShort}`, team: home, type: "foul" as const },
    { time: "9:01", quarter: "Q1", description: `J. Butler free throw 1 of 2 — GOOD`, team: away, type: "score" as const, points: 1 },
    { time: "9:00", quarter: "Q1", description: `J. Butler free throw 2 of 2 — GOOD`, team: away, type: "score" as const, points: 1 },
    { time: "8:35", quarter: "Q1", description: `K. Porzingis alley-oop slam!`, team: home, type: "score" as const, points: 2 },
    { time: "8:11", quarter: "Q1", description: `${away} timeout`, team: away, type: "timeout" as const },
    { time: "7:55", quarter: "Q1", description: `T. Herro pull-up three... no good, rebound ${homeShort}`, team: away, type: "other" as const },
    { time: "7:30", quarter: "Q1", description: `J. Tatum drives, kick out to D. White — THREE! 💦`, team: home, type: "score" as const, points: 3 },
    { time: "7:05", quarter: "Q1", description: `B. Adebayo hook shot from the post`, team: away, type: "score" as const, points: 2 },
    { time: "6:40", quarter: "Q2", description: `Substitution: M. Smart checks in for D. White`, team: home, type: "substitution" as const },
    { time: "6:22", quarter: "Q2", description: `J. Brown drives, foul drawn, and-one!`, team: home, type: "score" as const, points: 3 },
    { time: "5:55", quarter: "Q2", description: `C. Martin corner three — GOOD`, team: away, type: "score" as const, points: 3 },
    { time: "5:30", quarter: "Q2", description: `K. Porzingis blocks Adebayo at the rim!`, team: home, type: "other" as const },
    { time: "5:08", quarter: "Q2", description: `J. Tatum contested mid-range fadeaway — GOOD. He's cooking 🔥`, team: home, type: "score" as const, points: 2 },
    { time: "4:42", quarter: "Q2", description: `Turnover: J. Butler bad pass, stolen by Brown`, team: away, type: "turnover" as const },
    { time: "4:20", quarter: "Q2", description: `Fast break — Brown to Tatum, SLAM DUNK!`, team: home, type: "score" as const, points: 2 },
    { time: "3:55", quarter: "Q2", description: `T. Herro floater in the lane — good`, team: away, type: "score" as const, points: 2 },
    { time: "3:30", quarter: "Q2", description: `${away} challenge: foul call overturned`, team: away, type: "other" as const },
    { time: "3:01", quarter: "Q2", description: `J. Butler pull-up jumper — rattles in!`, team: away, type: "score" as const, points: 2 },
    { time: "2:30", quarter: "Q3", description: `D. White three from the top of the key — GOOD`, team: home, type: "score" as const, points: 3 },
    { time: "2:05", quarter: "Q3", description: `B. Adebayo dunk on the fast break`, team: away, type: "score" as const, points: 2 },
    { time: "1:40", quarter: "Q3", description: `J. Tatum step-back three... SPLASH! He has 22 pts! 🔥`, team: home, type: "score" as const, points: 3 },
    { time: "1:15", quarter: "Q3", description: `T. Herro turnover — bad pass out of bounds`, team: away, type: "turnover" as const },
    { time: "0:50", quarter: "Q3", description: `J. Brown drives right, finishes through contact`, team: home, type: "score" as const, points: 2 },
  ];
  return plays;
}

function generateNBABoxScore(_home: string, _away: string) { void _home; void _away;
  return {
    home: [
      { name: "J. Tatum", position: "SF", minutes: 28, points: 22, rebounds: 6, assists: 4, steals: 1, blocks: 0, turnovers: 2, fg: "8-15", threePt: "4-7", ft: "2-2", plusMinus: 8 },
      { name: "J. Brown", position: "SG", minutes: 26, points: 16, rebounds: 4, assists: 3, steals: 2, blocks: 0, turnovers: 1, fg: "6-12", threePt: "2-4", ft: "2-3", plusMinus: 6 },
      { name: "K. Porzingis", position: "C", minutes: 24, points: 12, rebounds: 8, assists: 1, steals: 0, blocks: 3, turnovers: 1, fg: "5-9", threePt: "1-3", ft: "1-2", plusMinus: 10 },
      { name: "D. White", position: "PG", minutes: 22, points: 11, rebounds: 2, assists: 5, steals: 3, blocks: 0, turnovers: 0, fg: "4-8", threePt: "3-5", ft: "0-0", plusMinus: 7 },
      { name: "A. Horford", position: "PF", minutes: 20, points: 6, rebounds: 7, assists: 2, steals: 0, blocks: 1, turnovers: 1, fg: "3-6", threePt: "0-2", ft: "0-0", plusMinus: 4 },
      { name: "M. Smart", position: "PG", minutes: 12, points: 4, rebounds: 1, assists: 3, steals: 1, blocks: 0, turnovers: 2, fg: "2-5", threePt: "0-2", ft: "0-0", plusMinus: -1 },
      { name: "S. Hauser", position: "SF", minutes: 8, points: 3, rebounds: 1, assists: 0, steals: 0, blocks: 0, turnovers: 0, fg: "1-3", threePt: "1-2", ft: "0-0", plusMinus: 2 },
    ],
    away: [
      { name: "J. Butler", position: "SF", minutes: 28, points: 18, rebounds: 5, assists: 6, steals: 1, blocks: 0, turnovers: 3, fg: "6-14", threePt: "1-3", ft: "5-6", plusMinus: -4 },
      { name: "T. Herro", position: "SG", minutes: 26, points: 15, rebounds: 2, assists: 3, steals: 0, blocks: 0, turnovers: 2, fg: "5-13", threePt: "3-7", ft: "2-2", plusMinus: -6 },
      { name: "B. Adebayo", position: "C", minutes: 26, points: 14, rebounds: 9, assists: 2, steals: 0, blocks: 2, turnovers: 1, fg: "7-11", threePt: "0-0", ft: "0-1", plusMinus: -3 },
      { name: "C. Martin", position: "PF", minutes: 22, points: 8, rebounds: 3, assists: 1, steals: 1, blocks: 0, turnovers: 0, fg: "3-7", threePt: "2-4", ft: "0-0", plusMinus: -7 },
      { name: "K. Lowry", position: "PG", minutes: 20, points: 5, rebounds: 2, assists: 4, steals: 0, blocks: 0, turnovers: 2, fg: "2-6", threePt: "1-3", ft: "0-0", plusMinus: -5 },
      { name: "D. Robinson", position: "SG", minutes: 10, points: 3, rebounds: 0, assists: 1, steals: 0, blocks: 0, turnovers: 0, fg: "1-4", threePt: "1-3", ft: "0-0", plusMinus: 1 },
      { name: "H. Highsmith", position: "PF", minutes: 8, points: 2, rebounds: 2, assists: 0, steals: 0, blocks: 1, turnovers: 0, fg: "1-2", threePt: "0-0", ft: "0-0", plusMinus: -2 },
    ],
  };
}

function generateNBARoster(_home: string, _away: string) { void _home; void _away;
  return {
    home: {
      active: ["J. Tatum", "J. Brown", "K. Porzingis", "D. White", "A. Horford", "M. Smart", "S. Hauser", "P. Pritchard", "L. Kornet", "D. Gallinari"],
      out: [
        { name: "R. Williams III", reason: "Knee — Out" },
        { name: "J. Walsh", reason: "G-League assignment" },
      ],
    },
    away: {
      active: ["J. Butler", "T. Herro", "B. Adebayo", "C. Martin", "K. Lowry", "D. Robinson", "H. Highsmith", "J. Jovic", "O. Yurtseven"],
      out: [
        { name: "J. Cain", reason: "Ankle — Out" },
        { name: "N. Jovic", reason: "Knee — Questionable (DNP)" },
        { name: "D. Dedmon", reason: "Plantar Fasciitis — Out" },
      ],
    },
  };
}
