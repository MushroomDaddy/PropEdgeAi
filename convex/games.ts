import { query } from "./_generated/server";
import { v } from "convex/values";

export const listBySport = query({
  args: { sport: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, { sport }) => {
    return await ctx.db
      .query("games")
      .withIndex("by_sport", (q) => q.eq("sport", sport))
      .collect();
  },
});

export const listUpcoming = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    // Return both upcoming and live games
    const all = await ctx.db.query("games").collect();
    return all.filter(g => g.status === "upcoming" || g.status === "live");
  },
});

export const listLive = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();
  },
});

export const listAll = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});
