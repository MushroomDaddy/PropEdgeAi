import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Value Score (0-100) — Production formula
 *
 * Components:
 *   1. Edge Score (0-40): Based on |edge| = |modelProb - marketImpliedProb|
 *      - 40 pts max at 16%+ edge
 *   2. Consensus Score (0-25): Projection source agreement with the pick direction
 *      - Over picks: higher when more sources project over the line
 *      - Under picks: higher when fewer sources project over the line
 *   3. Hit Rate Score (0-20): Historical hit rate on similar lines
 *   4. Bust Risk Score (0-15): Inverse of bust risk — lower risk = more points
 *
 * Total = min(100, edgeScore + consensusScore + hitRateScore + bustRiskScore)
 */
function computeValueScore(prop: any): number {
	// Edge = modelProb - marketImpliedProb (or raw edge field for legacy data)
	const absEdge = Math.abs(prop.edge || 0);
	const edgeScore = Math.min(40, absEdge * 2.5); // 0-40 points (16% edge = max)

	const cons = prop.projectionConsensus;
	const consensusFinal = cons
		? prop.edge > 0
			? Math.min(25, (cons.numOverLine / cons.numSources) * 25)
			: Math.min(
					25,
					((cons.numSources - cons.numOverLine) / cons.numSources) * 25,
				)
		: 10;

	const histHitRate =
		prop.historicalHitRate?.similarLines || prop.hitRate || 50;
	const hitRateScore = Math.min(20, (histHitRate / 100) * 20); // 0-20 points

	const bustRisk = prop.bustRisk ?? 40;
	const bustScore = Math.min(15, ((100 - bustRisk) / 100) * 15); // 0-15 points (lower bust = higher score)

	return Math.round(
		Math.min(100, edgeScore + consensusFinal + hitRateScore + bustScore),
	);
}

export const list = query({
	args: {
		sport: v.optional(v.string()),
		platform: v.optional(v.string()),
	},
	returns: v.array(v.any()),
	handler: async (ctx, { sport, platform }) => {
		let q: any;
		if (sport && platform) {
			q = ctx.db
				.query("props")
				.withIndex("by_sport_platform", (qb) =>
					qb.eq("sport", sport).eq("platform", platform),
				);
		} else if (sport) {
			q = ctx.db
				.query("props")
				.withIndex("by_sport", (qb) => qb.eq("sport", sport));
		} else if (platform) {
			q = ctx.db
				.query("props")
				.withIndex("by_platform", (qb) => qb.eq("platform", platform));
		} else {
			q = ctx.db.query("props");
		}
		const results = await q.collect();
		return results
			.filter((p: any) => Number.isFinite(p.edge))
			.map((p: any) => ({
				...p,
				valueScore: computeValueScore(p),
			}));
	},
});

export const getTopEdges = query({
	args: { limit: v.optional(v.number()) },
	returns: v.array(v.any()),
	handler: async (ctx, { limit }) => {
		const allProps = await ctx.db.query("props").collect();
		const validProps = allProps
			.filter((p: any) => Number.isFinite(p.edge))
			.map((p: any) => ({
				...p,
				valueScore: computeValueScore(p),
			}));
		validProps.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));
		return validProps.slice(0, limit || 20);
	},
});

// NEW R4: Get top picks by Value Score for "Today's Top Value Spots"
export const getTopValuePicks = query({
	args: { limit: v.optional(v.number()) },
	returns: v.array(v.any()),
	handler: async (ctx, { limit }) => {
		const allProps = await ctx.db.query("props").collect();
		const scored = allProps
			.filter((p: any) => Number.isFinite(p.edge))
			.map((p: any) => ({
				...p,
				valueScore: computeValueScore(p),
			}));
		scored.sort((a, b) => b.valueScore - a.valueScore);
		return scored.slice(0, limit || 7);
	},
});

// NEW R4: Auto-suggest diversification picks
export const suggestDiversificationPicks = query({
	args: {
		currentPickSports: v.array(v.string()),
		currentPickPlatforms: v.array(v.string()),
		currentOverUnder: v.array(v.string()),
	},
	returns: v.array(v.any()),
	handler: async (ctx, { currentPickSports, currentOverUnder }) => {
		const allProps = await ctx.db.query("props").collect();
		const validProps = allProps.filter(
			(p) => Number.isFinite(p.edge) && Math.abs(p.edge) > 3,
		);

		// Count current distribution
		const sportCounts: Record<string, number> = {};
		for (const s of currentPickSports)
			sportCounts[s] = (sportCounts[s] || 0) + 1;
		const overs = currentOverUnder.filter((x) => x === "over").length;
		const unders = currentOverUnder.filter((x) => x === "under").length;

		// Find props that diversify: different sport or balance over/under
		const suggestions = validProps
			.map((p) => {
				let diversityBonus = 0;
				if (!sportCounts[p.sport]) diversityBonus += 20; // New sport
				if (overs > unders && p.overUnder === "under") diversityBonus += 15;
				if (unders > overs && p.overUnder === "over") diversityBonus += 15;
				return {
					...p,
					valueScore: computeValueScore(p),
					diversityBonus,
					totalScore: computeValueScore(p) + diversityBonus,
				};
			})
			.sort((a, b) => b.totalScore - a.totalScore)
			.slice(0, 5);

		return suggestions;
	},
});

export const getByPlayer = query({
	args: { playerId: v.id("players") },
	returns: v.array(v.any()),
	handler: async (ctx, { playerId }) => {
		return await ctx.db
			.query("props")
			.withIndex("by_playerId", (q) => q.eq("playerId", playerId))
			.collect();
	},
});

export const getByGame = query({
	args: { gameId: v.id("games") },
	returns: v.array(v.any()),
	handler: async (ctx, { gameId }) => {
		return await ctx.db
			.query("props")
			.withIndex("by_gameId", (q) => q.eq("gameId", gameId))
			.collect();
	},
});

export const stats = query({
	args: {},
	returns: v.object({
		totalProps: v.number(),
		avgEdge: v.number(),
		topSport: v.string(),
		positiveEdgeCount: v.number(),
	}),
	handler: async (ctx) => {
		const allProps = await ctx.db.query("props").collect();
		const validProps = allProps.filter((p: any) => Number.isFinite(p.edge));
		const totalProps = allProps.length;
		const avgEdge =
			validProps.length > 0
				? Math.round(
						(validProps.reduce((sum, p) => sum + Math.abs(p.edge), 0) /
							validProps.length) *
							10,
					) / 10
				: 0;
		const positiveEdgeCount = validProps.filter((p) => p.edge > 0).length;

		const sportCounts: Record<string, number> = {};
		for (const p of allProps) {
			sportCounts[p.sport] = (sportCounts[p.sport] || 0) + 1;
		}
		const topSport =
			Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

		return { totalProps, avgEdge, topSport, positiveEdgeCount };
	},
});
