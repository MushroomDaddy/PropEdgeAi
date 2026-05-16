/**
 * PropEdge AI — Admin Sync Wrappers (R11.2)
 *
 * Public actions that gate access behind admin authentication before
 * delegating to the internal sync actions in liveProviders.ts.
 *
 * Pattern:
 *   1. Caller must be authenticated (getAuthUserId)
 *   2. Caller's email must be in ADMIN_EMAILS env var (comma-separated)
 *   3. If both checks pass, runs the corresponding internalAction
 *
 * To configure admins:
 *   In Convex dashboard → Settings → Environment Variables:
 *   ADMIN_EMAILS=nick@example.com,dev@propedge.ai
 *
 * CLI usage (if user is authenticated):
 *   npx convex run adminSync:adminRefreshGames '{"sport":"NBA"}'
 *   npx convex run adminSync:adminRefreshOdds '{"sport":"NBA"}'
 *   npx convex run adminSync:adminRefreshProps '{"sport":"NBA","maxEvents":1}'
 *   npx convex run adminSync:adminInitProviderConfig
 *   npx convex run adminSync:adminRefreshLineMovement
 *
 * Convex dashboard: Navigate to Functions → adminSync → run directly.
 * Dashboard calls run as server-side actions; the admin wrapper still
 * enforces getAuthUserId() + ADMIN_EMAILS before delegating.
 *
 * Auth rules:
 *   - adminSync public actions require getAuthUserId() (must be signed in)
 *   - ADMIN_EMAILS env var restricts which emails can run them
 *   - If ADMIN_EMAILS is empty, any authenticated user can run admin actions (dev mode only)
 *   - Raw sync actions in liveProviders/apiSportsSync stay internalAction (not publicly callable)
 */

import { getAuthUserId } from "@convex-dev/auth/server";
import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { action } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

// Internal action references (same pattern as liveProviders.ts)
const internal = {
	initProviderConfig: makeFunctionReference<"action">(
		"liveProviders:initProviderConfig",
	),
	refreshGames: makeFunctionReference<"action">("liveProviders:refreshGames"),
	refreshOdds: makeFunctionReference<"action">("liveProviders:refreshOdds"),
	refreshProps: makeFunctionReference<"action">("liveProviders:refreshProps"),
	refreshLineMovement: makeFunctionReference<"action">(
		"liveProviders:refreshLineMovement",
	),
	// R13: API-SPORTS sync actions
	apiSportsFullSync: makeFunctionReference<"action">("apiSportsSync:fullSync"),
	apiSportsSyncTeams: makeFunctionReference<"action">(
		"apiSportsSync:syncTeams",
	),
	apiSportsSyncGames: makeFunctionReference<"action">(
		"apiSportsSync:syncGames",
	),
	apiSportsSyncStandings: makeFunctionReference<"action">(
		"apiSportsSync:syncStandings",
	),
	apiSportsSyncInjuries: makeFunctionReference<"action">(
		"apiSportsSync:syncInjuries",
	),
	apiSportsSyncLiveScores: makeFunctionReference<"action">(
		"apiSportsSync:syncLiveScores",
	),
};

// ─── Admin check helper ───
async function requireAdmin(ctx: any): Promise<string> {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new Error(
			"Authentication required. Sign in before calling sync actions.",
		);
	}

	// Look up user's email from the auth tables
	const user = await ctx.runQuery(
		makeFunctionReference<"query">("auth:currentUser"),
	);

	const adminEmails = (process.env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((e: string) => e.trim().toLowerCase())
		.filter(Boolean);

	// If ADMIN_EMAILS is not set, allow any authenticated user (dev mode / dashboard)
	if (adminEmails.length === 0) {
		return userId;
	}

	const userEmail = (user?.email ?? "").toLowerCase();
	if (!userEmail || !adminEmails.includes(userEmail)) {
		throw new Error(
			`Admin access required. ${userEmail || "No email"} is not in ADMIN_EMAILS.`,
		);
	}

	return userId;
}

// ══════════════════════════════════════════════════
//  ADMIN-GATED PUBLIC WRAPPERS
// ══════════════════════════════════════════════════

/** Admin: Initialize all provider configs */
export const adminInitProviderConfig = action({
	args: {},
	returns: v.any(),
	handler: async (ctx) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.initProviderConfig, {});
	},
});

/** Admin: Refresh games/events from The Odds API */
export const adminRefreshGames = action({
	args: { sport: v.optional(v.string()) },
	returns: v.any(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.refreshGames, { sport: args.sport });
	},
});

/** Admin: Refresh game-level odds (h2h, spreads, totals) */
export const adminRefreshOdds = action({
	args: {
		sport: v.optional(v.string()),
		markets: v.optional(v.string()),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.refreshOdds, {
			sport: args.sport,
			markets: args.markets,
		});
	},
});

/** Admin: Refresh player props */
export const adminRefreshProps = action({
	args: {
		sport: v.optional(v.string()),
		maxEvents: v.optional(v.number()),
	},
	returns: v.any(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.refreshProps, {
			sport: args.sport,
			maxEvents: args.maxEvents,
		});
	},
});

/** Admin: Refresh line movement snapshots */
export const adminRefreshLineMovement = action({
	args: { sport: v.optional(v.string()) },
	returns: v.any(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.refreshLineMovement, {
			sport: args.sport,
		});
	},
});

// ══════════════════════════════════════════════════
//  R13: API-SPORTS ADMIN WRAPPERS
// ══════════════════════════════════════════════════

/** Admin: Full API-SPORTS sync for a sport (teams + games + standings) */
export const adminApiSportsFullSync = action({
	args: { sport: v.string() },
	returns: v.any(),
	handler: async (ctx, { sport }) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.apiSportsFullSync, { sport });
	},
});

/** Admin: Sync teams from API-SPORTS */
export const adminApiSportsSyncTeams = action({
	args: { sport: v.string() },
	returns: v.any(),
	handler: async (ctx, { sport }) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.apiSportsSyncTeams, { sport });
	},
});

/** Admin: Sync games from API-SPORTS */
export const adminApiSportsSyncGames = action({
	args: { sport: v.string(), date: v.optional(v.string()) },
	returns: v.any(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.apiSportsSyncGames, {
			sport: args.sport,
			date: args.date,
		});
	},
});

/** Admin: Sync standings from API-SPORTS */
export const adminApiSportsSyncStandings = action({
	args: { sport: v.string() },
	returns: v.any(),
	handler: async (ctx, { sport }) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.apiSportsSyncStandings, { sport });
	},
});

/** Admin: Sync injuries from API-SPORTS (NFL) */
export const adminApiSportsSyncInjuries = action({
	args: { sport: v.string() },
	returns: v.any(),
	handler: async (ctx, { sport }) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.apiSportsSyncInjuries, { sport });
	},
});

/** Admin: Sync live scores from API-SPORTS */
export const adminApiSportsSyncLiveScores = action({
	args: { sport: v.string() },
	returns: v.any(),
	handler: async (ctx, { sport }) => {
		await requireAdmin(ctx);
		return await ctx.runAction(internal.apiSportsSyncLiveScores, { sport });
	},
});

/** Admin: Full sync — runs init, games, odds, props in sequence */
export const adminFullSync = action({
	args: { sport: v.optional(v.string()) },
	returns: v.any(),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);

		const initResult = await ctx.runAction(internal.initProviderConfig, {});
		const gamesResult = await ctx.runAction(internal.refreshGames, {
			sport: args.sport,
		});
		const oddsResult = await ctx.runAction(internal.refreshOdds, {
			sport: args.sport,
			markets: "h2h,spreads,totals",
		});
		const propsResult = await ctx.runAction(internal.refreshProps, {
			sport: args.sport,
			maxEvents: 3,
		});

		return {
			init: initResult,
			games: gamesResult,
			odds: oddsResult,
			props: propsResult,
			totalRequests:
				(gamesResult.requests ?? 0) +
				(oddsResult.requests ?? 0) +
				(propsResult.requests ?? 0),
		};
	},
});
