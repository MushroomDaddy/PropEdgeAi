import { query } from "./_generated/server";
import { v } from "convex/values";

export const getGame = query({
  args: { gameId: v.id("games") },
  returns: v.any(),
  handler: async (ctx, { gameId }) => {
    return await ctx.db.get(gameId);
  },
});

export const getGameProps = query({
  args: { gameId: v.id("games") },
  returns: v.any(),
  handler: async (ctx, { gameId }) => {
    return await ctx.db
      .query("props")
      .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
      .collect();
  },
});
