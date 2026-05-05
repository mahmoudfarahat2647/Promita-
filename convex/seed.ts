import { mutation } from "./_generated/server";

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const podId = await ctx.db.insert("categories", {
      name: "POD",
      slug: "pod",
      icon: "shirt",
    });
    const marketingId = await ctx.db.insert("categories", {
      name: "Marketing",
      slug: "marketing",
      icon: "megaphone",
    });
    await ctx.db.insert("subcategories", {
      name: "T-Shirts",
      slug: "tshirts",
      categoryId: podId,
      description: "AI prompts for t-shirt print-on-demand designs",
      gumroadPackId: "",
    });
    await ctx.db.insert("subcategories", {
      name: "Stickers",
      slug: "stickers",
      categoryId: podId,
      description: "AI prompts for sticker designs",
      gumroadPackId: "",
    });
    await ctx.db.insert("subcategories", {
      name: "Mockups",
      slug: "mockups",
      categoryId: podId,
      description: "AI prompts for product mockup scenes",
      gumroadPackId: "",
    });
    await ctx.db.insert("subcategories", {
      name: "Social Media",
      slug: "social-media",
      categoryId: marketingId,
      description: "AI prompts for social media content",
      gumroadPackId: "",
    });
    await ctx.db.insert("subcategories", {
      name: "Product Photography",
      slug: "product-photography",
      categoryId: marketingId,
      description: "AI prompts for product photography",
      gumroadPackId: "",
    });
    await ctx.db.insert("subcategories", {
      name: "Ad Creatives",
      slug: "ad-creatives",
      categoryId: marketingId,
      description: "AI prompts for ad creatives",
      gumroadPackId: "",
    });
    return podId;
  },
});
