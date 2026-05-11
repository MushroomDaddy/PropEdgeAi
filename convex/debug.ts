import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const checkAuth = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { error: "No identity", identity: null };
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();
    
    const bankroll = user ? await ctx.db
      .query("bankroll")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect() : [];
      
    return {
      identityEmail: identity.email,
      identityName: identity.name,
      userFound: !!user,
      userId: user?._id,
      bankrollCount: bankroll.length,
    };
  },
});

export const checkData = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const bankroll = await ctx.db.query("bankroll").collect();
    return {
      userCount: users.length,
      users: users.slice(0, 3).map((u: any) => ({ _id: u._id, email: u.email, name: u.name })),
      bankrollCount: bankroll.length,
      bankrollUserIds: bankroll.map((b: any) => b.userId),
    };
  },
});
