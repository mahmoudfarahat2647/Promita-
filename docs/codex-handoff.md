# Codex Handoff — Promptita MVP Completion

## Your Role
You are the **orchestrator**. Spawn parallel agents to complete the remaining work as fast as possible. Read `convex/_generated/ai/guidelines.md` before touching any Convex code.

---

## Project Summary
**Promptita** — AI prompt catalog with ISR public pages, Convex backend, Clerk auth, Gumroad payments.

- **Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Clerk, Convex, Gumroad, Upstash Redis, Posthog, Vitest + convex-test
- **Root:** `d:\promptita`
- **Shell:** bash (use Unix paths and syntax)
- **Middleware:** This project uses `proxy.ts` at the project root (NOT `src/middleware.ts`) — Next.js 16 convention

---

## What Has Already Been Completed

All source files are written. Here is what exists:

### Convex backend (all written)
- `convex/schema.ts` — full 7-table schema (categories, subcategories, prompts, unlocks, likes, bookmarks, purchases)
- `convex/auth.config.ts` — Clerk JWT provider configured
- `convex/categories.ts` — listAll, getBySlug, getSubcategoryBySlug
- `convex/seed.ts` — seedCategories mutation (2 categories, 6 subcategories)
- `convex/prompts.ts` — listBySubcategory, getFeatured, getFree, getBySlug, getById, getImageUrl, getPromptText, getAllPublishedSlugs
- `convex/admin.ts` — createPrompt, updatePrompt, deletePrompt, togglePublished, generateUploadUrl, listAll
- `convex/search.ts` — searchPrompts (search index)
- `convex/likes.ts` — toggleLike, getLikeState
- `convex/bookmarks.ts` — toggleBookmark, getBookmarks
- `convex/unlocks.ts` — getUnlockState, getUserUnlocks
- `convex/purchases.ts` — getUserPurchases
- `convex/webhook.ts` — processGumroadPurchase (internalMutation, idempotent)
- `convex/categories.test.ts`, `convex/prompts.test.ts`, `convex/unlocks.test.ts` — Vitest tests

### Frontend (all written)
- `src/app/layout.tsx` — ClerkProvider + ConvexClerkProvider + Analytics + Inter/Dancing_Script fonts
- `src/app/page.tsx` — ISR homepage (categories, featured, free prompts)
- `src/app/globals.css` — design tokens appended
- `src/app/robots.ts`, `src/app/sitemap.ts`
- `src/app/search/page.tsx` — client search page
- `src/app/dashboard/page.tsx` — 3-tab dashboard (unlocked, bookmarks, history)
- `src/app/prompts/[category]/[subcategory]/page.tsx` — listing page (ISR)
- `src/app/prompts/[category]/[subcategory]/[slug]/page.tsx` — prompt SEO page (ISR)
- `src/app/admin/layout.tsx` — admin role guard
- `src/app/admin/page.tsx` — prompts table
- `src/app/admin/prompts/new/page.tsx`
- `src/app/admin/prompts/[id]/edit/page.tsx`
- `src/app/api/webhook/gumroad/route.ts` — Gumroad Ping handler
- `src/components/layout/header.tsx`, `providers.tsx`, `analytics.tsx`
- `src/components/search/search-bar.tsx`
- `src/components/categories/category-card.tsx`, `category-grid.tsx`
- `src/components/prompts/prompt-card.tsx`, `prompt-grid.tsx`, `prompt-modal.tsx`, `like-button.tsx`, `unlock-button.tsx`, `image-viewer.tsx`, `filter-pills.tsx`, `homepage-prompts.tsx`, `listing-prompts.tsx`
- `src/components/dashboard/unlocked-tab.tsx`, `bookmarks-tab.tsx`, `purchase-history-tab.tsx`
- `src/components/admin/prompt-form.tsx`, `prompts-table.tsx`
- `src/lib/gumroad.ts`, `upstash.ts`, `posthog.ts`, `gumroad.test.ts`
- `proxy.ts` — Clerk middleware with protected routes (/dashboard, /admin)
- `vitest.config.ts` — `environment: "edge-runtime"`

### package.json state
- `"test": "vitest"` script is present
- devDependencies have: `vitest`, `@edge-runtime/vm`, `convex-test`
- **MISSING from dependencies** (in node_modules but not saved to package.json): `@upstash/ratelimit`, `@upstash/redis`, `posthog-js`

---

## Remaining Tasks (What You Must Complete)

### Step 1 — Fix package.json missing runtime deps
Run in project root:
```bash
npm install @upstash/ratelimit @upstash/redis posthog-js
```
This saves them to `package.json` dependencies.

### Step 2 — Delete placeholder Convex file
```bash
rm convex/myFunctions.ts
```
This file is a scaffold placeholder and conflicts with the real schema.

### Step 3 — Push Convex schema + regenerate types
```bash
npx convex dev --once
```
This deploys the schema and all Convex functions and regenerates `convex/_generated/api.d.ts` and `convex/_generated/dataModel.d.ts` which the TypeScript files depend on.

**Requires `.env.local` to have:**
```
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://...clerk.accounts.dev
```
If these are not set, skip this step and note it for the user.

### Step 4 — Run tests
```bash
npx vitest run
```
Expected: all tests in `convex/categories.test.ts`, `convex/prompts.test.ts`, `convex/unlocks.test.ts`, `src/lib/gumroad.test.ts` should PASS.

If tests fail, investigate and fix. Common issues:
- Import errors from `_generated/api` → need `convex dev --once` first
- Type errors in `convex/admin.ts` (double import of `MutationCtx`/`QueryCtx` — check the file)

### Step 5 — TypeScript check
```bash
npx tsc --noEmit
```
Fix any type errors found. Common expected issues:
- `convex/admin.ts`: the `requireAdmin` function takes `MutationCtx | QueryCtx` — verify imports are correct
- `src/app/admin/layout.tsx`: uses `await auth()` — correct for Clerk v7+
- Pages importing `api.prompts.getImageUrl` with `storageId` — verify the query signature matches

### Step 6 — Commit in logical groups
```bash
git add convex/schema.ts convex/auth.config.ts
git commit -m "feat(convex): full data schema + Clerk auth config"

git add convex/categories.ts convex/seed.ts convex/categories.test.ts
git commit -m "feat(convex): category queries + seed mutation"

git add convex/prompts.ts convex/admin.ts convex/prompts.test.ts
git commit -m "feat(convex): prompt queries + admin mutations"

git add convex/search.ts convex/likes.ts convex/bookmarks.ts convex/unlocks.ts convex/purchases.ts convex/webhook.ts convex/unlocks.test.ts
git commit -m "feat(convex): search, likes, bookmarks, unlocks, purchases, webhook"

git add src/app/layout.tsx src/app/globals.css src/components/layout/ src/middleware.ts proxy.ts vitest.config.ts package.json
git commit -m "feat: auth providers, layout, middleware, vitest config"

git add src/lib/
git commit -m "feat: gumroad utils, upstash rate limiters, posthog client"

git add src/components/
git commit -m "feat(ui): all UI components (header, prompts, categories, dashboard, admin)"

git add src/app/
git commit -m "feat: all pages (homepage, listing, search, dashboard, admin, webhook API)"
```

---

## Known Issues to Watch

1. **`convex/admin.ts` double import** — The file imports both `mutation, query` AND `MutationCtx, QueryCtx` from `./_generated/server`. Verify this compiles cleanly. If not, fix the import to: `import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";`

2. **`src/app/admin/layout.tsx`** — Uses `await auth()` (async, Clerk v7). If you get a TypeScript error about `auth()` not being async, change to the sync pattern: `const { userId } = auth(); if (!userId) redirect("/");`

3. **`proxy.ts` vs `src/middleware.ts`** — The project uses `proxy.ts` at root as the Next.js middleware (NOT `src/middleware.ts`). `src/middleware.ts` has already been deleted. Do not recreate it.

4. **`convex/myFunctions.ts`** — This scaffold placeholder must be deleted before `convex dev --once` or it will register a spurious function.

5. **ISR pages call `fetchQuery` with `api.prompts.getImageUrl`** — This takes `{ storageId: Id<"_storage"> }`. The ISR pages pass `p.imageStorageId` which is typed as `Id<"_storage">` — this is correct and will resolve after types are regenerated.

---

## Environment Variables Required (not set by us)

The user needs to set these in `.env.local` before running the dev server:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://...clerk.accounts.dev
GUMROAD_SELLER_ID=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_POSTHOG_KEY=...
ADMIN_CLERK_TOKEN_IDENTIFIER=...
```

---

## Implementation Plan Reference
Full plan: `docs/superpowers/plans/2026-05-04-promptita-mvp.md`
The completed phases are: 1, 2, 3, 4 (files), 5, 6, 7, 8 (files only).
Remaining: Phase 9 (seed + smoke test) — requires env vars to be configured.
