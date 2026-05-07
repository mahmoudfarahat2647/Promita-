import { query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").take(20);
    const subcategories = await ctx.db.query("subcategories").take(100);
    return categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter(
        (sub) => sub.categoryId === cat._id
      ),
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getSubcategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("subcategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
