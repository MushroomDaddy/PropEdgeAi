import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: { sport: v.optional(v.string()) },
  returns: v.array(v.any()),
  handler: async (ctx, { sport }) => {
    if (sport) {
      return await ctx.db
        .query("players")
        .withIndex("by_sport", q => q.eq("sport", sport))
        .collect();
    }
    return await ctx.db.query("players").collect();
  },
});

export const search = query({
  args: { searchQuery: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, { searchQuery }) => {
    const all = await ctx.db.query("players").collect();
    const lower = searchQuery.toLowerCase();
    return all.filter(
      p =>
        p.name.toLowerCase().includes(lower) ||
        p.team.toLowerCase().includes(lower) ||
        p.position.toLowerCase().includes(lower),
    );
  },
});

export const get = query({
  args: { id: v.id("players") },
  returns: v.any(),
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
