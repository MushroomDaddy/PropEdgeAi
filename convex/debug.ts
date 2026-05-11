import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const checkUsers = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    const users = await ctx.db.query("users").collect();
    const results = await ctx.db.query("pickResults").take(5);
    return {
      authUserId,
      userCount: users.length,
      userIds: users.map(u => u._id),
      resultCount: results.length,
      resultUserIds: results.map(r => r.userId),
    };
  },
});
