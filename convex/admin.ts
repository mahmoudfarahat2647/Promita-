import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

async function requireAdmin(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const adminToken = process.env.ADMIN_CLERK_TOKEN_IDENTIFIER;
  if (!adminToken || identity.tokenIdentifier !== adminToken)
    throw new Error("Forbidden");
}

export const createPrompt = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    promptText: v.string(),
    categoryId: v.id("categories"),
    subcategoryId: v.id("subcategories"),
    aiTool: v.union(v.literal("chatgpt"), v.literal("gemini")),
    isFree: v.boolean(),
    price: v.number(),
    gumroadProductId: v.optional(v.string()),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("prompts", {
      ...args,
      likeCount: 0,
      isPublished: false,
      searchText: `${args.title} ${args.description}`,
    });
  },
});

export const updatePrompt = mutation({
  args: {
    id: v.id("prompts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    promptText: v.optional(v.string()),
    aiTool: v.optional(v.union(v.literal("chatgpt"), v.literal("gemini"))),
    isFree: v.optional(v.boolean()),
    price: v.optional(v.number()),
    gumroadProductId: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, title, description, ...rest } = args;
    const patch: Record<string, unknown> = { ...rest };
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (title !== undefined || description !== undefined) {
      const existing = await ctx.db.get(id);
      if (existing) {
        patch.searchText = `${title ?? existing.title} ${description ?? existing.description}`;
      }
    }
    await ctx.db.patch(id, patch);
  },
});

export const deletePrompt = mutation({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const togglePublished = mutation({
  args: { id: v.id("prompts"), isPublished: v.boolean() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isPublished: args.isPublished });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("prompts").order("desc").take(500);
  },
});
