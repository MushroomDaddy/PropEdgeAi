import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  returns: v.any(),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("userSettings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();
  },
});

export const save = mutation({
  args: {
    favoriteSports: v.array(v.string()),
    favoritePlatforms: v.array(v.string()),
    riskTolerance: v.string(),
    darkMode: v.boolean(),
    notifications: v.boolean(),
    defaultBankroll: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        ...args,
      });
    }
    return null;
  },
});
