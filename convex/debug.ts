import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const checkUsers = query({
  args: {},
  returns: v.any(),
  handler: async ctx => {
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

// ── Table count helper (used by goLiveSmokeTest) ──
export const countTable = query({
  args: { table: v.string() },
  returns: v.number(),
  handler: async (ctx, { table }) => {
    return await ctx.db
      .query(table)
      .collect()
      .then(r => r.length);
  },
});
