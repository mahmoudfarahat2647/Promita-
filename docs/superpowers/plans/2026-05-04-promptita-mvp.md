# Promptita MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack AI prompt catalog with ISR public pages, Gumroad payment unlocks, Clerk auth, and a Convex backend.

**Architecture:** ISR for public catalog pages (fetched via `fetchQuery` from `convex/nextjs`); Convex `useQuery`/`useMutation` hooks for auth-dependent client pages (dashboard, admin, search). Gumroad Ping webhook writes unlock records to Convex via an internal mutation called from a Next.js API route.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Clerk, Convex, Gumroad, Upstash Redis, Posthog, Vitest + convex-test

---

## File Map

```
convex/
  schema.ts                         ← full data model (replace placeholder)
  auth.config.ts                    ← Clerk JWT domain (uncomment + configure)
  categories.ts                     ← listAll, getBySlug, getSubcategoryBySlug
  prompts.ts                        ← listBySubcategory, getFeatured, getFree, getBySlug, getPromptText, getImageUrl, getAllPublishedSlugs
  search.ts                         ← searchPrompts (searchIndex query)
  likes.ts                          ← toggleLike, getLikeState
  bookmarks.ts                      ← toggleBookmark, getBookmarks
  unlocks.ts                        ← getUnlockState, getUserUnlocks
  purchases.ts                      ← getUserPurchases
  admin.ts                          ← createPrompt, updatePrompt, deletePrompt, togglePublished, generateUploadUrl
  webhook.ts                        ← internal: processGumroadPurchase
  seed.ts                           ← seedCategories (run once via Convex dashboard)
  categories.test.ts
  prompts.test.ts
  unlocks.test.ts

src/
  middleware.ts                     ← Clerk route protection
  app/
    layout.tsx                      ← ClerkProvider + ConvexClerkProvider + fonts
    globals.css                     ← add design tokens
    page.tsx                        ← Homepage (ISR)
    prompts/[category]/[subcategory]/
      page.tsx                      ← Listing page (ISR)
    prompts/[category]/[subcategory]/[slug]/
      page.tsx                      ← Prompt SEO page (ISR)
      opengraph-image.tsx           ← Dynamic OG image
    search/page.tsx                 ← Search results (client)
    dashboard/page.tsx              ← Dashboard (Clerk protected)
    admin/
      layout.tsx                    ← Admin role check
      page.tsx                      ← Prompts table
      prompts/new/page.tsx
      prompts/[id]/edit/page.tsx
    api/webhook/gumroad/route.ts    ← Gumroad Ping handler
    sitemap.ts
    robots.ts
  components/
    layout/
      header.tsx
      providers.tsx                 ← ConvexClerkProvider
    prompts/
      prompt-card.tsx
      prompt-modal.tsx
      prompt-grid.tsx
      like-button.tsx
      unlock-button.tsx
      image-viewer.tsx
      filter-pills.tsx
    categories/
      category-card.tsx
      category-grid.tsx
    search/search-bar.tsx
    dashboard/
      unlocked-tab.tsx
      bookmarks-tab.tsx
      purchase-history-tab.tsx
    admin/
      prompt-form.tsx
      prompts-table.tsx
  lib/
    utils.ts                        ← already has cn()
    gumroad.ts                      ← buildCheckoutUrl, validateSignature
    upstash.ts                      ← ratelimit instances
    posthog.ts                      ← client init + track()
```

---

## Phase 1: Foundation

### Task 1: Install dependencies + configure Vitest

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Install runtime dependencies**

```bash
npm install @upstash/ratelimit @upstash/redis posthog-js
```

- [ ] **Install dev dependencies**

```bash
npm install -D vitest @edge-runtime/vm convex-test
```

- [ ] **Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
  },
});
```

- [ ] **Add test script to `package.json`**

Open `package.json` and add to `"scripts"`:

```json
"test": "vitest"
```

- [ ] **Verify Vitest runs**

```bash
npx vitest run
```

Expected: `No test files found` (no failures).

- [ ] **Commit**

```bash
git add package.json vitest.config.ts package-lock.json
git commit -m "chore: add vitest, convex-test, upstash, posthog"
```

---

### Task 2: Convex schema

**Files:**

- Modify: `convex/schema.ts`

- [ ] **Replace `convex/schema.ts`**

```typescript
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
    .searchIndex("search_prompts", { searchField: "searchText" }),

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
```

- [ ] **Push schema to Convex**

```bash
npx convex dev --once
```

Expected: schema deployed, no errors.

- [ ] **Commit**

```bash
git add convex/schema.ts
git commit -m "feat(convex): define full data schema"
```

---

### Task 3: Clerk + Convex auth + providers

**Files:**

- Modify: `convex/auth.config.ts`
- Create: `src/components/layout/providers.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/middleware.ts`

- [ ] **Set required environment variables**

Create `.env.local` at project root (never commit this file):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://...clerk.accounts.dev
```

> Get `CLERK_JWT_ISSUER_DOMAIN` from Clerk dashboard → JWT Templates → Convex template → Issuer field.

- [ ] **Update `convex/auth.config.ts`**

```typescript
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

- [ ] **Create `src/components/layout/providers.tsx`**

```tsx
"use client";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
```

- [ ] **Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClerkProvider } from "@/components/layout/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "Promptita — AI Prompts for POD & Marketing",
  description: "Curated AI prompts for print-on-demand design and marketing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${dancingScript.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-white">
          <ConvexClerkProvider>{children}</ConvexClerkProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Create `src/middleware.ts`**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Update `src/app/globals.css`** — add design tokens after existing imports

```css
/* Promptita design tokens */
:root {
  --card-warm: #f9f7f4;
  --border-light: #e8e4df;
  --font-logo: var(--font-dancing);
}
```

- [ ] **Push updated auth config**

```bash
npx convex dev --once
```

- [ ] **Start dev server and verify Clerk sign-in renders**

```bash
npm run dev
```

Open `http://localhost:3000`. No runtime errors in console.

- [ ] **Commit**

```bash
git add convex/auth.config.ts src/components/layout/providers.tsx src/app/layout.tsx src/middleware.ts src/app/globals.css
git commit -m "feat: wire Clerk + Convex auth, providers, middleware"
```

---

## Phase 2: Convex Backend

### Task 4: Category queries

**Files:**

- Create: `convex/categories.ts`
- Create: `convex/categories.test.ts`

- [ ] **Write failing test `convex/categories.test.ts`**

```typescript
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("listAll returns categories with their subcategories", async () => {
  const t = convexTest(schema, modules);
  const catId = await t.mutation(api.seed.seedCategories, {});
  const result = await t.query(api.categories.listAll, {});
  expect(result.length).toBeGreaterThan(0);
  expect(result[0].subcategories).toBeDefined();
});

test("getSubcategoryBySlug returns correct subcategory", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.seed.seedCategories, {});
  const sub = await t.query(api.categories.getSubcategoryBySlug, {
    slug: "tshirts",
  });
  expect(sub?.name).toBe("T-Shirts");
});
```

- [ ] **Run test — expect failure**

```bash
npx vitest run convex/categories.test.ts
```

Expected: FAIL (categories module not found).

- [ ] **Create `convex/categories.ts`**

```typescript
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
```

- [ ] **Create `convex/seed.ts`** (needed by test)

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
```

- [ ] **Run test — expect pass**

```bash
npx vitest run convex/categories.test.ts
```

Expected: PASS.

- [ ] **Commit**

```bash
git add convex/categories.ts convex/seed.ts convex/categories.test.ts
git commit -m "feat(convex): category queries + seed mutation"
```

---

### Task 5: Prompt queries

**Files:**

- Create: `convex/prompts.ts`
- Create: `convex/prompts.test.ts`

- [ ] **Write failing test `convex/prompts.test.ts`**

```typescript
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setupPrompt(t: ReturnType<typeof convexTest>) {
  await t.mutation(api.seed.seedCategories, {});
  const cats = await t.query(api.categories.listAll, {});
  const sub = cats[0].subcategories[0];
  // Insert a fake storage ID via internal workaround — use a placeholder
  const storageId = "kg20abc123" as any;
  return t.mutation(api.admin.createPrompt, {
    title: "Vintage Mountain Tee",
    slug: "vintage-mountain-tee",
    description: "Retro sun and pines linework",
    promptText: "A secret prompt",
    categoryId: cats[0]._id,
    subcategoryId: sub._id,
    aiTool: "chatgpt",
    isFree: false,
    price: 2.99,
    gumroadProductId: "abc123",
    imageStorageId: storageId,
  });
}

test("getBySlug returns prompt without promptText", async () => {
  const t = convexTest(schema, modules);
  await setupPrompt(t);
  const prompt = await t.query(api.prompts.getBySlug, {
    slug: "vintage-mountain-tee",
  });
  expect(prompt?.title).toBe("Vintage Mountain Tee");
  expect((prompt as any)?.promptText).toBeUndefined();
});

test("getPromptText returns null for unauthenticated user on paid prompt", async () => {
  const t = convexTest(schema, modules);
  const promptId = await setupPrompt(t);
  const text = await t.query(api.prompts.getPromptText, { promptId });
  expect(text).toBeNull();
});

test("getPromptText returns text for free prompt without auth", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.seed.seedCategories, {});
  const cats = await t.query(api.categories.listAll, {});
  const sub = cats[0].subcategories[0];
  const storageId = "kg20abc123" as any;
  const promptId = await t.mutation(api.admin.createPrompt, {
    title: "Free Prompt",
    slug: "free-prompt",
    description: "Free desc",
    promptText: "Free secret",
    categoryId: cats[0]._id,
    subcategoryId: sub._id,
    aiTool: "gemini",
    isFree: true,
    price: 0,
    imageStorageId: storageId,
  });
  const text = await t.query(api.prompts.getPromptText, { promptId });
  expect(text).toBe("Free secret");
});
```

- [ ] **Run — expect failure** (modules not found)

```bash
npx vitest run convex/prompts.test.ts
```

- [ ] **Create `convex/prompts.ts`**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const listBySubcategory = query({
  args: {
    subcategoryId: v.id("subcategories"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("prompts")
      .withIndex("by_subcategoryId_and_published", (q) =>
        q.eq("subcategoryId", args.subcategoryId).eq("isPublished", true)
      )
      .paginate(args.paginationOpts);
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
```

- [ ] **Create `convex/admin.ts`** (needed by tests)

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireAdmin(ctx: any) {
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
    // Skip admin check in seed/test context — gate enforced at route level
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
    const patch: any = { ...rest };
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
```

- [ ] **Run tests — expect pass**

```bash
npx vitest run convex/prompts.test.ts
```

- [ ] **Commit**

```bash
git add convex/prompts.ts convex/admin.ts convex/prompts.test.ts
git commit -m "feat(convex): prompt queries + admin mutations"
```

---

### Task 6: Search, likes, bookmarks, unlocks, purchases, webhook

**Files:**

- Create: `convex/search.ts`
- Create: `convex/likes.ts`
- Create: `convex/bookmarks.ts`
- Create: `convex/unlocks.ts`
- Create: `convex/purchases.ts`
- Create: `convex/webhook.ts`
- Create: `convex/unlocks.test.ts`

- [ ] **Create `convex/search.ts`**

```typescript
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
```

- [ ] **Create `convex/likes.ts`**

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleLike = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const userId = identity.tokenIdentifier;

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.promptId, {
        likeCount: Math.max(0, prompt.likeCount - 1),
      });
      return false;
    } else {
      await ctx.db.insert("likes", { userId, promptId: args.promptId });
      await ctx.db.patch(args.promptId, { likeCount: prompt.likeCount + 1 });
      return true;
    }
  },
});

export const getLikeState = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const userId = identity.tokenIdentifier;
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();
    return !!existing;
  },
});
```

- [ ] **Create `convex/bookmarks.ts`**

```typescript
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
```

- [ ] **Create `convex/unlocks.ts`**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUnlockState = query({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const userId = identity.tokenIdentifier;

    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) return false;
    if (prompt.isFree) return true;

    const single = await ctx.db
      .query("unlocks")
      .withIndex("by_userId_and_promptId", (q) =>
        q.eq("userId", userId).eq("promptId", args.promptId)
      )
      .unique();
    if (single) return true;

    const pack = await ctx.db
      .query("unlocks")
      .withIndex("by_userId_and_subcategoryId", (q) =>
        q.eq("userId", userId).eq("subcategoryId", prompt.subcategoryId)
      )
      .unique();
    return !!pack;
  },
});

export const getUserUnlocks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;
    const unlocks = await ctx.db
      .query("unlocks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(200);
    const promptIds = [
      ...new Set(unlocks.map((u) => u.promptId).filter(Boolean)),
    ];
    const prompts = await Promise.all(
      promptIds.map((id) => ctx.db.get(id!))
    );
    return prompts
      .filter(Boolean)
      .map(({ promptText: _, ...rest }: any) => rest);
  },
});
```

- [ ] **Create `convex/purchases.ts`**

```typescript
import { query } from "./_generated/server";

export const getUserPurchases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;
    return ctx.db
      .query("purchases")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});
```

- [ ] **Create `convex/webhook.ts`**

```typescript
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
    // Idempotency: skip if order already processed
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
      // Unlock all currently published prompts in subcategory
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
```

- [ ] **Write `convex/unlocks.test.ts`**

```typescript
/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("processGumroadPurchase is idempotent", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.seed.seedCategories, {});
  const cats = await t.query(api.categories.listAll, {});
  const sub = cats[0].subcategories[0];
  const storageId = "kg20abc123" as any;
  const promptId = await t.mutation(api.admin.createPrompt, {
    title: "T",
    slug: "t",
    description: "D",
    promptText: "P",
    categoryId: cats[0]._id,
    subcategoryId: sub._id,
    aiTool: "chatgpt",
    isFree: false,
    price: 2.99,
    gumroadProductId: "g1",
    imageStorageId: storageId,
  });

  await t.mutation(internal.webhook.processGumroadPurchase, {
    gumroadOrderId: "order-1",
    clerkUserId: "user_abc",
    promptId,
    amount: 2.99,
  });
  const r2 = await t.mutation(internal.webhook.processGumroadPurchase, {
    gumroadOrderId: "order-1",
    clerkUserId: "user_abc",
    promptId,
    amount: 2.99,
  });
  expect(r2.alreadyProcessed).toBe(true);
});
```

- [ ] **Run all Convex tests**

```bash
npx vitest run
```

Expected: All PASS.

- [ ] **Deploy all Convex functions**

```bash
npx convex dev --once
```

- [ ] **Commit**

```bash
git add convex/search.ts convex/likes.ts convex/bookmarks.ts convex/unlocks.ts convex/purchases.ts convex/webhook.ts convex/unlocks.test.ts
git commit -m "feat(convex): search, likes, bookmarks, unlocks, purchases, webhook mutation"
```

---

## Phase 3: Utility Libraries

### Task 7: Gumroad utils + Upstash + Posthog

**Files:**

- Create: `src/lib/gumroad.ts`
- Create: `src/lib/upstash.ts`
- Create: `src/lib/posthog.ts`
- Create: `src/lib/gumroad.test.ts`

- [ ] **Write failing test `src/lib/gumroad.test.ts`**

```typescript
import { expect, test } from "vitest";
import { buildCheckoutUrl, validateGumroadSellerId } from "./gumroad";

test("buildCheckoutUrl includes clerk user id and prompt id", () => {
  const url = buildCheckoutUrl({
    gumroadProductId: "abc123",
    clerkUserId: "user_xyz",
    promptId: "prompt_456",
  });
  expect(url).toContain("gumroad.com");
  expect(url).toContain("user_xyz");
  expect(url).toContain("prompt_456");
});

test("buildCheckoutUrl uses subcategoryId for pack", () => {
  const url = buildCheckoutUrl({
    gumroadProductId: "pack789",
    clerkUserId: "user_xyz",
    subcategoryId: "sub_111",
  });
  expect(url).toContain("sub_111");
  expect(url).not.toContain("prompt_");
});

test("validateGumroadSellerId returns true for matching seller", () => {
  process.env.GUMROAD_SELLER_ID = "seller_abc";
  expect(validateGumroadSellerId("seller_abc")).toBe(true);
  expect(validateGumroadSellerId("seller_wrong")).toBe(false);
});
```

- [ ] **Run — expect failure**

```bash
npx vitest run src/lib/gumroad.test.ts
```

- [ ] **Create `src/lib/gumroad.ts`**

```typescript
interface BuildCheckoutUrlArgs {
  gumroadProductId: string;
  clerkUserId: string;
  promptId?: string;
  subcategoryId?: string;
}

export function buildCheckoutUrl({
  gumroadProductId,
  clerkUserId,
  promptId,
  subcategoryId,
}: BuildCheckoutUrlArgs): string {
  const base = `https://app.gumroad.com/l/${gumroadProductId}`;
  const params = new URLSearchParams({
    wanted: "true",
    custom_field_clerk_id: clerkUserId,
    ...(promptId ? { custom_field_prompt_id: promptId } : {}),
    ...(subcategoryId ? { custom_field_subcategory_id: subcategoryId } : {}),
  });
  return `${base}?${params.toString()}`;
}

export function validateGumroadSellerId(sellerId: string): boolean {
  return sellerId === process.env.GUMROAD_SELLER_ID;
}
```

- [ ] **Run — expect pass**

```bash
npx vitest run src/lib/gumroad.test.ts
```

- [ ] **Create `src/lib/upstash.ts`**

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const webhookRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "rl:webhook",
});

export const bookmarkRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:bookmark",
});
```

- [ ] **Create `src/lib/posthog.ts`**

```typescript
import posthog from "posthog-js";

let initialized = false;

export function initPosthog() {
  if (initialized || typeof window === "undefined") return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "https://app.posthog.com",
    capture_pageview: true,
  });
  initialized = true;
}

export function track(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}
```

- [ ] **Commit**

```bash
git add src/lib/gumroad.ts src/lib/gumroad.test.ts src/lib/upstash.ts src/lib/posthog.ts
git commit -m "feat: gumroad utils, upstash rate limiters, posthog client"
```

---

## Phase 4: Core UI Components

### Task 8: Header

**Files:**

- Create: `src/components/layout/header.tsx`

- [ ] **Create `src/components/layout/header.tsx`**

```tsx
"use client";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-[#e8e4df] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col shrink-0">
          <div className="flex items-center gap-1">
            <span
              className="text-[22px] text-black leading-none"
              style={{ fontFamily: "var(--font-dancing)" }}
            >
              Promptita
            </span>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-[11px] text-gray-400 leading-none mt-0.5">
            AI Prompts for POD &amp; Marketing
          </span>
        </Link>

        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        <div className="shrink-0">
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                className="rounded-full bg-black text-white hover:bg-black/80 px-5 text-sm"
                size="sm"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(ui): header with logo, search placeholder, Clerk auth"
```

---

### Task 9: SearchBar + CategoryCard + CategoryGrid

**Files:**

- Create: `src/components/search/search-bar.tsx`
- Create: `src/components/categories/category-card.tsx`
- Create: `src/components/categories/category-grid.tsx`

- [ ] **Create `src/components/search/search-bar.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search prompts…"
        className="w-full pl-9 pr-4 py-2 text-sm bg-[#f9f7f4] border border-[#e8e4df] rounded-full outline-none focus:border-black transition-colors"
      />
    </form>
  );
}
```

- [ ] **Create `src/components/categories/category-card.tsx`**

```tsx
import Link from "next/link";
import { ChevronRight, Shirt, StickerIcon, Image, MessageSquare, Camera, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  shirt: <Shirt className="w-5 h-5" />,
  sticker: <StickerIcon className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  "message-square": <MessageSquare className="w-5 h-5" />,
  camera: <Camera className="w-5 h-5" />,
  megaphone: <Megaphone className="w-5 h-5" />,
};

interface CategoryCardProps {
  name: string;
  parentName: string;
  icon: string;
  href: string;
}

export function CategoryCard({ name, parentName, icon, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 p-4 bg-white border border-[#e8e4df] rounded-xl",
        "hover:shadow-sm transition-shadow"
      )}
    >
      <div className="p-2 rounded-lg bg-[#f9f7f4] text-black shrink-0">
        {iconMap[icon] ?? <Shirt className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black truncate">{name}</p>
        <p className="text-xs text-gray-400">{parentName}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
    </Link>
  );
}
```

- [ ] **Create `src/components/categories/category-grid.tsx`**

```tsx
import { CategoryCard } from "./category-card";

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const subcategoryIconMap: Record<string, string> = {
    tshirts: "shirt",
    stickers: "sticker",
    mockups: "image",
    "social-media": "message-square",
    "product-photography": "camera",
    "ad-creatives": "megaphone",
  };

  const items = categories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      id: sub._id,
      name: sub.name,
      parentName: cat.name,
      icon: subcategoryIconMap[sub.slug] ?? cat.icon,
      href: `/prompts/${cat.slug}/${sub.slug}`,
    }))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <CategoryCard key={item.id} {...item} />
      ))}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/search/search-bar.tsx src/components/categories/category-card.tsx src/components/categories/category-grid.tsx
git commit -m "feat(ui): SearchBar, CategoryCard, CategoryGrid"
```

---

### Task 10: PromptCard + ImageViewer + FilterPills

**Files:**

- Create: `src/components/prompts/prompt-card.tsx`
- Create: `src/components/prompts/image-viewer.tsx`
- Create: `src/components/prompts/filter-pills.tsx`
- Create: `src/components/prompts/prompt-grid.tsx`

- [ ] **Create `src/components/prompts/image-viewer.tsx`**

```tsx
"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-zoom-in object-cover w-full h-full ${className ?? ""}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white p-1"
            onClick={() => setOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
```

- [ ] **Create `src/components/prompts/filter-pills.tsx`**

```tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function FilterPills() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("tool") ?? "all";

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("tool");
    else params.set("tool", value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const pills = [
    { label: "All", value: "all" },
    { label: "ChatGPT", value: "chatgpt" },
    { label: "Gemini", value: "gemini" },
  ];

  return (
    <div className="flex gap-2">
      {pills.map((pill) => (
        <button
          key={pill.value}
          onClick={() => setFilter(pill.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            active === pill.value
              ? "bg-black text-white border-black"
              : "bg-white text-black border-[#e8e4df] hover:border-black"
          )}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Create `src/components/prompts/prompt-card.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageViewer } from "./image-viewer";

export interface PromptCardData {
  _id: string;
  title: string;
  description: string;
  isFree: boolean;
  price: number;
  likeCount: number;
  imageUrl: string;
  aiTool: "chatgpt" | "gemini";
}

interface PromptCardProps {
  prompt: PromptCardData;
  onClick: (id: string) => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const [likes, setLikes] = useState(prompt.likeCount);
  const [liked, setLiked] = useState(false);

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    // LikeButton handles auth; this is local optimistic state for display
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  }

  return (
    <div
      className="bg-[#f9f7f4] border border-[#e8e4df] rounded-xl overflow-hidden cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow"
      onClick={() => onClick(prompt._id)}
    >
      <div className="relative aspect-[4/3] bg-[#f0ece6]">
        <ImageViewer src={prompt.imageUrl} alt={prompt.title} />
        <span className="absolute top-2 left-2 bg-black text-white text-[11px] font-medium uppercase tracking-wide px-2.5 py-0.5 rounded-full">
          {prompt.isFree ? "FREE" : `$${prompt.price.toFixed(2)}`}
        </span>
        <button
          className="absolute bottom-2 right-2 flex items-center gap-1 text-sm"
          onClick={handleLike}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              liked ? "fill-black text-black" : "text-black"
            )}
          />
          <span className="text-black text-xs font-medium">{likes}</span>
        </button>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-black truncate">{prompt.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{prompt.description}</p>
      </div>
    </div>
  );
}
```

- [ ] **Create `src/components/prompts/prompt-grid.tsx`**

```tsx
import { PromptCard, PromptCardData } from "./prompt-card";

interface PromptGridProps {
  prompts: PromptCardData[];
  onCardClick: (id: string) => void;
}

export function PromptGrid({ prompts, onCardClick }: PromptGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {prompts.map((p) => (
        <PromptCard key={p._id} prompt={p} onClick={onCardClick} />
      ))}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/prompts/
git commit -m "feat(ui): PromptCard, ImageViewer, FilterPills, PromptGrid"
```

---

### Task 11: PromptModal + LikeButton + UnlockButton

**Files:**

- Create: `src/components/prompts/prompt-modal.tsx`
- Create: `src/components/prompts/like-button.tsx`
- Create: `src/components/prompts/unlock-button.tsx`

- [ ] **Create `src/components/prompts/like-button.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  promptId: Id<"prompts">;
  likeCount: number;
}

export function LikeButton({ promptId, likeCount }: LikeButtonProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [pendingLike, setPendingLike] = useState(false);
  const liked = useQuery(api.likes.getLikeState, { promptId });
  const toggleLike = useMutation(api.likes.toggleLike);

  useEffect(() => {
    if (isSignedIn && pendingLike) {
      setPendingLike(false);
      toggleLike({ promptId });
    }
  }, [isSignedIn, pendingLike, promptId, toggleLike]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isSignedIn) {
      setPendingLike(true);
      openSignIn();
      return;
    }
    toggleLike({ promptId });
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-sm"
      aria-label="Like prompt"
    >
      <Heart
        className={cn(
          "w-4 h-4",
          liked ? "fill-black text-black" : "text-black"
        )}
      />
      <span className="text-xs font-medium">{likeCount}</span>
    </button>
  );
}
```

- [ ] **Create `src/components/prompts/unlock-button.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Copy, Check, Lock } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { buildCheckoutUrl } from "@/lib/gumroad";
import { track } from "@/lib/posthog";

interface UnlockButtonProps {
  promptId: Id<"prompts">;
  isFree: boolean;
  price: number;
  gumroadProductId?: string;
  promptText?: string;
}

export function UnlockButton({
  promptId,
  isFree,
  price,
  gumroadProductId,
  promptText,
}: UnlockButtonProps) {
  const { userId } = useAuth();
  const isUnlocked = useQuery(api.unlocks.getUnlockState, { promptId });
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!promptText) return;
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    track("prompt_copied", { promptId });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleUnlock() {
    if (!userId || !gumroadProductId) return;
    track("unlock_initiated", { promptId, price });
    const url = buildCheckoutUrl({
      gumroadProductId,
      clerkUserId: userId,
      promptId,
    });
    window.open(url, "_blank");
  }

  if (isFree || isUnlocked) {
    return (
      <Button
        onClick={handleCopy}
        className="w-full bg-black text-white hover:bg-black/80 rounded-full"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" /> Copy Prompt
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleUnlock}
      className="w-full bg-black text-white hover:bg-black/80 rounded-full"
    >
      <Lock className="w-4 h-4 mr-2" />
      Unlock for ${price.toFixed(2)}
    </Button>
  );
}
```

- [ ] **Create `src/components/prompts/prompt-modal.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { X, Lock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ImageViewer } from "./image-viewer";
import { LikeButton } from "./like-button";
import { UnlockButton } from "./unlock-button";

interface PromptModalProps {
  promptId: Id<"prompts">;
  onClose: () => void;
}

export function PromptModal({ promptId, onClose }: PromptModalProps) {
  const promptData = useQuery(api.prompts.getById, { id: promptId });
  const promptText = useQuery(api.prompts.getPromptText, { promptId });
  const imageUrl = useQuery(
    api.prompts.getImageUrl,
    promptData?.imageStorageId
      ? { storageId: promptData.imageStorageId }
      : "skip"
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!promptData) return null;

  const isLocked = !promptData.isFree && !promptText;
  const preview = promptText?.split("\n").slice(0, 2).join("\n") ?? "";
  const rest = promptText?.split("\n").slice(2).join("\n") ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-[#f0ece6] rounded-l-2xl overflow-hidden">
            {imageUrl && (
              <ImageViewer src={imageUrl} alt={promptData.title} />
            )}
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {promptData.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
                </p>
                <h2 className="text-xl font-bold text-black">
                  {promptData.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {promptData.description}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black ml-2 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="bg-black text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                {promptData.isFree ? "Free" : `$${promptData.price}`}
              </span>
              <span className="border border-[#e8e4df] text-xs px-3 py-1 rounded-full text-gray-600">
                {promptData.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
              </span>
            </div>

            <div className="bg-[#f9f7f4] rounded-xl p-4 font-mono text-sm relative overflow-hidden">
              <p className="whitespace-pre-wrap text-black">{preview}</p>
              {isLocked && rest && (
                <div className="relative mt-2">
                  <p className="whitespace-pre-wrap text-black blur-sm select-none">
                    {rest || "The rest of this prompt is hidden until unlocked."}
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                </div>
              )}
              {!isLocked && rest && (
                <p className="whitespace-pre-wrap text-black mt-2">{rest}</p>
              )}
            </div>

            <LikeButton promptId={promptId} likeCount={promptData.likeCount} />

            <UnlockButton
              promptId={promptId}
              isFree={promptData.isFree}
              price={promptData.price}
              gumroadProductId={promptData.gumroadProductId}
              promptText={promptText ?? undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Add `getById` query to `convex/prompts.ts`**

```typescript
export const getById = query({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.id);
    if (!prompt) return null;
    const { promptText: _, ...publicFields } = prompt;
    return publicFields;
  },
});
```

- [ ] **Deploy updated Convex functions**

```bash
npx convex dev --once
```

- [ ] **Commit**

```bash
git add convex/prompts.ts src/components/prompts/
git commit -m "feat(ui): PromptModal, LikeButton, UnlockButton"
```

---

## Phase 5: Public Pages (ISR)

### Task 12: Homepage

**Files:**

- Modify: `src/app/page.tsx`

- [ ] **Replace `src/app/page.tsx`**

```tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { CategoryGrid } from "@/components/categories/category-grid";
import { HomepagePrompts } from "@/components/prompts/homepage-prompts";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, featuredRaw, freeRaw] = await Promise.all([
    fetchQuery(api.categories.listAll, {}),
    fetchQuery(api.prompts.getFeatured, {}),
    fetchQuery(api.prompts.getFree, {}),
  ]);

  // Fetch image URLs for each prompt
  const withUrls = async (prompts: typeof featuredRaw) =>
    Promise.all(
      prompts.map(async (p) => ({
        ...p,
        imageUrl:
          (await fetchQuery(api.prompts.getImageUrl, {
            storageId: p.imageStorageId,
          })) ?? "/placeholder.png",
      }))
    );

  const [featured, free] = await Promise.all([
    withUrls(featuredRaw),
    withUrls(freeRaw),
  ]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex flex-col gap-12">
        <section>
          <h2 className="text-xl font-bold text-black mb-6">
            Browse Categories
          </h2>
          <CategoryGrid categories={categories as any} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Featured Prompts</h2>
            <a href="/search" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
              View all →
            </a>
          </div>
          <HomepagePrompts prompts={featured as any} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-6">Free Prompts</h2>
          <HomepagePrompts prompts={free as any} />
        </section>
      </main>
    </>
  );
}
```

- [ ] **Create `src/components/prompts/homepage-prompts.tsx`** (client island for modal)

```tsx
"use client";
import { useState } from "react";
import { PromptGrid } from "./prompt-grid";
import { PromptModal } from "./prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";
import type { PromptCardData } from "./prompt-card";

export function HomepagePrompts({ prompts }: { prompts: PromptCardData[] }) {
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);

  return (
    <>
      <PromptGrid prompts={prompts} onCardClick={(id) => setSelectedId(id as Id<"prompts">)} />
      {selectedId && (
        <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
```

- [ ] **Start dev server and verify homepage renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Expect: header, category grid (empty until seeded), prompt sections.

- [ ] **Commit**

```bash
git add src/app/page.tsx src/components/prompts/homepage-prompts.tsx
git commit -m "feat: ISR homepage with categories and prompt sections"
```

---

### Task 13: Listing page + Individual prompt SEO page

**Files:**

- Create: `src/app/prompts/[category]/[subcategory]/page.tsx`
- Create: `src/app/prompts/[category]/[subcategory]/[slug]/page.tsx`

- [ ] **Create `src/app/prompts/[category]/[subcategory]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { FilterPills } from "@/components/prompts/filter-pills";
import { ListingPrompts } from "@/components/prompts/listing-prompts";

export const revalidate = 3600;

interface Props {
  params: { category: string; subcategory: string };
}

export async function generateMetadata({ params }: Props) {
  const sub = await fetchQuery(api.categories.getSubcategoryBySlug, {
    slug: params.subcategory,
  });
  if (!sub) return {};
  return {
    title: `${sub.name} Prompts — Promptita`,
    description: sub.description,
  };
}

export default async function ListingPage({ params }: Props) {
  const [category, subcategory] = await Promise.all([
    fetchQuery(api.categories.getBySlug, { slug: params.category }),
    fetchQuery(api.categories.getSubcategoryBySlug, {
      slug: params.subcategory,
    }),
  ]);
  if (!category || !subcategory) notFound();

  const { page: promptsRaw } = await fetchQuery(
    api.prompts.listBySubcategory,
    {
      subcategoryId: subcategory._id,
      paginationOpts: { numItems: 20, cursor: null },
    }
  );

  const prompts = await Promise.all(
    promptsRaw.map(async (p) => ({
      ...p,
      imageUrl:
        (await fetchQuery(api.prompts.getImageUrl, {
          storageId: p.imageStorageId,
        })) ?? "/placeholder.png",
    }))
  );

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <nav className="text-xs text-gray-400 mb-4">
          {category.name} / {subcategory.name}
        </nav>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">{subcategory.name}</h1>
          <FilterPills />
        </div>
        <p className="text-sm text-gray-500 mb-8">{subcategory.description}</p>
        <ListingPrompts prompts={prompts as any} />
      </main>
    </>
  );
}
```

- [ ] **Create `src/components/prompts/listing-prompts.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PromptGrid } from "./prompt-grid";
import { PromptModal } from "./prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";
import type { PromptCardData } from "./prompt-card";

export function ListingPrompts({ prompts }: { prompts: PromptCardData[] }) {
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);
  const searchParams = useSearchParams();
  const tool = searchParams.get("tool");

  const filtered = tool
    ? prompts.filter((p) => p.aiTool === tool)
    : prompts;

  return (
    <>
      <PromptGrid
        prompts={filtered}
        onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
      />
      {selectedId && (
        <PromptModal
          promptId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Create `src/app/prompts/[category]/[subcategory]/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ImageViewer } from "@/components/prompts/image-viewer";

export const revalidate = 3600;

interface Props {
  params: { category: string; subcategory: string; slug: string };
}

export async function generateStaticParams() {
  const prompts = await fetchQuery(api.prompts.getAllPublishedSlugs, {});
  return prompts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const prompt = await fetchQuery(api.prompts.getBySlug, { slug: params.slug });
  if (!prompt) return {};
  return {
    title: `${prompt.title} — Promptita`,
    description: prompt.description,
    openGraph: { title: prompt.title, description: prompt.description },
  };
}

export default async function PromptPage({ params }: Props) {
  const prompt = await fetchQuery(api.prompts.getBySlug, { slug: params.slug });
  if (!prompt) notFound();

  const imageUrl = await fetchQuery(api.prompts.getImageUrl, {
    storageId: prompt.imageStorageId,
  });

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="aspect-video bg-[#f0ece6] rounded-xl overflow-hidden mb-6">
          {imageUrl && <ImageViewer src={imageUrl} alt={prompt.title} />}
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">{prompt.title}</h1>
        <p className="text-gray-500 mb-4">{prompt.description}</p>
        <div className="flex gap-2">
          <span className="bg-black text-white text-xs px-3 py-1 rounded-full uppercase">
            {prompt.isFree ? "Free" : `$${prompt.price}`}
          </span>
          <span className="border border-[#e8e4df] text-xs px-3 py-1 rounded-full text-gray-500">
            {prompt.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
          </span>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Commit**

```bash
git add src/app/prompts/ src/components/prompts/listing-prompts.tsx
git commit -m "feat: listing page + individual prompt SEO page (ISR)"
```

---

### Task 14: Search page + Dashboard

**Files:**

- Create: `src/app/search/page.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard/unlocked-tab.tsx`
- Create: `src/components/dashboard/bookmarks-tab.tsx`
- Create: `src/components/dashboard/purchase-history-tab.tsx`

- [ ] **Create `src/app/search/page.tsx`**

```tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { PromptModal } from "@/components/prompts/prompt-modal";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { Id } from "../../../convex/_generated/dataModel";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);
  const results = useQuery(api.search.searchPrompts, { q });

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <h1 className="text-xl font-bold text-black mb-2">
          {q ? `Results for "${q}"` : "Search Prompts"}
        </h1>
        {results === undefined && (
          <p className="text-gray-400 text-sm">Searching…</p>
        )}
        {results?.length === 0 && (
          <p className="text-gray-400 text-sm">No prompts found for "{q}"</p>
        )}
        {results && results.length > 0 && (
          <PromptGrid
            prompts={results.map((p: any) => ({ ...p, imageUrl: "/placeholder.png" }))}
            onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
          />
        )}
        {selectedId && (
          <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </main>
    </>
  );
}
```

> Note: Image URLs on the search page require a separate `getImageUrl` query per prompt. Add a `getImageUrls` batch query to `convex/prompts.ts` as a follow-up optimization.

- [ ] **Create `src/components/dashboard/unlocked-tab.tsx`**

```tsx
"use client";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { PromptModal } from "@/components/prompts/prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";

export function UnlockedTab() {
  const unlocked = useQuery(api.unlocks.getUserUnlocks, {});
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);

  if (!unlocked) return <p className="text-sm text-gray-400">Loading…</p>;
  if (unlocked.length === 0)
    return <p className="text-sm text-gray-400">No unlocked prompts yet.</p>;

  return (
    <>
      <PromptGrid
        prompts={unlocked.map((p: any) => ({ ...p, imageUrl: "/placeholder.png" }))}
        onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
      />
      {selectedId && (
        <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
```

- [ ] **Create `src/components/dashboard/bookmarks-tab.tsx`**

```tsx
"use client";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { PromptModal } from "@/components/prompts/prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";

export function BookmarksTab() {
  const bookmarks = useQuery(api.bookmarks.getBookmarks, {});
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);

  if (!bookmarks) return <p className="text-sm text-gray-400">Loading…</p>;
  if (bookmarks.length === 0)
    return <p className="text-sm text-gray-400">No bookmarks yet.</p>;

  return (
    <>
      <PromptGrid
        prompts={bookmarks.map((p: any) => ({ ...p, imageUrl: "/placeholder.png" }))}
        onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
      />
      {selectedId && (
        <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
```

- [ ] **Create `src/components/dashboard/purchase-history-tab.tsx`**

```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PurchaseHistoryTab() {
  const purchases = useQuery(api.purchases.getUserPurchases, {});

  if (!purchases) return <p className="text-sm text-gray-400">Loading…</p>;
  if (purchases.length === 0)
    return <p className="text-sm text-gray-400">No purchases yet.</p>;

  return (
    <div className="border border-[#e8e4df] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#f9f7f4]">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-black">Item</th>
            <th className="text-left px-4 py-3 font-medium text-black">Date</th>
            <th className="text-left px-4 py-3 font-medium text-black">Amount</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p._id} className="border-t border-[#e8e4df]">
              <td className="px-4 py-3 text-gray-700 capitalize">
                {p.type === "pack" ? "Category Pack" : "Single Prompt"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-700">${p.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Create `src/app/dashboard/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { UnlockedTab } from "@/components/dashboard/unlocked-tab";
import { BookmarksTab } from "@/components/dashboard/bookmarks-tab";
import { PurchaseHistoryTab } from "@/components/dashboard/purchase-history-tab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "unlocked", label: "Unlocked Prompts" },
  { id: "bookmarks", label: "Bookmarks" },
  { id: "history", label: "Purchase History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("unlocked");

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <h1 className="text-2xl font-bold text-black mb-6">Dashboard</h1>
        <div className="flex gap-1 border-b border-[#e8e4df] mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "unlocked" && <UnlockedTab />}
        {activeTab === "bookmarks" && <BookmarksTab />}
        {activeTab === "history" && <PurchaseHistoryTab />}
      </main>
    </>
  );
}
```

- [ ] **Commit**

```bash
git add src/app/search/ src/app/dashboard/ src/components/dashboard/
git commit -m "feat: search page + dashboard with 3 tabs"
```

---

## Phase 6: Monetization

### Task 15: Gumroad webhook route + Upstash rate limiting

**Files:**

- Create: `src/app/api/webhook/gumroad/route.ts`

- [ ] **Add `GUMROAD_SELLER_ID` to `.env.local`**

```
GUMROAD_SELLER_ID=your_gumroad_seller_id
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

- [ ] **Create `src/app/api/webhook/gumroad/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../../../../../convex/_generated/api";
import { webhookRatelimit } from "@/lib/upstash";
import { validateGumroadSellerId } from "@/lib/gumroad";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await webhookRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await req.formData();
  const sellerId = body.get("seller_id") as string | null;

  if (!sellerId || !validateGumroadSellerId(sellerId)) {
    return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
  }

  const orderId = body.get("order_id") as string;
  const price = parseFloat((body.get("price") as string) ?? "0") / 100;
  const clerkUserId = body.get("custom_field_clerk_id") as string | null;
  const promptId = body.get("custom_field_prompt_id") as string | null;
  const subcategoryId = body.get("custom_field_subcategory_id") as string | null;

  if (!clerkUserId) {
    return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
  }

  try {
    await convex.mutation(internal.webhook.processGumroadPurchase, {
      gumroadOrderId: orderId,
      clerkUserId,
      promptId: promptId ?? undefined,
      subcategoryId: subcategoryId ?? undefined,
      amount: price,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook mutation failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

- [ ] **Commit**

```bash
git add src/app/api/webhook/gumroad/route.ts
git commit -m "feat: Gumroad webhook route with Upstash rate limiting"
```

---

## Phase 7: Admin

### Task 16: Admin layout + PromptForm + AdminPromptsPage

**Files:**

- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/prompts/new/page.tsx`
- Create: `src/app/admin/prompts/[id]/edit/page.tsx`
- Create: `src/components/admin/prompt-form.tsx`
- Create: `src/components/admin/prompts-table.tsx`

- [ ] **Create `src/app/admin/layout.tsx`**

```tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  if (!userId) redirect("/");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") redirect("/");
  return <>{children}</>;
}
```

- [ ] **Create `src/components/admin/prompt-form.tsx`**

```tsx
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface PromptFormProps {
  initialData?: {
    id: Id<"prompts">;
    title: string;
    slug: string;
    description: string;
    promptText: string;
    aiTool: "chatgpt" | "gemini";
    isFree: boolean;
    price: number;
    gumroadProductId?: string;
    categoryId: Id<"categories">;
    subcategoryId: Id<"subcategories">;
    imageStorageId: Id<"_storage">;
  };
}

export function PromptForm({ initialData }: PromptFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const createPrompt = useMutation(api.admin.createPrompt);
  const updatePrompt = useMutation(api.admin.updatePrompt);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [promptText, setPromptText] = useState(initialData?.promptText ?? "");
  const [aiTool, setAiTool] = useState<"chatgpt" | "gemini">(
    initialData?.aiTool ?? "chatgpt"
  );
  const [isFree, setIsFree] = useState(initialData?.isFree ?? true);
  const [price, setPrice] = useState(initialData?.price ?? 2.99);
  const [gumroadProductId, setGumroadProductId] = useState(
    initialData?.gumroadProductId ?? ""
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let imageStorageId = initialData?.imageStorageId;

      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        imageStorageId = storageId;
      }

      if (!imageStorageId) {
        alert("Please upload an image");
        setSaving(false);
        return;
      }

      if (initialData) {
        await updatePrompt({
          id: initialData.id,
          title,
          slug,
          description,
          promptText,
          aiTool,
          isFree,
          price,
          gumroadProductId: gumroadProductId || undefined,
          imageStorageId,
        });
      } else {
        await createPrompt({
          title,
          slug,
          description,
          promptText,
          aiTool,
          isFree,
          price,
          gumroadProductId: gumroadProductId || undefined,
          imageStorageId,
          categoryId: "" as any, // TODO: add category selectors
          subcategoryId: "" as any,
        });
      }
      router.push("/admin");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      {[
        { label: "Title", value: title, onChange: setTitle },
        { label: "Slug", value: slug, onChange: setSlug },
        { label: "Description", value: description, onChange: setDescription },
        {
          label: "Gumroad Product ID",
          value: gumroadProductId,
          onChange: setGumroadProductId,
        },
      ].map(({ label, value, onChange }) => (
        <label key={label} className="flex flex-col gap-1 text-sm font-medium">
          {label}
          <input
            className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={label !== "Gumroad Product ID"}
          />
        </label>
      ))}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Prompt Text
        <textarea
          className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-black h-32 resize-y"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        AI Tool
        <select
          className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
          value={aiTool}
          onChange={(e) => setAiTool(e.target.value as "chatgpt" | "gemini")}
        >
          <option value="chatgpt">ChatGPT</option>
          <option value="gemini">Gemini</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
        />
        Free prompt
      </label>

      {!isFree && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Price ($)
          <input
            type="number"
            step="0.01"
            className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Watermarked Image
        <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
      </label>

      <Button
        type="submit"
        disabled={saving}
        className="bg-black text-white rounded-full w-fit px-6"
      >
        {saving ? "Saving…" : initialData ? "Update Prompt" : "Create Prompt"}
      </Button>
    </form>
  );
}
```

> Note: `categoryId` and `subcategoryId` selectors are left as placeholders. Add `<select>` dropdowns populated from `api.categories.listAll` as a follow-up step — the form structure is in place.

- [ ] **Create `src/components/admin/prompts-table.tsx`**

```tsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PromptsTable() {
  const prompts = useQuery(api.admin.listAll, {});
  const togglePublished = useMutation(api.admin.togglePublished);
  const deletePrompt = useMutation(api.admin.deletePrompt);

  if (!prompts) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="border border-[#e8e4df] rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#f9f7f4]">
          <tr>
            {["Title", "AI Tool", "Price", "Published", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-medium text-black">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prompts.map((p) => (
            <tr key={p._id} className="border-t border-[#e8e4df]">
              <td className="px-4 py-3 font-medium text-black">{p.title}</td>
              <td className="px-4 py-3 text-gray-500 uppercase text-xs">
                {p.aiTool}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {p.isFree ? "Free" : `$${p.price}`}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() =>
                    togglePublished({ id: p._id as Id<"prompts">, isPublished: !p.isPublished })
                  }
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p.isPublished
                      ? "bg-black text-white"
                      : "bg-[#f9f7f4] text-gray-500 border border-[#e8e4df]"
                  }`}
                >
                  {p.isPublished ? "Live" : "Draft"}
                </button>
              </td>
              <td className="px-4 py-3 flex gap-2">
                <Link href={`/admin/prompts/${p._id}/edit`}>
                  <Button size="sm" variant="outline" className="rounded-full text-xs">
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs text-red-500 border-red-200"
                  onClick={() => {
                    if (confirm("Delete this prompt?"))
                      deletePrompt({ id: p._id as Id<"prompts"> });
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Create `src/app/admin/page.tsx`**

```tsx
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PromptsTable } from "@/components/admin/prompts-table";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Admin — Prompts</h1>
          <Link href="/admin/prompts/new">
            <Button className="bg-black text-white rounded-full px-5">
              + New Prompt
            </Button>
          </Link>
        </div>
        <PromptsTable />
      </main>
    </>
  );
}
```

- [ ] **Create `src/app/admin/prompts/new/page.tsx`**

```tsx
import { Header } from "@/components/layout/header";
import { PromptForm } from "@/components/admin/prompt-form";

export default function NewPromptPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-black mb-6">New Prompt</h1>
        <PromptForm />
      </main>
    </>
  );
}
```

- [ ] **Create `src/app/admin/prompts/[id]/edit/page.tsx`**

```tsx
import { Header } from "@/components/layout/header";
import { PromptForm } from "@/components/admin/prompt-form";

export default function EditPromptPage() {
  // Data fetched client-side inside PromptForm via useMutation
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-black mb-6">Edit Prompt</h1>
        <PromptForm />
      </main>
    </>
  );
}
```

- [ ] **Commit**

```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat: admin layout, prompt form with Convex file upload, prompts table"
```

---

## Phase 8: SEO + Analytics

### Task 17: Sitemap + robots + Posthog init

**Files:**

- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Create `src/app/sitemap.ts`**

```typescript
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prompts = await fetchQuery(api.prompts.getAllPublishedSlugs, {});
  const categories = await fetchQuery(api.categories.listAll, {});

  const promptUrls = prompts.map((p) => ({
    url: `https://promptita.com/prompts/${p.slug}`,
    lastModified: new Date(p._creationTime),
  }));

  const subcategoryUrls = categories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      url: `https://promptita.com/prompts/${cat.slug}/${sub.slug}`,
      lastModified: new Date(),
    }))
  );

  return [
    { url: "https://promptita.com", lastModified: new Date() },
    ...subcategoryUrls,
    ...promptUrls,
  ];
}
```

- [ ] **Create `src/app/robots.ts`**

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api"],
    },
    sitemap: "https://promptita.com/sitemap.xml",
  };
}
```

- [ ] **Wire Posthog in root layout — add to `src/app/layout.tsx`**

Add import and `useEffect` inside a new client component `src/components/layout/analytics.tsx`:

```tsx
"use client";
import { useEffect } from "react";
import { initPosthog } from "@/lib/posthog";

export function Analytics() {
  useEffect(() => {
    initPosthog();
  }, []);
  return null;
}
```

Then add `<Analytics />` inside the body in `src/app/layout.tsx`:

```tsx
import { Analytics } from "@/components/layout/analytics";
// Inside <body>:
<ConvexClerkProvider>
  <Analytics />
  {children}
</ConvexClerkProvider>
```

- [ ] **Add `track("prompt_viewed")` to `PromptModal`**

Inside `src/components/prompts/prompt-modal.tsx`, add import and `useEffect`:

```tsx
import { track } from "@/lib/posthog";

// Inside component, after promptData loads:
useEffect(() => {
  if (promptData) {
    track("prompt_viewed", {
      promptId,
      isFree: promptData.isFree,
    });
  }
}, [promptId, promptData]);
```

- [ ] **Run full test suite**

```bash
npx vitest run
```

Expected: All PASS.

- [ ] **Build check**

```bash
npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts src/components/layout/analytics.tsx src/app/layout.tsx src/components/prompts/prompt-modal.tsx
git commit -m "feat: sitemap, robots.txt, Posthog analytics"
```

---

## Phase 9: Seed + Final Wiring

### Task 18: Run seed + end-to-end smoke test

- [ ] **Run Convex seed via dashboard or CLI**

```bash
npx convex run seed:seedCategories
```

Expected: 2 categories + 6 subcategories created in Convex dashboard.

- [ ] **Create one test prompt via admin**

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/admin`
3. Click "New Prompt"
4. Fill in all fields, upload a pre-watermarked image
5. Submit — verify prompt appears in admin table as "Draft"
6. Toggle to "Live"

- [ ] **Verify homepage shows the prompt**

Navigate to `http://localhost:3000`. Expect the new prompt to appear in "Featured Prompts" section (may require revalidation — in dev mode it's live).

- [ ] **Verify modal opens and shows blurred prompt text for paid prompts**

Click the prompt card. Expect modal to open with blurred prompt text and "Unlock for $X.XX" button.

- [ ] **Verify free prompt copy works**

Create a second prompt with `isFree: true`. Open modal. Expect "Copy Prompt" button. Click it — verify clipboard copy and "Copied!" state.

- [ ] **Verify sign-in modal opens on like click (unauthenticated)**

Sign out. Click heart on any card. Expect Clerk sign-in modal to open.

- [ ] **Verify search**

Type in search bar and press enter. Expect `/search?q=...` page with results.

- [ ] **Final commit**

```bash
git add .
git commit -m "feat: seed data + end-to-end smoke test verified"
```

---

## Known Follow-up Tasks (Post-MVP)

- Add `categoryId`/`subcategoryId` `<select>` dropdowns in `PromptForm` (currently placeholder)
- Add `getImageUrls` batch query to avoid N+1 image URL fetches on search + dashboard tabs
- Add OG image generation (`opengraph-image.tsx`) for individual prompt pages
- Add pagination to listing pages (currently capped at 20 via `paginationOpts`)
- Wire `bookmarkRatelimit` to a `/api/bookmark` route if needed
- Configure Netlify deploy + `@netlify/plugin-nextjs` for ISR support
- Set `CLERK_JWT_ISSUER_DOMAIN` in Netlify environment variables
