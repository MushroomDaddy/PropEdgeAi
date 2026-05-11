import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to call Viktor's tool gateway
async function callTool<T = unknown>(role: string, args: Record<string, unknown>): Promise<T> {
  const secret = process.env.VIKTOR_SPACES_PROJECT_SECRET;
  if (!secret) throw new Error("VIKTOR_SPACES_PROJECT_SECRET not set");

  const resp = await fetch("https://getviktor.com/api/tool-gateway", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ role, arguments: args }),
  });

  if (!resp.ok) throw new Error(`Tool gateway error: ${resp.status}`);
  return (await resp.json()) as T;
}

export const messages = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const saveMessage = mutation({
  args: {
    role: v.string(),
    content: v.string(),
  },
  returns: v.union(v.id("chatMessages"), v.null()),
  handler: async (ctx, { role, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.insert("chatMessages", {
      userId,
      role,
      content,
      timestamp: Date.now(),
    });
  },
});

export const askAnalyst = action({
  args: { question: v.string() },
  returns: v.string(),
  handler: async (ctx, { question }): Promise<string> => {
    await ctx.runMutation(internal.chat.saveMessageInternal, {
      role: "user",
      content: question,
    });

    const props: any[] = await ctx.runQuery(internal.chat.getPropsContext);
    const games: any[] = await ctx.runQuery(internal.chat.getGamesContext);

    const propsContext: string = props
      .slice(0, 40)
      .map((p: any) => {
        const mc = p.monteCarloSim;
        const cons = p.projectionConsensus;
        const streak = p.hotColdStreak;
        const hist = p.historicalHitRate;
        let line = `${p.playerName} (${p.team}) - ${p.statType}: Line ${p.line}, Proj ${p.projection}, Edge ${p.edge}%, ${p.overUnder.toUpperCase()}, Conf ${p.confidence}%, Hit Rate ${p.hitRate}%, Matchup ${p.matchupRating}/10, L10 Trend: ${p.last10Trend || "N/A"}, L10 Hits: ${p.last10Hits || "N/A"}/10, DvP Rank: ${p.dvpRank || "N/A"}, Platform: ${p.platform}`;
        if (p.bustRisk != null) line += `, Bust Risk: ${p.bustRisk}%`;
        if (mc) line += `, MC Sim: ${mc.hitRate}% hit rate (P10:${mc.p10}, P50:${mc.p50}, P90:${mc.p90}, σ=${mc.stdDev})`;
        if (cons) line += `, Consensus: ${cons.numOverLine}/${cons.numSources} over (avg ${cons.avg}, spread ±${cons.spread})`;
        if (streak) line += `, Streak: ${streak.label}`;
        if (hist) line += `, Hist Hit: ${hist.similarLines}% on ${hist.sampleSize} similar lines, vs team: ${hist.vsTeam}%`;
        if (p.isKalshiMarket) line += " [KALSHI MARKET]";
        return line;
      })
      .join("\n");

    const gamesContext: string = games
      .map((g: any) =>
        `${g.awayTeam} @ ${g.homeTeam} (${g.sport}) - ${g.status}${g.status === "live" ? ` ${g.quarter} ${g.gameClock} | ${g.awayScore}-${g.homeScore}` : ` at ${new Date(g.gameTime).toLocaleTimeString()}`} on ${g.broadcast || "TBD"}`
      )
      .join("\n");

    const systemPrompt: string = `You are PropEdge AI, an elite sports analyst. Use step-by-step reasoning with data citations.

GAMES:
${gamesContext}

PROPS (top 40 by edge):
${propsContext}

FORMAT: Use ## headers, bullet points with **bold** data, and step-by-step analysis:
Step 1: Data Review — cite projection numbers
Step 2: Edge Analysis — explain edge sources  
Step 3: Risk Assessment — bust risk, matchup, streaks
Step 4: Recommendation — final verdict with confidence

Always cite: Monte Carlo hit rates, consensus ratios, historical hit rates, DvP rankings, and bust risk %.`;

    try {
      const result: { text?: string; response_text?: string } = await callTool<{ text?: string; response_text?: string }>("coworker_ai_search", {
        query: `${systemPrompt}\n\nUser question: ${question}`,
      });

      const answer: string = result.text || result.response_text || "I couldn't process that request. Please try rephrasing your question.";

      await ctx.runMutation(internal.chat.saveMessageInternal, {
        role: "assistant",
        content: answer,
      });

      return answer;
    } catch {
      const fallback: string = generateStatisticalResponse(question, props, games);
      await ctx.runMutation(internal.chat.saveMessageInternal, {
        role: "assistant",
        content: fallback,
      });
      return fallback;
    }
  },
});

export const saveMessageInternal = internalMutation({
  args: { role: v.string(), content: v.string() },
  returns: v.null(),
  handler: async (ctx, { role, content }) => {
    const users = await ctx.db.query("users").collect();
    const user = users[0];
    if (!user) return null;
    await ctx.db.insert("chatMessages", { userId: user._id, role, content, timestamp: Date.now() });
    return null;
  },
});

export const getPropsContext = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const allProps = await ctx.db.query("props").collect();
    allProps.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
    return allProps.slice(0, 40);
  },
});

export const getGamesContext = internalQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

function generateStatisticalResponse(question: string, props: any[], games: any[]): string {
  const q = question.toLowerCase();

  // ===== HOT STREAKS =====
  if (q.includes("hot") || q.includes("streak") || q.includes("fire")) {
    const hotProps = props.filter((p: any) => p.hotColdStreak?.type === "hot" && isFinite(p.edge)).sort((a: any, b: any) => b.edge - a.edge);
    if (hotProps.length === 0) return "No players on significant hot streaks right now.";

    let resp = `## 🔥 Hot Streak Analysis\n\n`;
    resp += `*Step 1: Identifying players outperforming projections over recent games*\n\n`;
    for (const p of hotProps.slice(0, 6)) {
      resp += `### ${p.playerName} — ${p.hotColdStreak.label}\n`;
      resp += `• **${p.statType}** ${p.overUnder.toUpperCase()} ${p.line} | Proj: **${p.projection}** | Edge: **+${p.edge}%**\n`;
      resp += `• L10 Hits: **${p.last10Hits || "?"}**/10 | Confidence: **${p.confidence}%** | Bust Risk: **${p.bustRisk || "?"}%**\n`;
      if (p.monteCarloSim) resp += `• MC Sim: **${p.monteCarloSim.hitRate}%** hit rate (median ${p.monteCarloSim.p50})\n`;
      resp += `\n`;
    }
    resp += `\n*Step 2: Hot streaks + positive edge = high-confidence overs. But beware regression to the mean.*`;
    return resp;
  }

  // ===== LOW BUST RISK =====
  if (q.includes("bust") || q.includes("safe") || q.includes("low risk")) {
    const safeProps = props.filter((p: any) => (p.bustRisk || 100) <= 30 && Math.abs(p.edge) > 3 && isFinite(p.edge)).sort((a: any, b: any) => (a.bustRisk || 0) - (b.bustRisk || 0));
    if (safeProps.length === 0) return "No ultra-safe picks with low bust risk and positive edge found right now.";

    let resp = `## 🛡️ Low Bust Risk Picks — Safe Plays\n\n`;
    resp += `*Step 1: Filtering for bust risk ≤ 30% AND edge > 3%*\n\n`;
    for (const p of safeProps.slice(0, 6)) {
      resp += `**${p.playerName}** ${p.overUnder.toUpperCase()} ${p.line} ${p.statType}\n`;
      resp += `• Bust Risk: **${p.bustRisk}%** 🟢 | Edge: **${p.edge > 0 ? "+" : ""}${p.edge}%** | Conf: **${p.confidence}%**\n`;
      if (p.monteCarloSim) resp += `• MC: **${p.monteCarloSim.hitRate}%** hit rate | Floor: ${p.monteCarloSim.p10} | Ceiling: ${p.monteCarloSim.p90}\n`;
      resp += `\n`;
    }
    resp += `*Step 2: These are your "lock" plays — low variance, high floor. Ideal for flex play insurance legs.*`;
    return resp;
  }

  // ===== MONTE CARLO =====
  if (q.includes("monte carlo") || q.includes("simulation") || q.includes("sim")) {
    const mcProps = props.filter((p: any) => p.monteCarloSim && isFinite(p.edge)).sort((a: any, b: any) => (b.monteCarloSim?.hitRate || 0) - (a.monteCarloSim?.hitRate || 0));
    if (mcProps.length === 0) return "No Monte Carlo simulation data available for current props.";

    let resp = `## 🎲 Monte Carlo Simulation Analysis\n\n`;
    resp += `*10,000 simulations per prop — probability distributions*\n\n`;
    for (const p of mcProps.slice(0, 5)) {
      const mc = p.monteCarloSim;
      resp += `### ${p.playerName} — ${p.statType} (Line: ${p.line})\n`;
      resp += `• **Hit Rate: ${mc.hitRate}%** across 10K sims\n`;
      resp += `• Distribution: P10 **${mc.p10}** → P50 **${mc.p50}** → P90 **${mc.p90}** (σ = ${mc.stdDev})\n`;
      resp += `• ${mc.hitRate >= 60 ? "✅ Strong probability" : mc.hitRate >= 45 ? "⚠️ Coin flip zone" : "🚫 Against the odds"}\n\n`;
    }
    return resp;
  }

  // ===== BEST OVERS =====
  if (q.includes("over") && (q.includes("best") || q.includes("top"))) {
    const sport = q.includes("nba") ? "NBA" : q.includes("nfl") ? "NFL" : q.includes("mlb") ? "MLB" : q.includes("nhl") ? "NHL" : null;
    let overProps = props.filter((p: any) => p.edge > 0 && isFinite(p.edge));
    if (sport) overProps = overProps.filter((p: any) => p.sport === sport);
    overProps.sort((a: any, b: any) => b.edge - a.edge);
    const top = overProps.slice(0, 5);

    if (top.length === 0) return `No strong over picks found${sport ? ` for ${sport}` : ""} right now.`;

    let resp = `## 🔥 Top ${sport || "All Sports"} Over Picks\n\n`;
    resp += `*Step 1: Data Review — scanning ${overProps.length} positive-edge props*\n\n`;

    for (const p of top) {
      const cons = p.projectionConsensus;
      const mc = p.monteCarloSim;
      const hist = p.historicalHitRate;
      const streak = p.hotColdStreak;

      resp += `### ${p.playerName} — ${p.statType} OVER ${p.line}\n`;
      resp += `**Edge: +${p.edge}%** | Projection: **${p.projection}** | Confidence: **${p.confidence}%**\n\n`;

      resp += `*Step 2: Edge Sources*\n`;
      if (cons) resp += `• Consensus: **${cons.numOverLine}/${cons.numSources}** sources project OVER (avg **${cons.avg}**, spread ±${cons.spread})\n`;
      resp += `• Trend: ${p.last10Trend === "up" ? "🔺 UP" : p.last10Trend === "down" ? "🔻 DOWN" : "➡️ Stable"} — **${p.last10Hits || "?"}**/10 recent hits\n`;
      if (mc) resp += `• MC (10K sims): **${mc.hitRate}%** hit rate | P10: ${mc.p10} | Median: ${mc.p50} | P90: ${mc.p90}\n`;
      if (hist) resp += `• Historical: **${hist.similarLines}%** hit rate (${hist.sampleSize} sample) | vs team: **${hist.vsTeam}%**\n`;

      resp += `\n*Step 3: Risk*\n`;
      resp += `• Bust Risk: **${p.bustRisk || "?"}%** | Matchup: ${p.matchupRating}/10 (DvP #${p.dvpRank || "?"})\n`;
      if (streak?.type === "hot") resp += `• 🔥 ${streak.label}\n`;
      resp += `• Risk: ${p.confidence >= 75 ? "🟢 Low" : p.confidence >= 55 ? "🟡 Medium" : "🔴 High"}\n\n---\n\n`;
    }
    return resp;
  }

  // ===== BEST UNDERS =====
  if (q.includes("under") && (q.includes("best") || q.includes("top") || q.includes("fade"))) {
    const sport = q.includes("nba") ? "NBA" : q.includes("nfl") ? "NFL" : q.includes("mlb") ? "MLB" : q.includes("nhl") ? "NHL" : null;
    let underProps = props.filter((p: any) => p.edge < 0 && isFinite(p.edge));
    if (sport) underProps = underProps.filter((p: any) => p.sport === sport);
    underProps.sort((a: any, b: any) => a.edge - b.edge);
    const top = underProps.slice(0, 5);

    if (top.length === 0) return `No strong under picks found${sport ? ` for ${sport}` : ""}.`;

    let resp = `## 📉 Top ${sport || "All Sports"} Under Picks — Fade Targets\n\n`;
    resp += `*Step 1: Identifying overpriced lines where projection < line*\n\n`;

    for (const p of top) {
      const cons = p.projectionConsensus;
      const mc = p.monteCarloSim;

      resp += `### ${p.playerName} — ${p.statType} UNDER ${p.line}\n`;
      resp += `**Edge: ${p.edge}%** | Projection: **${p.projection}** vs Line: **${p.line}**\n\n`;

      resp += `*Step 2: Why fade?*\n`;
      if (cons) {
        const numUnder = cons.numSources - cons.numOverLine;
        resp += `• Consensus: **${numUnder}/${cons.numSources}** sources project UNDER\n`;
      }
      resp += `• Trend: ${p.last10Trend === "down" ? "🔻 Declining — supports under" : "➡️ Stable but below line"}\n`;
      if (mc) resp += `• MC Under Prob: **${100 - mc.hitRate}%** | Floor: ${mc.p10}\n`;

      resp += `\n*Step 3: Risk*\n`;
      resp += `• Defense: DvP #${p.dvpRank || "?"} ${(p.dvpRank || 15) >= 20 ? "(elite D — supports under)" : "(avg defense)"}\n`;
      resp += `• Bust Risk: **${p.bustRisk || "?"}%**\n\n---\n\n`;
    }
    return resp;
  }

  // ===== BUILD ENTRY =====
  if (q.includes("build") && (q.includes("entry") || q.includes("pick") || q.includes("lineup"))) {
    const numPicks = parseInt(q.match(/(\d+)[- ]?pick/)?.[1] || "6");
    const platform = q.includes("prizepicks") ? "PrizePicks" : q.includes("underdog") ? "Underdog" : q.includes("sleeper") ? "Sleeper" : q.includes("dk") || q.includes("draftkings") ? "DraftKings Pick6" : "PrizePicks";

    const validProps = props.filter((p: any) => Math.abs(p.edge) > 3 && isFinite(p.edge)).sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge));

    const selected: any[] = [];
    const usedPlayers = new Set<string>();

    for (const p of validProps) {
      if (selected.length >= numPicks) break;
      if (usedPlayers.has(p.playerName)) continue;
      const sameGame = selected.filter(s => s.gameId && s.gameId === p.gameId).length;
      if (sameGame >= 2) continue;
      selected.push(p);
      usedPlayers.add(p.playerName);
    }

    let resp = `## 🏗️ Optimized ${numPicks}-Pick ${platform} Entry\n\n`;
    resp += `*Step 1: Selected top ${numPicks} edge plays with diversification*\n\n`;

    const overs = selected.filter(p => p.overUnder === "over");
    const unders = selected.filter(p => p.overUnder === "under");
    resp += `**Mix:** ${overs.length} Overs / ${unders.length} Unders | **Sports:** ${[...new Set(selected.map(p => p.sport))].join(", ")}\n\n`;

    for (let i = 0; i < selected.length; i++) {
      const p = selected[i];
      resp += `**${i + 1}. ${p.playerName}** ${p.overUnder.toUpperCase()} ${p.line} ${p.statType}\n`;
      resp += `   Edge: ${p.edge > 0 ? "+" : ""}${p.edge}% | Conf: ${p.confidence}% | L10: ${p.last10Hits || "?"}/10 | Bust: ${p.bustRisk || "?"}% | ${p.sport}\n\n`;
    }

    const avgEdge = selected.length > 0 ? (selected.reduce((s, p) => s + Math.abs(p.edge), 0) / selected.length).toFixed(1) : "0";
    resp += `\n*Step 2: Entry Stats*\n`;
    resp += `• Avg Edge: **${avgEdge}%** | Sports: **${[...new Set(selected.map(p => p.sport))].length}** | Games: **${new Set(selected.map(p => p.gameId?.toString() || p.team)).size}**\n`;
    resp += `• Recommended: ${numPicks >= 5 ? "**Flex Play** (insurance)" : "**Standard** (all must hit)"}\n`;
    return resp;
  }

  // ===== KALSHI =====
  if (q.includes("kalshi") || q.includes("market") || q.includes("binary")) {
    const kalshiProps = props.filter((p: any) => p.platform === "Kalshi" || p.isKalshiMarket);
    if (kalshiProps.length === 0) return "No active Kalshi markets found.";

    let resp = `## 💹 Kalshi Market Analysis\n\n`;
    resp += `*Step 1: Scanning ${kalshiProps.length} active binary markets*\n\n`;
    for (const p of kalshiProps.sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge)).slice(0, 6)) {
      resp += `**${p.playerName}** — ${p.statType}\n`;
      resp += `• Implied: **${p.impliedProb}%** | Model Edge: **${p.edge > 0 ? "+" : ""}${p.edge}%**\n`;
      resp += `• YES: ${p.kalshiPayout?.yesPayout?.toFixed(2) || "—"}x | NO: ${p.kalshiPayout?.noPayout?.toFixed(2) || "—"}x\n`;
      resp += `• ${p.edge > 5 ? "✅ Buy YES" : p.edge < -5 ? "✅ Buy NO" : "⚠️ Near fair value"}\n\n`;
    }
    return resp;
  }

  // ===== LIVE / TONIGHT =====
  if (q.includes("live") || q.includes("tonight")) {
    const liveGames = games.filter((g: any) => g.status === "live");
    let resp = `## 🏀 Live & Upcoming\n\n`;
    if (liveGames.length > 0) {
      resp += `### 🔴 LIVE\n`;
      for (const g of liveGames) resp += `**${g.awayTeam} ${g.awayScore} @ ${g.homeTeam} ${g.homeScore}** — ${g.quarter} ${g.gameClock}\n`;
      resp += `\n`;
    }
    const upcoming = games.filter((g: any) => g.status === "upcoming").slice(0, 6);
    if (upcoming.length > 0) {
      resp += `### ⏳ Upcoming\n`;
      for (const g of upcoming) resp += `**${g.awayTeam} @ ${g.homeTeam}** — ${new Date(g.gameTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} (${g.broadcast})\n`;
    }
    const topEdges = props.filter(p => isFinite(p.edge)).sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge)).slice(0, 3);
    if (topEdges.length > 0) {
      resp += `\n### 🎯 Top Edges\n`;
      for (const p of topEdges) resp += `• **${p.playerName}** ${p.overUnder.toUpperCase()} ${p.line} ${p.statType} — **${p.edge > 0 ? "+" : ""}${p.edge}%**\n`;
    }
    return resp;
  }

  // ===== COMPARE =====
  if (q.includes("compare") || q.includes("vs")) {
    const topEdges = props.filter((p: any) => isFinite(p.edge)).sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge)).slice(0, 8);
    let resp = `## ⚖️ Value Comparison\n\n`;
    resp += `### 🟢 Best Overs\n`;
    for (const p of topEdges.filter(p => p.edge > 0).slice(0, 4)) {
      resp += `• **${p.playerName}** ${p.statType} OVER ${p.line} — **+${p.edge}%** (${p.hitRate}% hit rate)\n`;
    }
    resp += `\n### 🔴 Best Unders\n`;
    for (const p of topEdges.filter(p => p.edge < 0).slice(0, 4)) {
      resp += `• **${p.playerName}** ${p.statType} UNDER ${p.line} — **${p.edge}%** (DvP: ${p.dvpRank || "?"}/30)\n`;
    }
    return resp;
  }

  // ===== DEFAULT =====
  const topEdges = props.filter((p: any) => isFinite(p.edge)).sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge)).slice(0, 6);
  let resp = `## 📊 Today's Edge Analysis\n\n`;
  resp += `*Tracking ${props.length} props across ${[...new Set(props.map(p => p.sport))].length} sports*\n\n`;

  const liveGames = games.filter(g => g.status === "live");
  if (liveGames.length > 0) {
    resp += `🔴 **${liveGames.length} LIVE** — `;
    resp += liveGames.map(g => `${g.awayTeam} ${g.awayScore || 0}–${g.homeScore || 0} ${g.homeTeam}`).join(" | ");
    resp += `\n\n`;
  }

  resp += `### Highest Edge Props\n\n`;
  for (const p of topEdges) {
    resp += `**${p.playerName}** — ${p.statType}: ${p.overUnder.toUpperCase()} ${p.line}\n`;
    resp += `• Proj: ${p.projection} | Edge: ${p.edge > 0 ? "+" : ""}${p.edge}% | Conf: ${p.confidence}% | Bust: ${p.bustRisk || "?"}%\n`;
    resp += `• L10: ${p.last10Hits || "?"}/10 | Matchup: ${p.matchupRating}/10 | ${p.platform}\n\n`;
  }
  resp += `\nAsk me to *"build a 6-pick entry"*, *"best unders"*, *"Kalshi markets"*, or *"who's on a hot streak?"* 🎯`;
  return resp;
}
