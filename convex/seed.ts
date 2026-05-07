import { mutation } from "./_generated/server";

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // --- Categories ---
    const existingCategories = await ctx.db.query("categories").collect();
    let podId: string;
    let marketingId: string;

    if (existingCategories.length > 0) {
      const pod = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", "pod"))
        .first();
      const marketing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", "marketing"))
        .first();
      if (!pod || !marketing) return { message: "unexpected category state" };
      podId = pod._id;
      marketingId = marketing._id;
    } else {
      podId = await ctx.db.insert("categories", {
        name: "POD",
        slug: "pod",
        icon: "shirt",
      });
      marketingId = await ctx.db.insert("categories", {
        name: "Marketing",
        slug: "marketing",
        icon: "megaphone",
      });
    }

    // --- Subcategories ---
    const existingSubcategories = await ctx.db.query("subcategories").collect();
    let tshirtsId: string;
    let stickersId: string;
    let mockupsId: string;
    let socialMediaId: string;
    let productPhotographyId: string;
    let adCreativesId: string;

    if (existingSubcategories.length > 0) {
      const fetch = async (slug: string) => {
        const sub = await ctx.db
          .query("subcategories")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .first();
        if (!sub) throw new Error(`subcategory not found: ${slug}`);
        return sub._id;
      };
      tshirtsId = await fetch("tshirts");
      stickersId = await fetch("stickers");
      mockupsId = await fetch("mockups");
      socialMediaId = await fetch("social-media");
      productPhotographyId = await fetch("product-photography");
      adCreativesId = await fetch("ad-creatives");
    } else {
      tshirtsId = await ctx.db.insert("subcategories", {
        name: "T-Shirts",
        slug: "tshirts",
        categoryId: podId as any,
        description: "AI prompts for t-shirt print-on-demand designs",
        gumroadPackId: "",
      });
      stickersId = await ctx.db.insert("subcategories", {
        name: "Stickers",
        slug: "stickers",
        categoryId: podId as any,
        description: "AI prompts for sticker designs",
        gumroadPackId: "",
      });
      mockupsId = await ctx.db.insert("subcategories", {
        name: "Mockups",
        slug: "mockups",
        categoryId: podId as any,
        description: "AI prompts for product mockup scenes",
        gumroadPackId: "",
      });
      socialMediaId = await ctx.db.insert("subcategories", {
        name: "Social Media",
        slug: "social-media",
        categoryId: marketingId as any,
        description: "AI prompts for social media content",
        gumroadPackId: "",
      });
      productPhotographyId = await ctx.db.insert("subcategories", {
        name: "Product Photography",
        slug: "product-photography",
        categoryId: marketingId as any,
        description: "AI prompts for product photography",
        gumroadPackId: "",
      });
      adCreativesId = await ctx.db.insert("subcategories", {
        name: "Ad Creatives",
        slug: "ad-creatives",
        categoryId: marketingId as any,
        description: "AI prompts for ad creatives",
        gumroadPackId: "",
      });
    }

    // --- Prompts ---
    const existingPrompts = await ctx.db.query("prompts").collect();
    if (existingPrompts.length > 0) {
      return { message: "prompts already seeded" };
    }

    // POD — T-Shirts (4)
    await ctx.db.insert("prompts", {
      title: "Vintage Botanical T-Shirt Design",
      slug: "vintage-botanical-tshirt",
      description: "Intricate line art of tropical leaves and flowers in a monochrome ink style — perfect for screen printing.",
      promptText: "Vintage botanical illustration t-shirt design, intricate line art of tropical leaves and flowers, monochrome ink style, suitable for screen printing, white background, high contrast, no text, 1800s botanical journal aesthetic --ar 1:1 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
      isFree: true,
      price: 0,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: tshirtsId as any,
      likeCount: 87,
      isPublished: true,
      isFeatured: true,
      searchText: "vintage botanical tshirt design midjourney pod line art flowers",
    });

    await ctx.db.insert("prompts", {
      title: "Abstract Geometric Wave Tee",
      slug: "abstract-geometric-wave-tee",
      description: "Bold geometric wave pattern with sharp angles and gradient flow — great for minimalist streetwear.",
      promptText: "Abstract geometric wave pattern t-shirt design, bold angular shapes, black and white gradient flow, vector art style, clean lines, high contrast, suitable for DTG printing, white background, no text, modern streetwear aesthetic --ar 1:1 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      isFree: false,
      price: 3.99,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: tshirtsId as any,
      likeCount: 214,
      isPublished: true,
      isFeatured: true,
      searchText: "abstract geometric wave tee midjourney pod streetwear",
    });

    await ctx.db.insert("prompts", {
      title: "Retro Space Explorer Graphic",
      slug: "retro-space-explorer-graphic",
      description: "70s-inspired retro astronaut illustration with bold typography and cosmic color palette.",
      promptText: "Retro 1970s space explorer t-shirt graphic, vintage NASA aesthetic, astronaut silhouette against cosmic background, warm orange and brown color palette, bold distressed typography, screen print style, white background, no modern elements --ar 1:1 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
      isFree: false,
      price: 4.99,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: tshirtsId as any,
      likeCount: 156,
      isPublished: true,
      isFeatured: false,
      searchText: "retro space explorer graphic midjourney pod astronaut vintage",
    });

    await ctx.db.insert("prompts", {
      title: "Japanese Minimalist Streetwear",
      slug: "japanese-minimalist-streetwear",
      description: "Clean Japanese kanji and brush stroke design — minimal, high-impact, works on any colour tee.",
      promptText: "Japanese minimalist t-shirt design, single kanji character with bold brush stroke, ink wash style, asymmetric composition, black on white, zen aesthetic, suitable for screen printing, no background clutter, editorial fashion look --ar 1:1 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
      isFree: true,
      price: 0,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: tshirtsId as any,
      likeCount: 301,
      isPublished: true,
      isFeatured: true,
      searchText: "japanese minimalist streetwear midjourney pod kanji brush",
    });

    // POD — Stickers (3)
    await ctx.db.insert("prompts", {
      title: "Kawaii Animal Sticker Pack",
      slug: "kawaii-animal-sticker-pack",
      description: "6 adorable chibi animals with thick outlines and pastel palette — die-cut ready, transparent background.",
      promptText: "Kawaii chibi animal sticker set, 6 different animals (cat, dog, rabbit, bear, fox, panda), pastel color palette, thick black outline, cute expressions, white background, die-cut ready, flat design, PNG transparent background --ar 1:1 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      isFree: false,
      price: 4.99,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: stickersId as any,
      likeCount: 432,
      isPublished: true,
      isFeatured: true,
      searchText: "kawaii animal sticker pack midjourney pod cute pastel die-cut",
    });

    await ctx.db.insert("prompts", {
      title: "Y2K Holographic Die-Cut Sticker",
      slug: "y2k-holographic-die-cut",
      description: "Shiny Y2K-era holographic sticker design with chrome butterflies and star motifs.",
      promptText: "Y2K aesthetic holographic die-cut sticker, chrome metallic butterfly surrounded by stars and sparkles, shiny iridescent finish, thick outline, transparent background, glossy sticker style, early 2000s nostalgia, bold colors --ar 1:1 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
      isFree: true,
      price: 0,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: stickersId as any,
      likeCount: 98,
      isPublished: true,
      isFeatured: false,
      searchText: "y2k holographic die-cut sticker midjourney pod chrome butterfly",
    });

    await ctx.db.insert("prompts", {
      title: "Floral Watercolor Sticker Set",
      slug: "floral-watercolor-sticker-set",
      description: "Soft watercolor wildflowers and botanicals — elegant sticker set for journals and planners.",
      promptText: "Floral watercolor sticker set, 8 individual wildflower and botanical elements (lavender, daisy, rose, eucalyptus), soft pastel watercolor style, transparent background, hand-painted look, elegant and feminine, suitable for planner stickers --ar 1:1 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&q=80",
      isFree: false,
      price: 2.99,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: stickersId as any,
      likeCount: 187,
      isPublished: true,
      isFeatured: false,
      searchText: "floral watercolor sticker set midjourney pod botanical planner",
    });

    // POD — Mockups (3)
    await ctx.db.insert("prompts", {
      title: "Urban Lifestyle Flat-Lay Mockup",
      slug: "urban-lifestyle-flat-lay-mockup",
      description: "Overhead flat-lay mockup scene with coffee, sunglasses, and a white tee on concrete.",
      promptText: "Urban lifestyle flat lay mockup, white t-shirt folded neatly on concrete surface, surrounded by coffee cup, sunglasses, and succulent plant, overhead shot, natural daylight, editorial photography style, product photography, clean and modern aesthetic --ar 4:5 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
      isFree: false,
      price: 4.99,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: mockupsId as any,
      likeCount: 128,
      isPublished: true,
      isFeatured: true,
      searchText: "urban lifestyle flat-lay mockup midjourney pod overhead concrete",
    });

    await ctx.db.insert("prompts", {
      title: "Studio Hanging Apparel Scene",
      slug: "studio-hanging-apparel-scene",
      description: "Clean studio shot of a t-shirt hanging against a white wall — minimal, versatile mockup.",
      promptText: "Studio apparel mockup, white t-shirt hanging on a wooden hanger against a clean white wall, soft diffused studio lighting, fashion editorial style, high resolution product photography, professional and minimal --ar 4:5 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      isFree: true,
      price: 0,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: mockupsId as any,
      likeCount: 73,
      isPublished: true,
      isFeatured: false,
      searchText: "studio hanging apparel scene mockup midjourney pod white wall",
    });

    await ctx.db.insert("prompts", {
      title: "Minimal White Background Tee Mockup",
      slug: "minimal-white-background-tee-mockup",
      description: "Ghost-style flat mockup on pure white — drop shadow included, ready for Etsy listings.",
      promptText: "Ghost mannequin t-shirt mockup, white crew-neck tee on invisible mannequin, pure white background, soft drop shadow, front view, perfect for e-commerce product listing, professional product photography, high resolution, clean and crisp --ar 4:5 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
      isFree: false,
      price: 3.99,
      aiTool: "midjourney",
      categoryId: podId as any,
      subcategoryId: mockupsId as any,
      likeCount: 241,
      isPublished: true,
      isFeatured: false,
      searchText: "minimal white background tee mockup midjourney pod ghost mannequin etsy",
    });

    // Marketing — Social Media (3)
    await ctx.db.insert("prompts", {
      title: "Instagram Carousel Sales Post",
      slug: "instagram-carousel-sales-post",
      description: "5-slide carousel script for launching a new POD design — hook, benefits, CTA included.",
      promptText: "Write a 5-slide Instagram carousel post for a print-on-demand seller launching a new t-shirt design. Slide 1: attention-grabbing hook. Slides 2-4: product benefits, social proof, and lifestyle use cases. Slide 5: clear CTA with urgency. Use casual, energetic tone. Include relevant hashtag suggestions at the end.",
      imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
      isFree: true,
      price: 0,
      aiTool: "chatgpt",
      categoryId: marketingId as any,
      subcategoryId: socialMediaId as any,
      likeCount: 319,
      isPublished: true,
      isFeatured: true,
      searchText: "instagram carousel sales post chatgpt marketing social media pod",
    });

    await ctx.db.insert("prompts", {
      title: "TikTok Viral Hook Generator",
      slug: "tiktok-viral-hook-generator",
      description: "Generate 10 scroll-stopping TikTok hooks for your POD product videos — tested viral formats.",
      promptText: "Generate 10 viral TikTok video hooks for a print-on-demand seller promoting a [product type] design targeting [niche]. Use these formats: curiosity gap, bold claim, \"POV:\", controversial opinion, and \"Nobody talks about...\". Each hook must be under 7 words. Output as a numbered list with the format type labeled.",
      imageUrl: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&q=80",
      isFree: false,
      price: 4.99,
      aiTool: "chatgpt",
      categoryId: marketingId as any,
      subcategoryId: socialMediaId as any,
      likeCount: 512,
      isPublished: true,
      isFeatured: true,
      searchText: "tiktok viral hook generator chatgpt marketing social media pod video",
    });

    await ctx.db.insert("prompts", {
      title: "Pinterest SEO Pin Description",
      slug: "pinterest-seo-pin-description",
      description: "SEO-optimised Pinterest pin descriptions that drive clicks to your Etsy or Redbubble store.",
      promptText: "Write 5 SEO-optimised Pinterest pin descriptions for a print-on-demand [product] in the [niche] niche. Each description should be 150-300 characters, include 3-5 relevant keywords naturally, have a clear value proposition, and end with a soft CTA. Format as a numbered list. Avoid hashtags.",
      imageUrl: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80",
      isFree: false,
      price: 2.99,
      aiTool: "gemini",
      categoryId: marketingId as any,
      subcategoryId: socialMediaId as any,
      likeCount: 88,
      isPublished: true,
      isFeatured: false,
      searchText: "pinterest seo pin description gemini marketing social media etsy redbubble",
    });

    // Marketing — Product Photography (3)
    await ctx.db.insert("prompts", {
      title: "Luxury Product Close-Up Shot",
      slug: "luxury-product-close-up-shot",
      description: "High-end close-up product shot on black marble with dramatic side lighting and gold reflections.",
      promptText: "Luxury product close-up photography, [product] on black marble surface, dramatic side lighting with deep shadows, gold accent reflections, macro lens depth of field, high-end brand aesthetic, commercial photography style, 8k resolution --ar 4:5 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
      isFree: false,
      price: 4.99,
      aiTool: "midjourney",
      categoryId: marketingId as any,
      subcategoryId: productPhotographyId as any,
      likeCount: 267,
      isPublished: true,
      isFeatured: true,
      searchText: "luxury product close-up shot midjourney marketing photography marble gold",
    });

    await ctx.db.insert("prompts", {
      title: "Natural Light Lifestyle Product Scene",
      slug: "natural-light-lifestyle-product-scene",
      description: "Warm, airy lifestyle scene with natural window light — ideal for Etsy hero images.",
      promptText: "Natural light lifestyle product photography, [product] placed near a bright window on a white linen surface, soft morning light, warm tones, shallow depth of field, lifestyle brand aesthetic, authentic and organic feel, no harsh shadows --ar 4:5 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      isFree: true,
      price: 0,
      aiTool: "midjourney",
      categoryId: marketingId as any,
      subcategoryId: productPhotographyId as any,
      likeCount: 145,
      isPublished: true,
      isFeatured: false,
      searchText: "natural light lifestyle product scene midjourney marketing photography etsy",
    });

    await ctx.db.insert("prompts", {
      title: "Dark Moody Studio Product Photo",
      slug: "dark-moody-studio-product-photo",
      description: "Cinematic dark studio shot with rim lighting — premium feel for high-ticket POD products.",
      promptText: "Dark moody studio product photography, [product] on a dark slate surface, cinematic rim lighting from the left, deep blacks, subtle smoke or mist in background, premium brand aesthetic, editorial fashion photography style --ar 4:5 --v 6",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      isFree: false,
      price: 3.99,
      aiTool: "midjourney",
      categoryId: marketingId as any,
      subcategoryId: productPhotographyId as any,
      likeCount: 198,
      isPublished: true,
      isFeatured: false,
      searchText: "dark moody studio product photo midjourney marketing photography cinematic",
    });

    // Marketing — Ad Creatives (3)
    await ctx.db.insert("prompts", {
      title: "Facebook Ad Copy — POD Seller",
      slug: "facebook-ad-copy-pod-seller",
      description: "3 Facebook ad copy variations (pain-point, social proof, lifestyle) ready to test immediately.",
      promptText: "Write 3 Facebook ad copy variations for a print-on-demand t-shirt targeting [niche] enthusiasts aged 25-45. Each variation should include: primary text (under 125 chars), headline (under 40 chars), and description (under 30 chars). Use pain-point, social proof, and lifestyle angles respectively. Include a strong CTA in each.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      isFree: false,
      price: 4.99,
      aiTool: "chatgpt",
      categoryId: marketingId as any,
      subcategoryId: adCreativesId as any,
      likeCount: 378,
      isPublished: true,
      isFeatured: true,
      searchText: "facebook ad copy pod seller chatgpt marketing ad creatives tshirt",
    });

    await ctx.db.insert("prompts", {
      title: "Google Ads Headline Generator",
      slug: "google-ads-headline-generator",
      description: "Generate 15 Google Ads headlines under 30 chars for your POD product — high CTR angles included.",
      promptText: "Generate 15 Google Ads headlines for a print-on-demand [product] in the [niche] niche. Each headline must be under 30 characters. Cover these angles: urgency, uniqueness, price value, social proof, and emotion. Label each with its angle. Format as a numbered list.",
      imageUrl: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&q=80",
      isFree: true,
      price: 0,
      aiTool: "chatgpt",
      categoryId: marketingId as any,
      subcategoryId: adCreativesId as any,
      likeCount: 156,
      isPublished: true,
      isFeatured: false,
      searchText: "google ads headline generator chatgpt marketing ad creatives pod ctr",
    });

    await ctx.db.insert("prompts", {
      title: "Email Campaign — Product Launch",
      slug: "email-campaign-product-launch",
      description: "3-email launch sequence (teaser, launch day, last chance) to sell out your new POD drop.",
      promptText: "Write a 3-email product launch sequence for a print-on-demand seller releasing a new [product] design. Email 1 (3 days before): curiosity-building teaser. Email 2 (launch day): full reveal with direct buy link and urgency. Email 3 (48 hours later): last-chance scarcity close. Each email: subject line, preview text, and body copy. Warm, conversational tone.",
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
      isFree: false,
      price: 3.99,
      aiTool: "gemini",
      categoryId: marketingId as any,
      subcategoryId: adCreativesId as any,
      likeCount: 94,
      isPublished: true,
      isFeatured: false,
      searchText: "email campaign product launch gemini marketing ad creatives pod sequence",
    });

    return { message: "seeded successfully", promptCount: 20 };
  },
});
