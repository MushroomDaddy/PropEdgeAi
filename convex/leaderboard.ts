import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
	args: {},
	returns: v.array(v.any()),
	handler: async (ctx) => {
		return await ctx.db.query("leaderboard").withIndex("by_rank").collect();
	},
});
