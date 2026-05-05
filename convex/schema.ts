import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
  }).index("by_slug", ["slug"]),

  subcategories: defineTable({
    name: v.string(),
    slug: v.string(),
    categoryId: v.id("categories"),
    description: v.string(),
    gumroadPackId: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_categoryId", ["categoryId"]),

  prompts: defineTable({
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
    likeCount: v.number(),
    isPublished: v.boolean(),
    searchText: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_subcategoryId_and_published", ["subcategoryId", "isPublished"])
    .index("by_published_and_free", ["isPublished", "isFree"])
    .index("by_published", ["isPublished"])
    .searchIndex("search_prompts", {
      searchField: "searchText",
      filterFields: ["isPublished"],
    }),

  unlocks: defineTable({
    userId: v.string(),
    promptId: v.optional(v.id("prompts")),
    subcategoryId: v.optional(v.id("subcategories")),
    type: v.union(v.literal("single"), v.literal("pack")),
    gumroadOrderId: v.string(),
    unlockedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_promptId", ["userId", "promptId"])
    .index("by_userId_and_subcategoryId", ["userId", "subcategoryId"])
    .index("by_gumroadOrderId", ["gumroadOrderId"]),

  likes: defineTable({
    userId: v.string(),
    promptId: v.id("prompts"),
  })
    .index("by_userId_and_promptId", ["userId", "promptId"])
    .index("by_promptId", ["promptId"]),

  bookmarks: defineTable({
    userId: v.string(),
    promptId: v.id("prompts"),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_promptId", ["userId", "promptId"]),

  purchases: defineTable({
    userId: v.string(),
    type: v.union(v.literal("single"), v.literal("pack")),
    promptId: v.optional(v.id("prompts")),
    subcategoryId: v.optional(v.id("subcategories")),
    amount: v.number(),
    gumroadOrderId: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
