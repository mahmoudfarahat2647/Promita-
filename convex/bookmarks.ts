import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleBookmark = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("bookmarks", { userId, promptId: args.promptId });
      return true;
    }
  },
});

export const getBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(100);
    const prompts = await Promise.all(
      bookmarks.map((b) => ctx.db.get(b.promptId))
    );
    return prompts
      .filter(Boolean)
      .map(({ promptText: _, ...rest }: any) => rest);
  },
});
