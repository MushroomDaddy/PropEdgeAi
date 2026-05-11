import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("sports"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      icon: v.string(),
      active: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("sports").collect();
  },
});
