import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchPrompts = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    if (!args.q.trim()) return [];
    const results = await ctx.db
      .query("prompts")
      .withSearchIndex("search_prompts", (q) =>
        q.search("searchText", args.q).eq("isPublished", true)
      )
      .take(20);
    return results.map(({ promptText: _, ...rest }) => rest);
  },
});
