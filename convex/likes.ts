import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleLike = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.promptId, {
        likeCount: Math.max(0, prompt.likeCount - 1),
      });
      return false;
    } else {
      await ctx.db.insert("likes", { userId, promptId: args.promptId });
      await ctx.db.patch(args.promptId, { likeCount: prompt.likeCount + 1 });
      return true;
    }
  },
});

export const getLikeState = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const userId = identity.tokenIdentifier;
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();
    return !!existing;
  },
});
