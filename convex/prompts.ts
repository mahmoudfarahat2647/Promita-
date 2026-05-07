import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const listBySubcategory = query({
  args: {
    subcategoryId: v.id("subcategories"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("prompts")
      .withIndex("by_subcategoryId_and_published", (q) =>
        q.eq("subcategoryId", args.subcategoryId).eq("isPublished", true)
      )
      .paginate(args.paginationOpts);
    return {
      ...result,
      page: result.page.map(({ promptText: _, ...rest }) => rest),
    };
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .take(8);
    return prompts.map(({ promptText: _, ...rest }) => rest);
  },
});

export const getFree = query({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_published_and_free", (q) =>
        q.eq("isPublished", true).eq("isFree", true)
      )
      .order("desc")
      .take(8);
    return prompts.map(({ promptText: _, ...rest }) => rest);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const prompt = await ctx.db
      .query("prompts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!prompt) return null;
    const { promptText: _, ...publicFields } = prompt;
    return publicFields;
  },
});

export const getById = query({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.id);
    if (!prompt) return null;
    const { promptText: _, ...publicFields } = prompt;
    return publicFields;
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return ctx.storage.getUrl(args.storageId);
  },
});

export const getPromptText = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) return null;
    if (prompt.isFree) return prompt.promptText;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.tokenIdentifier;

    const singleUnlock = await ctx.db
      .query("unlocks")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();
    if (singleUnlock) return prompt.promptText;

    const packUnlock = await ctx.db
      .query("unlocks")
      .withIndex("by_userId_and_subcategoryId", (q) =>
        q.eq("userId", userId).eq("subcategoryId", prompt.subcategoryId)
      )
      .unique();
    if (packUnlock) return prompt.promptText;

    return null;
  },
});

export const getAllPublishedSlugs = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("prompts")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .take(500);
  },
});
