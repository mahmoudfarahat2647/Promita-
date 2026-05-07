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
    const tshirtsId = await ctx.db.insert("subcategories", {
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
    const dummyPromptId = await ctx.db.insert("prompts", {
      title: "Neon Cyberpunk T-Shirt Design",
      slug: "neon-cyberpunk-tshirt",
      description: "A highly detailed neon cyberpunk character design perfect for black t-shirts.",
      promptText: "A highly detailed illustration of a cyberpunk character wearing a neon jacket, vibrant pink and cyan lighting, dark alleyway background, hyperrealistic, 8k resolution, suitable for t-shirt print --v 6.0 --ar 4:5",
      isFree: true,
      price: 0,
      aiTool: "midjourney",
      subcategoryId: tshirtsId, 
      gumroadProductId: "",
      likeCount: 42,
      isPublished: true,
      isFeatured: true,
    });

    const dummyPrompt2Id = await ctx.db.insert("prompts", {
      title: "Minimalist Brand Identity Mockup",
      slug: "minimalist-brand-identity",
      description: "A clean, minimalist brand identity mockup scene with business cards and letterhead.",
      promptText: "A top-down view of a minimalist branding mockup scene. White business cards and letterhead on a light beige textured background. Soft natural window lighting, photorealistic, professional photography --v 6.0",
      isFree: false,
      price: 4.99,
      aiTool: "midjourney",
      subcategoryId: tshirtsId,
      gumroadProductId: "dummy_product",
      likeCount: 128,
      isPublished: true,
      isFeatured: true,
    });

    return { podId, marketingId };
  },
});
