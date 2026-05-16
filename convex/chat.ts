import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
	action,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "./_generated/server";

// Helper to call Viktor's tool gateway
async function callTool<T = unknown>(
	role: string,
	args: Record<string, unknown>,
): Promise<T> {
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
		// Get authenticated userId via internal query
		const userId = await ctx.runQuery(internal.chat.getAuthenticatedUserId);
		if (!userId) throw new Error("Not authenticated");

		await ctx.runMutation(internal.chat.saveMessageInternal, {
			userId,
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
				let line = `${p.playerName} (${p.team}) - ${p.statType}: Line ${p.line}, Proj ${p.projection}, ProjDiff ${p.projectionDiff ?? "N/A"}%, ModelProb ${p.modelProb ?? "N/A"}%, MarketImplied ${p.marketImpliedProb ?? "N/A"}%, Edge ${p.edge}% (model-market), ${p.overUnder.toUpperCase()}, Conf ${p.confidence}%, Hit Rate ${p.hitRate}%, Matchup ${p.matchupRating}/10, L10 Trend: ${p.last10Trend || "N/A"}, L10 Hits: ${p.last10Hits || "N/A"}/10, DvP Rank: ${p.dvpRank || "N/A"}, Platform: ${p.platform}, Source: ${p.dataSource || "demo"}`;
				if (p.bustRisk != null) line += `, Bust Risk: ${p.bustRisk}%`;
				if (mc)
					line += `, MC Sim: ${mc.hitRate}% hit rate (P10:${mc.p10}, P50:${mc.p50}, P90:${mc.p90}, σ=${mc.stdDev})`;
				if (cons)
					line += `, Consensus: ${cons.numOverLine}/${cons.numSources} over (avg ${cons.avg}, spread ±${cons.spread})`;
				if (streak) line += `, Streak: ${streak.label}`;
				if (hist)
					line += `, Hist Hit: ${hist.similarLines}% on ${hist.sampleSize} similar lines, vs team: ${hist.vsTeam}%`;
				if (p.isKalshiMarket) line += " [KALSHI MARKET]";
				return line;
			})
			.join("\n");

		const gamesContext: string = games
			.map(
				(g: any) =>
					`${g.awayTeam} @ ${g.homeTeam} (${g.sport}) - ${g.status}${g.status === "live" ? ` ${g.quarter} ${g.gameClock} | ${g.awayScore}-${g.homeScore}` : ` at ${new Date(g.gameTime).toLocaleTimeString()}`} on ${g.broadcast || "TBD"}`,
			)
			.join("\n");

		// Fetch additional context for enriched analysis
		const resultsContext: any[] = await ctx.runQuery(
			internal.chat.getResultsContext,
			{ userId },
		);
		const modelPerfContext: any = await ctx.runQuery(
			internal.chat.getModelPerfContext,
		);

		const resultsStr: string =
			resultsContext.length > 0
				? resultsContext
						.slice(0, 20)
						.map(
							(r: any) =>
								`${r.playerName} ${r.statType} ${r.overUnder} ${r.pickLine}: ${r.resultStatus} (actual: ${r.actualStat ?? "pending"}, edge: ${r.pickEdge}%, ROI: ${r.roi ?? "—"}%, CLV: ${r.clv ?? "—"})`,
						)
						.join("\n")
				: "No graded results yet.";

		const modelPerfStr: string = modelPerfContext
			? `Model: ${modelPerfContext.overallHitRate}% hit rate (${modelPerfContext.gradedPredictions} graded). Best sport: ${modelPerfContext.roiBySport?.[0]?.sport ?? "—"}. Over: ${modelPerfContext.overVsUnder?.over?.hitRate ?? "—"}%, Under: ${modelPerfContext.overVsUnder?.under?.hitRate ?? "—"}%.`
			: "No model performance data yet.";

		// Detect response mode from question
		const qLower = question.toLowerCase();
		let responseMode = "quick_summary";
		if (
			qLower.includes("deep") ||
			qLower.includes("research") ||
			qLower.includes("detailed")
		)
			responseMode = "deep_research";
		else if (qLower.includes("compare")) responseMode = "compare_picks";
		else if (
			qLower.includes("player") &&
			(qLower.includes("profile") || qLower.includes("intel"))
		)
			responseMode = "player_profile";
		else if (
			qLower.includes("model") &&
			(qLower.includes("performance") || qLower.includes("lab"))
		)
			responseMode = "model_performance";
		else if (
			qLower.includes("bankroll") ||
			qLower.includes("roi") ||
			qLower.includes("profit")
		)
			responseMode = "bankroll_review";

		const systemPrompt: string = `You are PropEdge AI, an analytical sports projection assistant. Use step-by-step reasoning, citing ONLY the data provided below. NEVER invent stats, injuries, odds, or sources not present in the data.

RESPONSE MODE: ${responseMode}

CRITICAL RULES:
- ONLY reference data explicitly provided in GAMES, PROPS, RESULTS, MODEL PERFORMANCE below
- If data is missing for a question, say "Data not available for that query"
- All data is DEMO DATA — state this clearly
- NEVER invent: injuries, odds, stats, sources, breaking news, or live data
- Show true edge as: Model Probability - Market Implied Probability (NOT projection diff)
- Show projection difference SEPARATELY from EV/edge
- EV must include payout/odds (not just probability)

STRUCTURED RESPONSE FORMAT:
For each pick/analysis, include these sections:
1. **Top Edges** — highest edge picks from data
2. **Why the model likes it** — cite specific model probability, consensus, hit rate
3. **Supporting data** — game logs, trends, L10 hits, Monte Carlo
4. **Risk factors** — bust risk, injury status, matchup rating, variance
5. **Similar historical picks** — historical hit rates on similar lines
6. **Line movement context** — if available from propSnapshots
7. **Result history context** — past results for this player/stat
8. **What would make this pick worse** — key risk scenarios
9. **Final risk-adjusted rating** — 1-10 scale with rationale

GAMES:
${gamesContext}

PROPS (top 40 by edge — Edge = Model Prob - Market Implied Prob):
${propsContext}

RECENT RESULTS (user's graded picks):
${resultsStr}

MODEL PERFORMANCE:
${modelPerfStr}

End every response with:
⚠️ *Demo data only — not real-time. Not financial advice. Always verify with live sources before placing entries.*`;

		try {
			const result: { text?: string; response_text?: string } = await callTool<{
				text?: string;
				response_text?: string;
			}>("coworker_ai_search", {
				query: `${systemPrompt}\n\nUser question: ${question}`,
			});

			const answer: string =
				result.text ||
				result.response_text ||
				"I couldn't process that request. Please try rephrasing your question.";

			await ctx.runMutation(internal.chat.saveMessageInternal, {
				userId,
				role: "assistant",
				content: answer,
			});

			return answer;
		} catch {
			const fallback: string = generateStatisticalResponse(
				question,
				props,
				games,
			);
			await ctx.runMutation(internal.chat.saveMessageInternal, {
				userId,
				role: "assistant",
				content: fallback,
			});
			return fallback;
		}
	},
});

export const saveMessageInternal = internalMutation({
	args: { userId: v.id("users"), role: v.string(), content: v.string() },
	returns: v.null(),
	handler: async (ctx, { userId, role, content }) => {
		await ctx.db.insert("chatMessages", {
			userId,
			role,
			content,
			timestamp: Date.now(),
		});
		return null;
	},
});

export const getAuthenticatedUserId = internalQuery({
	args: {},
	returns: v.union(v.id("users"), v.null()),
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		return userId;
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

export const getResultsContext = internalQuery({
	args: { userId: v.id("users") },
	returns: v.array(v.any()),
	handler: async (ctx, { userId }) => {
		// Only return the authenticated user's own graded results
		const results = await ctx.db
			.query("pickResults")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
		return results
			.filter((r) => r.resultStatus !== "pending")
			.sort((a, b) => (b.gradedAt || b.pickedAt) - (a.gradedAt || a.pickedAt))
			.slice(0, 20);
	},
});

export const getModelPerfContext = internalQuery({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		const preds = await ctx.db.query("modelPredictions").collect();
		const graded = preds.filter((p) => p.hit !== undefined);
		if (graded.length === 0) return null;
		const hits = graded.filter((p) => p.hit).length;
		const overHits = graded.filter(
			(p) => p.overUnder === "over" && p.hit,
		).length;
		const overTotal = graded.filter((p) => p.overUnder === "over").length;
		const underHits = graded.filter(
			(p) => p.overUnder === "under" && p.hit,
		).length;
		const underTotal = graded.filter((p) => p.overUnder === "under").length;
		// Best sport
		const sportMap: Record<string, { hits: number; total: number }> = {};
		for (const p of graded) {
			if (!sportMap[p.sport]) sportMap[p.sport] = { hits: 0, total: 0 };
			sportMap[p.sport].total++;
			if (p.hit) sportMap[p.sport].hits++;
		}
		const roiBySport = Object.entries(sportMap)
			.map(([sport, d]) => ({
				sport,
				hitRate: Math.round((d.hits / d.total) * 1000) / 10,
			}))
			.sort((a, b) => b.hitRate - a.hitRate);

		return {
			gradedPredictions: graded.length,
			overallHitRate: Math.round((hits / graded.length) * 1000) / 10,
			overVsUnder: {
				over: {
					hitRate:
						overTotal > 0 ? Math.round((overHits / overTotal) * 1000) / 10 : 0,
				},
				under: {
					hitRate:
						underTotal > 0
							? Math.round((underHits / underTotal) * 1000) / 10
							: 0,
				},
			},
			roiBySport,
		};
	},
});

const DISCLAIMER = `\n\n---\n⚠️ *All projections shown use demo data — not real-time odds or stats. This is not financial advice. Always verify with live sources before placing entries.*`;

function generateStatisticalResponse(
	question: string,
	props: any[],
	games: any[],
): string {
	const q = question.toLowerCase();

	// ===== HOT STREAKS =====
	if (q.includes("hot") || q.includes("streak") || q.includes("fire")) {
		const hotProps = props
			.filter(
				(p: any) => p.hotColdStreak?.type === "hot" && Number.isFinite(p.edge),
			)
			.sort((a: any, b: any) => b.edge - a.edge);
		if (hotProps.length === 0)
			return "No players on significant hot streaks right now.";

		let resp = `## 🔥 Hot Streak Analysis\n\n`;
		resp += `*Step 1: Identifying players outperforming projections over recent games*\n\n`;
		for (const p of hotProps.slice(0, 6)) {
			resp += `### ${p.playerName} — ${p.hotColdStreak.label}\n`;
			resp += `• **${p.statType}** ${p.overUnder.toUpperCase()} ${p.line} | Proj: **${p.projection}** | Edge: **+${p.edge}%**\n`;
			resp += `• L10 Hits: **${p.last10Hits || "?"}**/10 | Confidence: **${p.confidence}%** | Bust Risk: **${p.bustRisk || "?"}%**\n`;
			if (p.monteCarloSim)
				resp += `• MC Sim: **${p.monteCarloSim.hitRate}%** hit rate (median ${p.monteCarloSim.p50})\n`;
			resp += `\n`;
		}
		resp += `\n*Step 2: Hot streaks + positive edge = high-confidence overs. But beware regression to the mean.*`;
		return resp + DISCLAIMER;
	}

	// ===== LOW BUST RISK =====
	if (q.includes("bust") || q.includes("safe") || q.includes("low risk")) {
		const safeProps = props
			.filter(
				(p: any) =>
					(p.bustRisk || 100) <= 30 &&
					Math.abs(p.edge) > 3 &&
					Number.isFinite(p.edge),
			)
			.sort((a: any, b: any) => (a.bustRisk || 0) - (b.bustRisk || 0));
		if (safeProps.length === 0)
			return (
				"No lower-variance picks with low bust risk and positive edge found right now." +
				DISCLAIMER
			);

		let resp = `## 🛡️ Lower Variance Picks — Risk-Adjusted Selections\n\n`;
		resp += `*Step 1: Filtering for bust risk ≤ 30% AND edge > 3%*\n\n`;
		for (const p of safeProps.slice(0, 6)) {
			resp += `**${p.playerName}** ${p.overUnder.toUpperCase()} ${p.line} ${p.statType}\n`;
			resp += `• Bust Risk: **${p.bustRisk}%** 🟢 | Edge: **${p.edge > 0 ? "+" : ""}${p.edge}%** | Conf: **${p.confidence}%**\n`;
			if (p.monteCarloSim)
				resp += `• MC: **${p.monteCarloSim.hitRate}%** hit rate | Floor: ${p.monteCarloSim.p10} | Ceiling: ${p.monteCarloSim.p90}\n`;
			resp += `\n`;
		}
		resp += `*Step 2: Low variance, high floor selections. Ideal for flex play insurance legs.*\n\n⚠️ *Disclaimer: All projections are model-based estimates using demo data. Not financial advice. Past performance does not guarantee future results.*`;
		return resp + DISCLAIMER;
	}

	// ===== MONTE CARLO =====
	if (
		q.includes("monte carlo") ||
		q.includes("simulation") ||
		q.includes("sim")
	) {
		const mcProps = props
			.filter((p: any) => p.monteCarloSim && Number.isFinite(p.edge))
			.sort(
				(a: any, b: any) =>
					(b.monteCarloSim?.hitRate || 0) - (a.monteCarloSim?.hitRate || 0),
			);
		if (mcProps.length === 0)
			return "No Monte Carlo simulation data available for current props.";

		let resp = `## 🎲 Monte Carlo Simulation Analysis\n\n`;
		resp += `*10,000 simulations per prop — probability distributions*\n\n`;
		for (const p of mcProps.slice(0, 5)) {
			const mc = p.monteCarloSim;
			resp += `### ${p.playerName} — ${p.statType} (Line: ${p.line})\n`;
			resp += `• **Hit Rate: ${mc.hitRate}%** across 10K sims\n`;
			resp += `• Distribution: P10 **${mc.p10}** → P50 **${mc.p50}** → P90 **${mc.p90}** (σ = ${mc.stdDev})\n`;
			resp += `• ${mc.hitRate >= 60 ? "✅ Strong probability" : mc.hitRate >= 45 ? "⚠️ Coin flip zone" : "🚫 Against the odds"}\n\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== BEST OVERS =====
	if (q.includes("over") && (q.includes("best") || q.includes("top"))) {
		const sport = q.includes("nba")
			? "NBA"
			: q.includes("nfl")
				? "NFL"
				: q.includes("mlb")
					? "MLB"
					: q.includes("nhl")
						? "NHL"
						: null;
		let overProps = props.filter(
			(p: any) => p.edge > 0 && Number.isFinite(p.edge),
		);
		if (sport) overProps = overProps.filter((p: any) => p.sport === sport);
		overProps.sort((a: any, b: any) => b.edge - a.edge);
		const top = overProps.slice(0, 5);

		if (top.length === 0)
			return `No strong over picks found${sport ? ` for ${sport}` : ""} right now.`;

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
			if (cons)
				resp += `• Consensus: **${cons.numOverLine}/${cons.numSources}** sources project OVER (avg **${cons.avg}**, spread ±${cons.spread})\n`;
			resp += `• Trend: ${p.last10Trend === "up" ? "🔺 UP" : p.last10Trend === "down" ? "🔻 DOWN" : "➡️ Stable"} — **${p.last10Hits || "?"}**/10 recent hits\n`;
			if (mc)
				resp += `• MC (10K sims): **${mc.hitRate}%** hit rate | P10: ${mc.p10} | Median: ${mc.p50} | P90: ${mc.p90}\n`;
			if (hist)
				resp += `• Historical: **${hist.similarLines}%** hit rate (${hist.sampleSize} sample) | vs team: **${hist.vsTeam}%**\n`;

			resp += `\n*Step 3: Risk*\n`;
			resp += `• Bust Risk: **${p.bustRisk || "?"}%** | Matchup: ${p.matchupRating}/10 (DvP #${p.dvpRank || "?"})\n`;
			if (streak?.type === "hot") resp += `• 🔥 ${streak.label}\n`;
			resp += `• Risk: ${p.confidence >= 75 ? "🟢 Low" : p.confidence >= 55 ? "🟡 Medium" : "🔴 High"}\n\n---\n\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== BEST UNDERS =====
	if (
		q.includes("under") &&
		(q.includes("best") || q.includes("top") || q.includes("fade"))
	) {
		const sport = q.includes("nba")
			? "NBA"
			: q.includes("nfl")
				? "NFL"
				: q.includes("mlb")
					? "MLB"
					: q.includes("nhl")
						? "NHL"
						: null;
		let underProps = props.filter(
			(p: any) => p.edge < 0 && Number.isFinite(p.edge),
		);
		if (sport) underProps = underProps.filter((p: any) => p.sport === sport);
		underProps.sort((a: any, b: any) => a.edge - b.edge);
		const top = underProps.slice(0, 5);

		if (top.length === 0)
			return `No strong under picks found${sport ? ` for ${sport}` : ""}.`;

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
			if (mc)
				resp += `• MC Under Prob: **${100 - mc.hitRate}%** | Floor: ${mc.p10}\n`;

			resp += `\n*Step 3: Risk*\n`;
			resp += `• Defense: DvP #${p.dvpRank || "?"} ${(p.dvpRank || 15) >= 20 ? "(elite D — supports under)" : "(avg defense)"}\n`;
			resp += `• Bust Risk: **${p.bustRisk || "?"}%**\n\n---\n\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== BUILD ENTRY =====
	if (
		q.includes("build") &&
		(q.includes("entry") || q.includes("pick") || q.includes("lineup"))
	) {
		const numPicks = parseInt(q.match(/(\d+)[- ]?pick/)?.[1] || "6", 10);
		const platform = q.includes("prizepicks")
			? "PrizePicks"
			: q.includes("underdog")
				? "Underdog"
				: q.includes("sleeper")
					? "Sleeper"
					: q.includes("dk") || q.includes("draftkings")
						? "DraftKings Pick6"
						: "PrizePicks";

		const validProps = props
			.filter((p: any) => Math.abs(p.edge) > 3 && Number.isFinite(p.edge))
			.sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge));

		const selected: any[] = [];
		const usedPlayers = new Set<string>();

		for (const p of validProps) {
			if (selected.length >= numPicks) break;
			if (usedPlayers.has(p.playerName)) continue;
			const sameGame = selected.filter(
				(s) => s.gameId && s.gameId === p.gameId,
			).length;
			if (sameGame >= 2) continue;
			selected.push(p);
			usedPlayers.add(p.playerName);
		}

		let resp = `## 🏗️ Optimized ${numPicks}-Pick ${platform} Entry\n\n`;
		resp += `*Step 1: Selected top ${numPicks} edge plays with diversification*\n\n`;

		const overs = selected.filter((p) => p.overUnder === "over");
		const unders = selected.filter((p) => p.overUnder === "under");
		resp += `**Mix:** ${overs.length} Overs / ${unders.length} Unders | **Sports:** ${[...new Set(selected.map((p) => p.sport))].join(", ")}\n\n`;

		for (let i = 0; i < selected.length; i++) {
			const p = selected[i];
			resp += `**${i + 1}. ${p.playerName}** ${p.overUnder.toUpperCase()} ${p.line} ${p.statType}\n`;
			resp += `   Edge: ${p.edge > 0 ? "+" : ""}${p.edge}% | Conf: ${p.confidence}% | L10: ${p.last10Hits || "?"}/10 | Bust: ${p.bustRisk || "?"}% | ${p.sport}\n\n`;
		}

		const avgEdge =
			selected.length > 0
				? (
						selected.reduce((s, p) => s + Math.abs(p.edge), 0) / selected.length
					).toFixed(1)
				: "0";
		resp += `\n*Step 2: Entry Stats*\n`;
		resp += `• Avg Edge: **${avgEdge}%** | Sports: **${[...new Set(selected.map((p) => p.sport))].length}** | Games: **${new Set(selected.map((p) => p.gameId?.toString() || p.team)).size}**\n`;
		resp += `• Recommended: ${numPicks >= 5 ? "**Flex Play** (insurance)" : "**Standard** (all must hit)"}\n`;
		return resp + DISCLAIMER;
	}

	// ===== KALSHI =====
	if (q.includes("kalshi") || q.includes("market") || q.includes("binary")) {
		const kalshiProps = props.filter(
			(p: any) => p.platform === "Kalshi" || p.isKalshiMarket,
		);
		if (kalshiProps.length === 0) return "No active Kalshi markets found.";

		let resp = `## 💹 Kalshi Market Analysis\n\n`;
		resp += `*Step 1: Scanning ${kalshiProps.length} active binary markets*\n\n`;
		for (const p of kalshiProps
			.sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge))
			.slice(0, 6)) {
			resp += `**${p.playerName}** — ${p.statType}\n`;
			resp += `• Implied: **${p.impliedProb}%** | Model Edge: **${p.edge > 0 ? "+" : ""}${p.edge}%**\n`;
			resp += `• YES: ${p.kalshiPayout?.yesPayout?.toFixed(2) || "—"}x | NO: ${p.kalshiPayout?.noPayout?.toFixed(2) || "—"}x\n`;
			resp += `• ${p.edge > 5 ? "✅ Buy YES" : p.edge < -5 ? "✅ Buy NO" : "⚠️ Near fair value"}\n\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== LIVE / TONIGHT =====
	if (q.includes("live") || q.includes("tonight")) {
		const liveGames = games.filter((g: any) => g.status === "live");
		let resp = `## 🏀 Live & Upcoming\n\n`;
		if (liveGames.length > 0) {
			resp += `### 🔴 LIVE\n`;
			for (const g of liveGames)
				resp += `**${g.awayTeam} ${g.awayScore} @ ${g.homeTeam} ${g.homeScore}** — ${g.quarter} ${g.gameClock}\n`;
			resp += `\n`;
		}
		const upcoming = games
			.filter((g: any) => g.status === "upcoming")
			.slice(0, 6);
		if (upcoming.length > 0) {
			resp += `### ⏳ Upcoming\n`;
			for (const g of upcoming)
				resp += `**${g.awayTeam} @ ${g.homeTeam}** — ${new Date(g.gameTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} (${g.broadcast})\n`;
		}
		const topEdges = props
			.filter((p) => Number.isFinite(p.edge))
			.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))
			.slice(0, 3);
		if (topEdges.length > 0) {
			resp += `\n### 🎯 Top Edges\n`;
			for (const p of topEdges)
				resp += `• **${p.playerName}** ${p.overUnder.toUpperCase()} ${p.line} ${p.statType} — **${p.edge > 0 ? "+" : ""}${p.edge}%**\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== COMPARE =====
	if (q.includes("compare") || q.includes("vs")) {
		const topEdges = props
			.filter((p: any) => Number.isFinite(p.edge))
			.sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge))
			.slice(0, 8);
		let resp = `## ⚖️ Value Comparison\n\n`;
		resp += `### 🟢 Best Overs\n`;
		for (const p of topEdges.filter((p) => p.edge > 0).slice(0, 4)) {
			resp += `• **${p.playerName}** ${p.statType} OVER ${p.line} — **+${p.edge}%** (${p.hitRate}% hit rate)\n`;
		}
		resp += `\n### 🔴 Best Unders\n`;
		for (const p of topEdges.filter((p) => p.edge < 0).slice(0, 4)) {
			resp += `• **${p.playerName}** ${p.statType} UNDER ${p.line} — **${p.edge}%** (DvP: ${p.dvpRank || "?"}/30)\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== BEST HISTORICAL PROP TYPE =====
	if (
		q.includes("best prop type") ||
		q.includes("best historical") ||
		q.includes("most profitable prop")
	) {
		const typeMap: Record<string, { hits: number; total: number }> = {};
		for (const p of props) {
			const t = p.propType || "over_under";
			if (!typeMap[t]) typeMap[t] = { hits: 0, total: 0 };
			typeMap[t].total++;
			if (p.hitRate > 55) typeMap[t].hits++;
		}
		let resp = `## 📊 Best Historical Prop Types\n\n`;
		resp += `*Analyzing ${props.length} props by type performance (demo data)*\n\n`;
		const sorted = Object.entries(typeMap).sort(
			([, a], [, b]) => b.hits / b.total - a.hits / a.total,
		);
		for (const [type, d] of sorted) {
			const rate = d.total > 0 ? Math.round((d.hits / d.total) * 100) : 0;
			resp += `• **${type.replace(/_/g, " ")}**: ${rate}% high-hit-rate (${d.hits}/${d.total} props)\n`;
		}
		resp += `\n*Step 2: Focus on prop types with highest historical hit rates for your entries.*`;
		return resp + DISCLAIMER;
	}

	// ===== MOST PROFITABLE SPORT =====
	if (
		q.includes("most profitable sport") ||
		q.includes("which sport") ||
		(q.includes("profitable") && q.includes("sport"))
	) {
		const sportMap: Record<string, { totalEdge: number; count: number }> = {};
		for (const p of props) {
			if (!sportMap[p.sport]) sportMap[p.sport] = { totalEdge: 0, count: 0 };
			sportMap[p.sport].totalEdge += p.edge;
			sportMap[p.sport].count++;
		}
		let resp = `## 🏆 Sport Profitability Analysis\n\n`;
		resp += `*Step 1: Aggregating edge across all props by sport (demo data)*\n\n`;
		const sorted = Object.entries(sportMap).sort(
			([, a], [, b]) => b.totalEdge / b.count - a.totalEdge / a.count,
		);
		for (const [sport, d] of sorted) {
			const avgEdge = Math.round((d.totalEdge / d.count) * 10) / 10;
			resp += `• **${sport}**: Avg Edge ${avgEdge > 0 ? "+" : ""}${avgEdge}% across ${d.count} props\n`;
		}
		resp += `\n*Step 2: Higher average edge suggests better model performance in that sport.*`;
		return resp + DISCLAIMER;
	}

	// ===== BEST EDGE BUCKET =====
	if (
		q.includes("edge bucket") ||
		q.includes("which edge") ||
		q.includes("best edge range")
	) {
		const buckets: Record<string, { hits: number; total: number }> = {
			"0-5": { hits: 0, total: 0 },
			"5-10": { hits: 0, total: 0 },
			"10-15": { hits: 0, total: 0 },
			"15+": { hits: 0, total: 0 },
		};
		for (const p of props) {
			const absEdge = Math.abs(p.edge);
			const bucket =
				absEdge >= 15
					? "15+"
					: absEdge >= 10
						? "10-15"
						: absEdge >= 5
							? "5-10"
							: "0-5";
			buckets[bucket].total++;
			if (p.hitRate > 55) buckets[bucket].hits++;
		}
		let resp = `## 📈 Edge Bucket Performance\n\n`;
		resp += `*Step 1: Grouping by edge magnitude (demo data)*\n\n`;
		for (const [bucket, d] of Object.entries(buckets)) {
			const rate = d.total > 0 ? Math.round((d.hits / d.total) * 100) : 0;
			resp += `• **${bucket}% edge**: ${rate}% high-hit-rate (${d.total} props)\n`;
		}
		resp += `\n*Step 2: Wider edges should yield higher hit rates — check if calibration holds.*`;
		return resp + DISCLAIMER;
	}

	// ===== MOST RELIABLE PLAYERS =====
	if (
		q.includes("reliable") ||
		q.includes("most consistent") ||
		q.includes("best player")
	) {
		const playerMap: Record<
			string,
			{ totalHit: number; count: number; avgEdge: number }
		> = {};
		for (const p of props) {
			if (!playerMap[p.playerName])
				playerMap[p.playerName] = { totalHit: 0, count: 0, avgEdge: 0 };
			playerMap[p.playerName].totalHit += p.hitRate;
			playerMap[p.playerName].avgEdge += p.edge;
			playerMap[p.playerName].count++;
		}
		let resp = `## ⭐ Most Reliable Players\n\n`;
		resp += `*Step 1: Ranking by average hit rate across all props (demo data)*\n\n`;
		const sorted = Object.entries(playerMap)
			.filter(([, d]) => d.count >= 2)
			.sort(([, a], [, b]) => b.totalHit / b.count - a.totalHit / a.count)
			.slice(0, 8);
		for (const [name, d] of sorted) {
			const avgHit = Math.round(d.totalHit / d.count);
			const avgEdge = Math.round((d.avgEdge / d.count) * 10) / 10;
			resp += `• **${name}**: ${avgHit}% avg hit rate | Avg Edge: ${avgEdge > 0 ? "+" : ""}${avgEdge}% | ${d.count} props\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== SIMILAR PAST PICKS =====
	if (
		q.includes("similar") ||
		q.includes("past pick") ||
		q.includes("historical")
	) {
		const highConf = props
			.filter((p: any) => p.confidence >= 70 && p.historicalHitRate)
			.sort(
				(a: any, b: any) =>
					(b.historicalHitRate?.similarLines || 0) -
					(a.historicalHitRate?.similarLines || 0),
			)
			.slice(0, 6);
		let resp = `## 📚 Similar Past Picks Analysis\n\n`;
		resp += `*Step 1: Finding props with strong historical hit rates on similar lines (demo data)*\n\n`;
		if (highConf.length === 0) {
			resp += "No props with historical hit rate data found.";
			return resp + DISCLAIMER;
		}
		for (const p of highConf) {
			resp += `**${p.playerName}** ${p.statType} ${p.overUnder.toUpperCase()} ${p.line}\n`;
			resp += `• Historically: **${p.historicalHitRate.similarLines}%** hit rate on similar lines (n=${p.historicalHitRate.sampleSize})\n`;
			if (p.historicalHitRate.vsTeam)
				resp += `• vs Opponent: **${p.historicalHitRate.vsTeam}%**\n`;
			resp += `• Current Edge: **${p.edge > 0 ? "+" : ""}${p.edge}%** | Conf: **${p.confidence}%**\n\n`;
		}
		return resp + DISCLAIMER;
	}

	// ===== CLOSING LINE VALUE =====
	if (
		q.includes("closing line") ||
		q.includes("clv") ||
		q.includes("beat closing")
	) {
		let resp = `## 📉 Closing Line Value (CLV) Insight\n\n`;
		resp += `*Step 1: CLV measures whether your pick beat the closing line — a key skill indicator.*\n\n`;
		resp += `• **Positive CLV**: You got the line at a better price than where it closed → long-term edge\n`;
		resp += `• **Negative CLV**: Market moved against you → may indicate late info or public line movement\n\n`;
		resp += `*Step 2: Check your Results page for CLV on each graded pick. Target CLV > 0 on average.*\n\n`;
		resp += `To view your CLV data, go to **Results & Grading** in the sidebar. Each graded pick shows the CLV column.\n\n`;
		resp += `*Note: CLV data in this demo uses mock closing lines. With live APIs, this becomes a powerful metric.*`;
		return resp + DISCLAIMER;
	}

	// ===== STRONG EDGE + HISTORICAL HIT RATE =====
	if (
		(q.includes("strong") && q.includes("edge")) ||
		(q.includes("edge") && q.includes("hit rate")) ||
		q.includes("best combo")
	) {
		const combo = props
			.filter(
				(p: any) =>
					Math.abs(p.edge) >= 5 && p.hitRate >= 60 && Number.isFinite(p.edge),
			)
			.sort(
				(a: any, b: any) =>
					Math.abs(b.edge) + b.hitRate - (Math.abs(a.edge) + a.hitRate),
			)
			.slice(0, 8);
		let resp = `## 🎯 Strong Edge + High Hit Rate Picks\n\n`;
		resp += `*Step 1: Filtering for |edge| ≥ 5% AND hit rate ≥ 60% (demo data)*\n\n`;
		if (combo.length === 0) {
			resp += "No props currently match this criteria.";
			return resp + DISCLAIMER;
		}
		for (const p of combo) {
			resp += `**${p.playerName}** ${p.statType} ${p.overUnder.toUpperCase()} ${p.line}\n`;
			resp += `• Edge: **${p.edge > 0 ? "+" : ""}${p.edge}%** | Hit Rate: **${p.hitRate}%** | Conf: **${p.confidence}%**\n`;
			resp += `• Model Prob: ${p.modelProb || "?"}% vs Mkt: ${p.marketImpliedProb || "?"}% | Bust: ${p.bustRisk || "?"}%\n\n`;
		}
		resp += `*Step 2: These picks combine statistical edge with demonstrated reliability.*`;
		return resp + DISCLAIMER;
	}

	// ===== DEFAULT =====
	const topEdges = props
		.filter((p: any) => Number.isFinite(p.edge))
		.sort((a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge))
		.slice(0, 6);
	let resp = `## 📊 Today's Edge Analysis\n\n`;
	resp += `*Tracking ${props.length} props across ${[...new Set(props.map((p) => p.sport))].length} sports*\n\n`;

	const liveGames = games.filter((g) => g.status === "live");
	if (liveGames.length > 0) {
		resp += `🔴 **${liveGames.length} LIVE** — `;
		resp += liveGames
			.map(
				(g) =>
					`${g.awayTeam} ${g.awayScore || 0}–${g.homeScore || 0} ${g.homeTeam}`,
			)
			.join(" | ");
		resp += `\n\n`;
	}

	resp += `### Highest Edge Props\n\n`;
	for (const p of topEdges) {
		resp += `**${p.playerName}** — ${p.statType}: ${p.overUnder.toUpperCase()} ${p.line}\n`;
		resp += `• Proj: ${p.projection} | Edge: ${p.edge > 0 ? "+" : ""}${p.edge}% | Conf: ${p.confidence}% | Bust: ${p.bustRisk || "?"}%\n`;
		resp += `• L10: ${p.last10Hits || "?"}/10 | Matchup: ${p.matchupRating}/10 | ${p.platform}\n\n`;
	}
	resp += `\nAsk me to *"build a 6-pick entry"*, *"best unders"*, *"Kalshi markets"*, or *"who's on a hot streak?"* 🎯`;
	return resp + DISCLAIMER;
}
