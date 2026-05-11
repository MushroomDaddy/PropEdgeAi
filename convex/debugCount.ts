import { query } from "./_generated/server";
import { v } from "convex/values";

export const counts = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const props = await ctx.db.query("props").collect();
    const players = await ctx.db.query("players").collect();
    const users = await ctx.db.query("users").collect();
    const pickResults = await ctx.db.query("pickResults").collect();
    const modelPreds = await ctx.db.query("modelPredictions").collect();
    const gameLogs = await ctx.db.query("playerGameLogs").collect();
    const snapshots = await ctx.db.query("propSnapshots").collect();
    return {
      props: props.length,
      players: players.length,
      users: users.length,
      userIds: users.map(u => ({ id: u._id, email: u.email })),
      pickResults: pickResults.length,
      modelPreds: modelPreds.length,
      gameLogs: gameLogs.length,
      snapshots: snapshots.length,
    };
  },
});
