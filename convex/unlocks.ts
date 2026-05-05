import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUnlockState = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const userId = identity.tokenIdentifier;

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) return false;
    if (prompt.isFree) return true;

    const single = await ctx.db
      .query("unlocks")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();
    if (single) return true;

    const pack = await ctx.db
      .query("unlocks")
      .withIndex("by_userId_and_subcategoryId", (q) =>
        q.eq("userId", userId).eq("subcategoryId", prompt.subcategoryId)
      )
      .unique();
    return !!pack;
  },
});

export const getUserUnlocks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;
    const unlocks = await ctx.db
      .query("unlocks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(200);
    const promptIds = [
      ...new Set(unlocks.map((u) => u.promptId).filter(Boolean)),
    ];
    const prompts = await Promise.all(
      promptIds.map((id) => ctx.db.get(id!))
    );
    return prompts
      .filter(Boolean)
      .map(({ promptText: _, ...rest }: any) => rest);
  },
});
