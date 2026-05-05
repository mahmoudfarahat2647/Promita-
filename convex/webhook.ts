import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const processGumroadPurchase = internalMutation({
  args: {
    gumroadOrderId: v.string(),
    clerkUserId: v.string(),
    promptId: v.optional(v.id("prompts")),
    subcategoryId: v.optional(v.id("subcategories")),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("unlocks")
      .withIndex("by_gumroadOrderId", (q) =>
        q.eq("gumroadOrderId", args.gumroadOrderId)
      )
      .unique();
    if (existing) return { alreadyProcessed: true };

    const now = Date.now();

    if (args.promptId) {
      await ctx.db.insert("unlocks", {
        userId: args.clerkUserId,
        promptId: args.promptId,
        type: "single",
        gumroadOrderId: args.gumroadOrderId,
        unlockedAt: now,
      });
      await ctx.db.insert("purchases", {
        userId: args.clerkUserId,
        type: "single",
        promptId: args.promptId,
        amount: args.amount,
        gumroadOrderId: args.gumroadOrderId,
        createdAt: now,
      });
    } else if (args.subcategoryId) {
      const prompts = await ctx.db
        .query("prompts")
        .withIndex("by_subcategoryId_and_published", (q) =>
          q
            .eq("subcategoryId", args.subcategoryId!)
            .eq("isPublished", true)
        )
        .take(200);
      for (const prompt of prompts) {
        await ctx.db.insert("unlocks", {
          userId: args.clerkUserId,
          promptId: prompt._id,
          subcategoryId: args.subcategoryId,
          type: "pack",
          gumroadOrderId: args.gumroadOrderId,
          unlockedAt: now,
        });
      }
      await ctx.db.insert("purchases", {
        userId: args.clerkUserId,
        type: "pack",
        subcategoryId: args.subcategoryId,
        amount: args.amount,
        gumroadOrderId: args.gumroadOrderId,
        createdAt: now,
      });
    }

    return { alreadyProcessed: false };
  },
});
