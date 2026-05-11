import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("sports").first();
    if (existing) return null;

    // ===== SPORTS =====
    const sportsData = [
      { name: "NFL", slug: "nfl", icon: "🏈", active: true },
      { name: "NBA", slug: "nba", icon: "🏀", active: true },
      { name: "MLB", slug: "mlb", icon: "⚾", active: true },
      { name: "NHL", slug: "nhl", icon: "🏒", active: true },
      { name: "CFB", slug: "cfb", icon: "🏈", active: true },
      { name: "Soccer", slug: "soccer", icon: "⚽", active: true },
      { name: "Tennis", slug: "tennis", icon: "🎾", active: false },
      { name: "Esports", slug: "esports", icon: "🎮", active: false },
    ];
    for (const s of sportsData) {
      await ctx.db.insert("sports", s);
    }

    // ===== GAMES =====
    const now = Date.now();
    const hour = 3600000;
    const min = 60000;

    const nbaGames = [
      { sport: "NBA", homeTeam: "Boston Celtics", awayTeam: "Miami Heat", gameTime: now - 45 * min, status: "live", homeScore: 58, awayScore: 52, venue: "TD Garden", quarter: "Q3", gameClock: "8:42", broadcast: "ESPN" },
      { sport: "NBA", homeTeam: "Denver Nuggets", awayTeam: "LA Lakers", gameTime: now + 2 * hour, status: "upcoming", venue: "Ball Arena", broadcast: "TNT" },
      { sport: "NBA", homeTeam: "Phoenix Suns", awayTeam: "Golden State Warriors", gameTime: now + 3.5 * hour, status: "upcoming", venue: "Footprint Center", broadcast: "NBA TV" },
      { sport: "NBA", homeTeam: "Milwaukee Bucks", awayTeam: "Philadelphia 76ers", gameTime: now - 20 * min, status: "live", homeScore: 34, awayScore: 29, venue: "Fiserv Forum", quarter: "Q2", gameClock: "4:15", broadcast: "ESPN" },
      { sport: "NBA", homeTeam: "Dallas Mavericks", awayTeam: "Minnesota Timberwolves", gameTime: now + 4 * hour, status: "upcoming", venue: "American Airlines Center", broadcast: "TNT" },
    ];

    const nflGames = [
      { sport: "NFL", homeTeam: "Kansas City Chiefs", awayTeam: "Buffalo Bills", gameTime: now + 24 * hour, status: "upcoming", venue: "Arrowhead Stadium", broadcast: "CBS" },
      { sport: "NFL", homeTeam: "San Francisco 49ers", awayTeam: "Dallas Cowboys", gameTime: now + 28 * hour, status: "upcoming", venue: "Levi's Stadium", broadcast: "FOX" },
      { sport: "NFL", homeTeam: "Philadelphia Eagles", awayTeam: "Detroit Lions", gameTime: now + 26 * hour, status: "upcoming", venue: "Lincoln Financial Field", broadcast: "FOX" },
    ];

    const mlbGames = [
      { sport: "MLB", homeTeam: "NY Yankees", awayTeam: "Boston Red Sox", gameTime: now + 1 * hour, status: "upcoming", venue: "Yankee Stadium", broadcast: "YES" },
      { sport: "MLB", homeTeam: "LA Dodgers", awayTeam: "SF Giants", gameTime: now + 5 * hour, status: "upcoming", venue: "Dodger Stadium", broadcast: "SportsNet LA" },
      { sport: "MLB", homeTeam: "Atlanta Braves", awayTeam: "NY Mets", gameTime: now + 2 * hour, status: "upcoming", venue: "Truist Park", broadcast: "Bally Sports" },
    ];

    const nhlGames = [
      { sport: "NHL", homeTeam: "Edmonton Oilers", awayTeam: "Florida Panthers", gameTime: now + 3 * hour, status: "upcoming", venue: "Rogers Place", broadcast: "ESPN" },
      { sport: "NHL", homeTeam: "NY Rangers", awayTeam: "Carolina Hurricanes", gameTime: now + 2.5 * hour, status: "upcoming", venue: "Madison Square Garden", broadcast: "TNT" },
    ];

    const allGames = [...nbaGames, ...nflGames, ...mlbGames, ...nhlGames];
    const gameIds: Record<string, any> = {};
    for (const g of allGames) {
      const id = await ctx.db.insert("games", g as any);
      gameIds[`${g.homeTeam} vs ${g.awayTeam}`] = id;
    }

    // ===== PLAYERS =====
    const projSources = ["FantasyLabs", "Rotowire", "NumberFire", "ESPN", "SaberSim"];

    const nbaPlayers = [
      { name: "Jayson Tatum", team: "Boston Celtics", position: "SF", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 27.2, rebounds: 8.3, assists: 4.7, threePointers: 3.1 },
        last5Avg: { points: 31.4, rebounds: 9.0, assists: 5.2, threePointers: 3.6 } },
      { name: "Jimmy Butler", team: "Miami Heat", position: "SF", sport: "NBA", injuryStatus: "healthy", recentForm: "average",
        seasonAvg: { points: 21.5, rebounds: 5.8, assists: 5.1, threePointers: 1.2 },
        last5Avg: { points: 19.8, rebounds: 6.2, assists: 4.4, threePointers: 0.8 } },
      { name: "Nikola Jokic", team: "Denver Nuggets", position: "C", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 26.4, rebounds: 12.4, assists: 9.0, threePointers: 1.1 },
        last5Avg: { points: 29.2, rebounds: 13.8, assists: 10.4, threePointers: 1.4 } },
      { name: "LeBron James", team: "LA Lakers", position: "SF", sport: "NBA", injuryStatus: "healthy", recentForm: "average",
        seasonAvg: { points: 25.7, rebounds: 7.3, assists: 8.3, threePointers: 2.1 },
        last5Avg: { points: 23.6, rebounds: 7.8, assists: 8.0, threePointers: 1.8 } },
      { name: "Kevin Durant", team: "Phoenix Suns", position: "SF", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 27.1, rebounds: 6.6, assists: 5.2, threePointers: 2.1 },
        last5Avg: { points: 29.8, rebounds: 7.0, assists: 5.8, threePointers: 2.6 } },
      { name: "Stephen Curry", team: "Golden State Warriors", position: "PG", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 26.4, rebounds: 4.5, assists: 5.1, threePointers: 4.6 },
        last5Avg: { points: 30.2, rebounds: 5.0, assists: 6.2, threePointers: 5.4 } },
      { name: "Giannis Antetokounmpo", team: "Milwaukee Bucks", position: "PF", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 31.1, rebounds: 11.8, assists: 5.7, threePointers: 0.8 },
        last5Avg: { points: 33.6, rebounds: 12.4, assists: 6.2, threePointers: 1.0 } },
      { name: "Joel Embiid", team: "Philadelphia 76ers", position: "C", sport: "NBA", injuryStatus: "questionable", recentForm: "cold",
        seasonAvg: { points: 23.4, rebounds: 8.8, assists: 3.7, threePointers: 1.0 },
        last5Avg: { points: 18.6, rebounds: 7.2, assists: 3.0, threePointers: 0.6 } },
      { name: "Luka Doncic", team: "Dallas Mavericks", position: "PG", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 33.9, rebounds: 9.2, assists: 9.8, threePointers: 4.1 },
        last5Avg: { points: 36.4, rebounds: 10.0, assists: 10.6, threePointers: 4.8 } },
      { name: "Anthony Edwards", team: "Minnesota Timberwolves", position: "SG", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 25.9, rebounds: 5.4, assists: 5.1, threePointers: 3.2 },
        last5Avg: { points: 28.2, rebounds: 5.8, assists: 5.6, threePointers: 3.8 } },
      { name: "Jaylen Brown", team: "Boston Celtics", position: "SG", sport: "NBA", injuryStatus: "healthy", recentForm: "average",
        seasonAvg: { points: 23.0, rebounds: 5.5, assists: 3.6, threePointers: 2.2 },
        last5Avg: { points: 24.8, rebounds: 5.2, assists: 3.8, threePointers: 2.6 } },
      { name: "Bam Adebayo", team: "Miami Heat", position: "C", sport: "NBA", injuryStatus: "healthy", recentForm: "average",
        seasonAvg: { points: 19.3, rebounds: 10.2, assists: 3.9, threePointers: 0.2 },
        last5Avg: { points: 20.6, rebounds: 11.4, assists: 4.2, threePointers: 0.2 } },
      { name: "Jamal Murray", team: "Denver Nuggets", position: "PG", sport: "NBA", injuryStatus: "healthy", recentForm: "average",
        seasonAvg: { points: 21.2, rebounds: 4.0, assists: 6.5, threePointers: 2.8 },
        last5Avg: { points: 23.4, rebounds: 4.4, assists: 7.0, threePointers: 3.2 } },
      { name: "Anthony Davis", team: "LA Lakers", position: "PF", sport: "NBA", injuryStatus: "doubtful", recentForm: "cold",
        seasonAvg: { points: 24.7, rebounds: 12.6, assists: 3.5, threePointers: 0.5 },
        last5Avg: { points: 19.2, rebounds: 10.8, assists: 2.8, threePointers: 0.4 } },
      { name: "Devin Booker", team: "Phoenix Suns", position: "SG", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 27.1, rebounds: 4.5, assists: 6.9, threePointers: 2.4 },
        last5Avg: { points: 29.6, rebounds: 4.8, assists: 7.4, threePointers: 2.8 } },
      { name: "Khris Middleton", team: "Milwaukee Bucks", position: "SF", sport: "NBA", injuryStatus: "healthy", recentForm: "average",
        seasonAvg: { points: 17.6, rebounds: 4.4, assists: 4.8, threePointers: 2.0 },
        last5Avg: { points: 18.2, rebounds: 4.0, assists: 5.2, threePointers: 2.2 } },
      { name: "Tyrese Maxey", team: "Philadelphia 76ers", position: "PG", sport: "NBA", injuryStatus: "healthy", recentForm: "hot",
        seasonAvg: { points: 25.9, rebounds: 3.7, assists: 6.2, threePointers: 3.0 },
        last5Avg: { points: 28.4, rebounds: 4.0, assists: 6.8, threePointers: 3.6 } },
    ];

    const nflPlayers = [
      { name: "Patrick Mahomes", team: "Kansas City Chiefs", position: "QB", sport: "NFL", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Josh Allen", team: "Buffalo Bills", position: "QB", sport: "NFL", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Travis Kelce", team: "Kansas City Chiefs", position: "TE", sport: "NFL", injuryStatus: "healthy", recentForm: "average" },
      { name: "Stefon Diggs", team: "Buffalo Bills", position: "WR", sport: "NFL", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Brock Purdy", team: "San Francisco 49ers", position: "QB", sport: "NFL", injuryStatus: "healthy", recentForm: "hot" },
      { name: "CeeDee Lamb", team: "Dallas Cowboys", position: "WR", sport: "NFL", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Jalen Hurts", team: "Philadelphia Eagles", position: "QB", sport: "NFL", injuryStatus: "healthy", recentForm: "average" },
      { name: "Jahmyr Gibbs", team: "Detroit Lions", position: "RB", sport: "NFL", injuryStatus: "healthy", recentForm: "hot" },
    ];

    const mlbPlayers = [
      { name: "Aaron Judge", team: "NY Yankees", position: "OF", sport: "MLB", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Shohei Ohtani", team: "LA Dodgers", position: "DH", sport: "MLB", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Mookie Betts", team: "LA Dodgers", position: "SS", sport: "MLB", injuryStatus: "healthy", recentForm: "average" },
      { name: "Ronald Acuna Jr.", team: "Atlanta Braves", position: "OF", sport: "MLB", injuryStatus: "questionable", recentForm: "cold" },
      { name: "Gerrit Cole", team: "NY Yankees", position: "SP", sport: "MLB", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Rafael Devers", team: "Boston Red Sox", position: "3B", sport: "MLB", injuryStatus: "healthy", recentForm: "hot" },
    ];

    const nhlPlayers = [
      { name: "Connor McDavid", team: "Edmonton Oilers", position: "C", sport: "NHL", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Aleksander Barkov", team: "Florida Panthers", position: "C", sport: "NHL", injuryStatus: "healthy", recentForm: "average" },
      { name: "Artemi Panarin", team: "NY Rangers", position: "LW", sport: "NHL", injuryStatus: "healthy", recentForm: "hot" },
      { name: "Sebastian Aho", team: "Carolina Hurricanes", position: "C", sport: "NHL", injuryStatus: "healthy", recentForm: "average" },
    ];

    const allPlayers = [...nbaPlayers, ...nflPlayers, ...mlbPlayers, ...nhlPlayers];

    const statTypes: Record<string, { type: string; baseLine: number; variance: number; correlatedWith: string[] }[]> = {
      NBA: [
        { type: "Points", baseLine: 24, variance: 6, correlatedWith: ["Pts+Reb+Ast", "Fantasy Points"] },
        { type: "Rebounds", baseLine: 8, variance: 3, correlatedWith: ["Pts+Reb+Ast"] },
        { type: "Assists", baseLine: 6, variance: 2.5, correlatedWith: ["Pts+Reb+Ast"] },
        { type: "3-Pointers", baseLine: 2.5, variance: 1.2, correlatedWith: ["Points"] },
        { type: "Pts+Reb+Ast", baseLine: 38, variance: 8, correlatedWith: ["Points", "Rebounds", "Assists"] },
        { type: "Steals+Blocks", baseLine: 2.0, variance: 1.0, correlatedWith: [] },
      ],
      NFL: [
        { type: "Passing Yards", baseLine: 265, variance: 55, correlatedWith: ["Passing TDs", "Fantasy Points"] },
        { type: "Passing TDs", baseLine: 2.0, variance: 0.8, correlatedWith: ["Passing Yards"] },
        { type: "Rushing Yards", baseLine: 55, variance: 22, correlatedWith: ["Fantasy Points"] },
        { type: "Receiving Yards", baseLine: 68, variance: 25, correlatedWith: ["Receptions"] },
        { type: "Receptions", baseLine: 5.5, variance: 2.0, correlatedWith: ["Receiving Yards"] },
        { type: "Fantasy Points", baseLine: 18, variance: 7, correlatedWith: ["Passing Yards", "Rushing Yards"] },
      ],
      MLB: [
        { type: "Hits+Runs+RBIs", baseLine: 2.5, variance: 1.5, correlatedWith: ["Total Bases"] },
        { type: "Total Bases", baseLine: 2.0, variance: 1.3, correlatedWith: ["Hits+Runs+RBIs", "Home Runs"] },
        { type: "Strikeouts (P)", baseLine: 6.5, variance: 2.0, correlatedWith: [] },
        { type: "Hits Allowed", baseLine: 5.5, variance: 2.0, correlatedWith: [] },
        { type: "Home Runs", baseLine: 0.5, variance: 0.4, correlatedWith: ["Total Bases"] },
      ],
      NHL: [
        { type: "Shots on Goal", baseLine: 3.5, variance: 1.5, correlatedWith: ["Goals", "Points"] },
        { type: "Points", baseLine: 1.0, variance: 0.6, correlatedWith: ["Assists", "Goals"] },
        { type: "Assists", baseLine: 0.7, variance: 0.4, correlatedWith: ["Points"] },
        { type: "Goals", baseLine: 0.5, variance: 0.3, correlatedWith: ["Shots on Goal", "Points"] },
        { type: "Blocked Shots", baseLine: 2.0, variance: 1.0, correlatedWith: [] },
      ],
    };

    const platforms = ["PrizePicks", "Underdog", "Sleeper", "DraftKings Pick6", "Kalshi"];

    const dvpRankings: Record<string, number> = {
      "Miami Heat": 8, "Boston Celtics": 25, "LA Lakers": 12, "Denver Nuggets": 22,
      "Golden State Warriors": 15, "Phoenix Suns": 18, "Philadelphia 76ers": 10,
      "Milwaukee Bucks": 20, "Minnesota Timberwolves": 24, "Dallas Mavericks": 14,
    };

    function findGameForPlayer(team: string, sport: string) {
      const game = allGames.find(g => g.sport === sport && (g.homeTeam === team || g.awayTeam === team));
      if (!game) return null;
      return { id: gameIds[`${game.homeTeam} vs ${game.awayTeam}`], game };
    }

    function getOpponentTeam(team: string, game: any): string {
      return game.homeTeam === team ? game.awayTeam : game.homeTeam;
    }

    // Seed all players and their props
    for (const player of allPlayers) {
      const playerId = await ctx.db.insert("players", player as any);
      const result = findGameForPlayer(player.team, player.sport);
      if (!result) continue;
      const { id: gameId, game } = result;

      const sportStats = statTypes[player.sport] || [];
      const numProps = 2 + Math.floor(pseudoRandom(player.name) * 3);
      const shuffledStats = shuffle(sportStats, player.name);

      for (let i = 0; i < Math.min(numProps, shuffledStats.length); i++) {
        const stat = shuffledStats[i];
        const platformIdx = Math.floor(pseudoRandom(player.name + stat.type) * platforms.length);
        const platform = platforms[platformIdx];

        let baseProj = stat.baseLine + (pseudoRandom(player.name + stat.type + "proj") - 0.5) * stat.variance * 2;
        
        if (player.sport === "NBA" && (player as any).last5Avg) {
          const avg = (player as any).last5Avg;
          if (stat.type === "Points" && avg.points) baseProj = avg.points + (pseudoRandom(player.name + "pts") - 0.5) * 3;
          if (stat.type === "Rebounds" && avg.rebounds) baseProj = avg.rebounds + (pseudoRandom(player.name + "reb") - 0.5) * 2;
          if (stat.type === "Assists" && avg.assists) baseProj = avg.assists + (pseudoRandom(player.name + "ast") - 0.5) * 2;
          if (stat.type === "3-Pointers" && avg.threePointers) baseProj = avg.threePointers + (pseudoRandom(player.name + "3pt") - 0.5) * 1;
        }

        const rawLine = Math.round((baseProj + (pseudoRandom(player.name + stat.type + "line") - 0.5) * stat.variance) * 2) / 2;
        const line = Math.max(rawLine, 0.5);
        const projection = Math.round(Math.max(baseProj, 0.1) * 10) / 10;
        // Edge engine: model probability - market implied probability
        // projectionDiff = percentage gap between projection and line (raw stat difference)
        const projectionDiff = Math.round(((projection - line) / line) * 1000) / 10;
        // modelProb: probability the model assigns to hitting the line (based on projection + variance)
        const zScore = (projection - line) / Math.max(stat.variance, 0.5);
        // Approximate normal CDF for model probability
        const modelProb = Math.min(95, Math.max(5, Math.round(50 + (zScore / (1 + Math.abs(zScore) * 0.2)) * 25)));
        // marketImpliedProb: what the market line implies (derived from vig-adjusted pricing)
        const marketImpliedProb = Math.min(85, Math.max(15, Math.round(50 + pseudoRandom(player.name + "mip") * 10 - 5)));
        // True edge = model probability - market implied probability
        const edge = Math.round((modelProb - marketImpliedProb) * 10) / 10;
        const confidence = Math.min(95, Math.max(25, Math.round(50 + edge * 0.3 + pseudoRandom(player.name + "conf") * 20)));
        const hitRate = Math.min(85, Math.max(35, Math.round(55 + projectionDiff * 1.5 + (pseudoRandom(player.name + "hit") - 0.5) * 15)));
        const opponent = getOpponentTeam(player.team, game);
        const dvpRank = dvpRankings[opponent] || (15 + Math.floor(pseudoRandom(player.name + "dvp") * 15));
        const matchupRating = Math.min(10, Math.max(1, Math.round(10 - dvpRank / 3.5 + (pseudoRandom(player.name + "match") - 0.5) * 3)));

        const trendRand = pseudoRandom(player.name + stat.type + "trend");
        const last10Trend = player.recentForm === "hot" ? "up" : player.recentForm === "cold" ? "down" : (trendRand > 0.5 ? "up" : "stable");
        const last10Hits = Math.min(10, Math.max(2, Math.round(5 + projectionDiff * 0.3 + (pseudoRandom(player.name + "l10") - 0.3) * 4)));
        const impliedProb = marketImpliedProb;

        const isKalshi = platform === "Kalshi";
        const kalshiPayout = isKalshi ? {
          yesPayout: Math.round((100 / impliedProb) * 100) / 100,
          noPayout: Math.round((100 / (100 - impliedProb)) * 100) / 100,
        } : undefined;

        const numSources = 3 + Math.floor(pseudoRandom(player.name + stat.type + "src") * 3);
        const sources = [];
        for (let j = 0; j < numSources; j++) {
          sources.push({
            source: projSources[j % projSources.length],
            value: Math.round((projection + (pseudoRandom(player.name + stat.type + `src${j}`) - 0.5) * stat.variance * 0.8) * 10) / 10,
          });
        }

        // R3: Projection consensus
        const srcValues = sources.map(s => s.value);
        const srcAvg = Math.round((srcValues.reduce((a, b) => a + b, 0) / srcValues.length) * 10) / 10;
        const srcSpread = Math.round((Math.max(...srcValues) - Math.min(...srcValues)) * 10) / 10;
        const numOverLine = srcValues.filter(v => v > line).length;

        // R3: Bust risk (0-100)
        const bustRisk = Math.min(95, Math.max(5, Math.round(
          40 
          - edge * 1.2  // negative edge = higher bust
          + stat.variance * 3  // high variance = higher bust
          - matchupRating * 2  // good matchup = lower bust
          + (player.injuryStatus === "questionable" ? 15 : player.injuryStatus === "doubtful" ? 30 : 0)
          + (pseudoRandom(player.name + stat.type + "bust") - 0.5) * 10
        )));

        // R3: Hot/cold streak
        const streakRand = pseudoRandom(player.name + stat.type + "streak");
        let streakType: string;
        let streakGames: number;
        if (player.recentForm === "hot") {
          streakType = "hot";
          streakGames = 3 + Math.floor(streakRand * 6); // 3-8 game hot streak
        } else if (player.recentForm === "cold") {
          streakType = "cold";
          streakGames = 2 + Math.floor(streakRand * 5);
        } else {
          streakType = streakRand > 0.6 ? "hot" : streakRand > 0.3 ? "neutral" : "cold";
          streakGames = 1 + Math.floor(streakRand * 4);
        }
        const streakLabel = streakType === "hot" ? `🔥 ${streakGames}G Hot` : streakType === "cold" ? `❄️ ${streakGames}G Cold` : `➡️ Neutral`;

        // R3: Monte Carlo simulation results
        const simHitRate = Math.min(92, Math.max(12, Math.round(50 + edge * 1.8 + (matchupRating / 10) * 8 + (pseudoRandom(player.name + "mc") - 0.5) * 6)));
        const stdDev = Math.round(stat.variance * (0.8 + pseudoRandom(player.name + "sd") * 0.4) * 10) / 10;
        const p50 = Math.round(projection * 10) / 10;
        const p10 = Math.round((projection - stdDev * 1.28) * 10) / 10;
        const p90 = Math.round((projection + stdDev * 1.28) * 10) / 10;

        // R3: Historical hit rate
        const historicalHit = Math.min(85, Math.max(25, Math.round(hitRate + (pseudoRandom(player.name + "hist") - 0.5) * 10)));
        const histSampleSize = 20 + Math.floor(pseudoRandom(player.name + "histn") * 40);
        const vsTeamHit = Math.min(90, Math.max(20, Math.round(historicalHit + (pseudoRandom(player.name + "vsteam") - 0.5) * 15)));

        await ctx.db.insert("props", {
          playerId,
          gameId,
          sport: player.sport,
          playerName: player.name,
          team: player.team,
          statType: stat.type,
          line,
          projection,
          projectionSources: sources,
          platform,
          edge,
          modelProb,
          marketImpliedProb,
          projectionDiff,
          confidence,
          hitRate,
          overUnder: edge > 0 ? "over" : "under",
          variance: Math.round(stat.variance * 10) / 10,
          matchupRating,
          last10Trend,
          last10Hits,
          dvpRank,
          correlatedWith: stat.correlatedWith,
          impliedProb,
          isKalshiMarket: isKalshi,
          kalshiPayout,
          // R3 new fields
          bustRisk,
          projectionConsensus: {
            avg: srcAvg,
            numSources: sources.length,
            numOverLine,
            spread: srcSpread,
          },
          hotColdStreak: {
            type: streakType,
            games: streakGames,
            label: streakLabel,
          },
          monteCarloSim: {
            simulations: 10000,
            hitRate: simHitRate,
            p10: Math.max(0, p10),
            p50,
            p90,
            stdDev,
          },
          historicalHitRate: {
            similarLines: historicalHit,
            sampleSize: histSampleSize,
            vsTeam: vsTeamHit,
          },
          // Audit: data source tracking
          dataSource: "demo" as const,
          lastUpdated: Date.now(),
          provider: sources[0]?.source || "PropEdge Model",
        });
      }
    }

    // ===== EXTRA KALSHI MARKETS =====
    const celticsMiamiGame = gameIds["Boston Celtics vs Miami Heat"];
    const firstNBAPlayer = await ctx.db.query("players").withIndex("by_sport", q => q.eq("sport", "NBA")).first();
    if (celticsMiamiGame && firstNBAPlayer) {
      const kalshiSpecials = [
        { statType: "Team Total Over 110.5", line: 110.5, projection: 114.2, playerName: "Boston Celtics", team: "Boston Celtics" },
        { statType: "Team Total Over 105.5", line: 105.5, projection: 102.8, playerName: "Miami Heat", team: "Miami Heat" },
        { statType: "Game Total Over 218.5", line: 218.5, projection: 221.4, playerName: "BOS vs MIA", team: "Boston Celtics" },
        { statType: "Spread -5.5", line: 5.5, projection: 6.8, playerName: "Boston Celtics", team: "Boston Celtics" },
        { statType: "1st Quarter Winner", line: 0.5, projection: 0.65, playerName: "Boston Celtics", team: "Boston Celtics" },
      ];
      for (const km of kalshiSpecials) {
        const kalshiProjDiff = Math.round(((km.projection - km.line) / km.line) * 1000) / 10;
        const kalshiZScore = (km.projection - km.line) / 8; // 8 = variance for Kalshi specials
        const kalshiModelProb = Math.min(90, Math.max(10, Math.round(50 + (kalshiZScore / (1 + Math.abs(kalshiZScore) * 0.2)) * 25)));
        const kalshiMarketImplied = Math.min(85, Math.max(20, Math.round(50 + pseudoRandom(km.statType + "kmip") * 10 - 5)));
        const edge = Math.round((kalshiModelProb - kalshiMarketImplied) * 10) / 10;
        const impliedProb = kalshiMarketImplied;
        const simHitRate = Math.min(88, Math.max(18, kalshiModelProb));
        await ctx.db.insert("props", {
          playerId: firstNBAPlayer._id,
          gameId: celticsMiamiGame,
          sport: "NBA",
          playerName: km.playerName,
          team: km.team,
          statType: km.statType,
          line: km.line,
          projection: km.projection,
          projectionSources: [
            { source: "Consensus", value: km.projection },
            { source: "Sharp Model", value: km.projection + (pseudoRandom(km.statType) - 0.5) * 3 },
            { source: "Public Line", value: km.line },
          ],
          platform: "Kalshi",
          edge,
          modelProb: kalshiModelProb,
          marketImpliedProb: kalshiMarketImplied,
          projectionDiff: kalshiProjDiff,
          confidence: Math.min(90, Math.max(30, Math.round(55 + edge * 0.3))),
          hitRate: Math.round(50 + (pseudoRandom(km.statType + "hr") - 0.3) * 20),
          overUnder: edge > 0 ? "over" : "under",
          variance: 8,
          matchupRating: 6,
          last10Trend: "stable",
          last10Hits: 6,
          dvpRank: 15,
          correlatedWith: [],
          impliedProb,
          isKalshiMarket: true,
          kalshiPayout: {
            yesPayout: Math.round((100 / impliedProb) * 100) / 100,
            noPayout: Math.round((100 / (100 - impliedProb)) * 100) / 100,
          },
          bustRisk: Math.min(70, Math.max(15, Math.round(40 - edge * 0.1))),
          projectionConsensus: { avg: km.projection, numSources: 3, numOverLine: edge > 0 ? 2 : 1, spread: 3.5 },
          hotColdStreak: { type: "neutral", games: 0, label: "➡️ Neutral" },
          monteCarloSim: { simulations: 10000, hitRate: simHitRate, p10: km.projection - 8, p50: km.projection, p90: km.projection + 8, stdDev: 6.2 },
          historicalHitRate: { similarLines: Math.round(50 + edge * 0.2), sampleSize: 30, vsTeam: Math.round(50 + edge * 0.25) },
          dataSource: "demo" as const,
          lastUpdated: Date.now(),
          provider: "PropEdge Model",
        });
      }
    }

    // ===== LEADERBOARD =====
    const leaderboardData = [
      { username: "SharpShooter99", avatar: "🎯", winRate: 72.3, totalPicks: 1456, profit: 14230, streak: 8, rank: 1, tier: "diamond" },
      { username: "EdgeLord_DFS", avatar: "⚡", winRate: 69.8, totalPicks: 2103, profit: 11890, streak: 5, rank: 2, tier: "diamond" },
      { username: "PropKing_", avatar: "👑", winRate: 67.4, totalPicks: 987, profit: 9440, streak: 12, rank: 3, tier: "platinum" },
      { username: "StatsMachine", avatar: "🤖", winRate: 66.1, totalPicks: 1834, profit: 8210, streak: 3, rank: 4, tier: "platinum" },
      { username: "MoneyMitch42", avatar: "💰", winRate: 64.9, totalPicks: 756, profit: 7650, streak: 6, rank: 5, tier: "gold" },
      { username: "BetBrain_AI", avatar: "🧠", winRate: 63.2, totalPicks: 1543, profit: 6330, streak: 4, rank: 6, tier: "gold" },
      { username: "PropHunter", avatar: "🔍", winRate: 62.0, totalPicks: 2211, profit: 5890, streak: 2, rank: 7, tier: "gold" },
      { username: "OverUnderKid", avatar: "📊", winRate: 60.7, totalPicks: 1122, profit: 4210, streak: 7, rank: 8, tier: "silver" },
      { username: "DailyGrinder", avatar: "💪", winRate: 59.4, totalPicks: 3045, profit: 3560, streak: 1, rank: 9, tier: "silver" },
      { username: "NerdNumbers", avatar: "🤓", winRate: 58.1, totalPicks: 890, profit: 2340, streak: 3, rank: 10, tier: "silver" },
      { username: "ClutchPicks", avatar: "🎰", winRate: 57.5, totalPicks: 665, profit: 1890, streak: 5, rank: 11, tier: "bronze" },
      { username: "VarianceKing", avatar: "🎲", winRate: 56.2, totalPicks: 1478, profit: 1230, streak: 2, rank: 12, tier: "bronze" },
    ];
    for (const entry of leaderboardData) {
      await ctx.db.insert("leaderboard", entry);
    }

    return null;
  },
});

// ===== SEED BANKROLL DATA (R3) =====
export const seedBankroll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    if (!user) return null;
    
    // Check if already seeded
    const existing = await ctx.db.query("bankroll").withIndex("by_userId", q => q.eq("userId", user._id)).first();
    if (existing) return null;

    const now = Date.now();
    const day = 86400000;

    // Platform bankroll summaries
    const bankrollData = [
      { platform: "PrizePicks", totalDeposited: 500, totalWithdrawn: 200, currentBalance: 842, totalWagered: 1650, totalWon: 1190, totalLost: 460, roi: 23.4, winRate: 64.2, totalEntries: 67, wonEntries: 43, lostEntries: 24, bestWin: 250, worstLoss: 50, currentStreak: 3 },
      { platform: "Underdog", totalDeposited: 300, totalWithdrawn: 100, currentBalance: 487, totalWagered: 980, totalWon: 720, totalLost: 260, roi: 18.7, winRate: 61.5, totalEntries: 52, wonEntries: 32, lostEntries: 20, bestWin: 175, worstLoss: 40, currentStreak: -2 },
      { platform: "Sleeper", totalDeposited: 200, totalWithdrawn: 50, currentBalance: 318, totalWagered: 640, totalWon: 490, totalLost: 150, roi: 27.1, winRate: 67.8, totalEntries: 31, wonEntries: 21, lostEntries: 10, bestWin: 120, worstLoss: 25, currentStreak: 5 },
      { platform: "DraftKings Pick6", totalDeposited: 250, totalWithdrawn: 0, currentBalance: 192, totalWagered: 520, totalWon: 280, totalLost: 240, roi: -8.2, winRate: 52.4, totalEntries: 42, wonEntries: 22, lostEntries: 20, bestWin: 100, worstLoss: 50, currentStreak: -1 },
      { platform: "Kalshi", totalDeposited: 400, totalWithdrawn: 150, currentBalance: 623, totalWagered: 1100, totalWon: 850, totalLost: 250, roi: 31.8, winRate: 68.9, totalEntries: 45, wonEntries: 31, lostEntries: 14, bestWin: 200, worstLoss: 35, currentStreak: 4 },
    ];

    for (const b of bankrollData) {
      await ctx.db.insert("bankroll", {
        userId: user._id,
        platform: b.platform,
        totalDeposited: b.totalDeposited,
        totalWithdrawn: b.totalWithdrawn,
        currentBalance: b.currentBalance,
        totalWagered: b.totalWagered,
        totalWon: b.totalWon,
        totalLost: b.totalLost,
        roi: b.roi,
        winRate: b.winRate,
        totalEntries: b.totalEntries,
        wonEntries: b.wonEntries,
        lostEntries: b.lostEntries,
        bestWin: b.bestWin,
        worstLoss: b.worstLoss,
        currentStreak: b.currentStreak,
        lastUpdated: now,
      });
    }

    // Seed recent transactions
    const txns = [
      { platform: "PrizePicks", type: "win", amount: 75, sport: "NBA", description: "6-pick Flex Play — 5/6 hit", timestamp: now - 1 * day },
      { platform: "PrizePicks", type: "win", amount: 125, sport: "NBA", description: "4-pick Power Play — all hit!", timestamp: now - 2 * day },
      { platform: "Underdog", type: "loss", amount: -25, sport: "NFL", description: "3-pick entry — 1/3 hit", timestamp: now - 1 * day },
      { platform: "Underdog", type: "loss", amount: -10, sport: "NBA", description: "2-pick entry — 0/2 hit", timestamp: now - 3 * day },
      { platform: "Sleeper", type: "win", amount: 60, sport: "MLB", description: "3-pick Standard — all hit!", timestamp: now - 1 * day },
      { platform: "Kalshi", type: "win", amount: 95, sport: "NBA", description: "Team total OVER — BOS hit 112", timestamp: now - 2 * day },
      { platform: "DraftKings Pick6", type: "loss", amount: -50, sport: "NFL", description: "5-pick entry — 2/5 hit", timestamp: now - 4 * day },
      { platform: "PrizePicks", type: "win", amount: 40, sport: "MLB", description: "2-pick Standard — both hit", timestamp: now - 3 * day },
      { platform: "Kalshi", type: "win", amount: 55, sport: "NBA", description: "Spread market YES", timestamp: now - 1 * day },
      { platform: "Sleeper", type: "win", amount: 85, sport: "NBA", description: "4-pick Flex — 4/4 hit!", timestamp: now - 2 * day },
      { platform: "PrizePicks", type: "loss", amount: -25, sport: "NHL", description: "3-pick entry — 1/3 hit", timestamp: now - 5 * day },
      { platform: "Underdog", type: "win", amount: 150, sport: "NBA", description: "5-pick Power Play — all hit! 🔥", timestamp: now - 4 * day },
    ];

    for (const tx of txns) {
      await ctx.db.insert("bankrollTransactions", {
        userId: user._id,
        platform: tx.platform,
        type: tx.type,
        amount: tx.amount,
        sport: tx.sport,
        description: tx.description,
        timestamp: tx.timestamp,
      });
    }

    return null;
  },
});

function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs((Math.sin(hash) * 10000) % 1);
}

function shuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom(seed + i) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const clearAndReseed = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const tables = ["props", "players", "games", "sports", "leaderboard", "chatMessages", "picks", "entries", "bankroll", "bankrollTransactions"] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    return null;
  },
});
