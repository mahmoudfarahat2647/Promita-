# Promptita MVP — Design Spec

**Date:** 2026-05-04
**Status:** Approved

---

## Overview

Promptita is an AI prompt catalog for POD design and marketing. Users browse curated prompts for platforms like ChatGPT and Gemini, view watermarked output images to gauge quality, and unlock the full prompt text via a Gumroad purchase. Free prompts are fully open — no login required. The site generates revenue through single prompt unlocks ($2.99) and subcategory packs ($14.99).

**Two goals:**
1. Showcase how AI prompts can be genuinely useful for product creators
2. Generate revenue for the site owner through prompt unlocks

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui + Lucide Icons |
| Auth | Clerk |
| Database + Storage | Convex |
| Payments | Gumroad (Ping webhook) |
| Rate Limiting | Upstash (Redis) |
| Analytics | Posthog |
| Hosting | Netlify |

---

## Visual Design

- **Theme:** Clean white (`#ffffff`) background, black (`#000000`) text and accents
- **Card backgrounds:** Warm off-white / light cream (`#f9f7f4`)
- **Borders:** Very light gray (`#e8e4df`), 1px, subtle
- **Typography:** Script/cursive font for logo, Inter for body
- **No dark mode**
- **Badges:** Black pill — "FREE" and "$2.99" (white text, small caps)
- **Heart icon:** Outlined default, fills dark on active, like count to the right
- **Buttons:** "Sign In" = black pill, white text
- **Border radius:** Cards 12px, buttons/badges 99px, modal 16px
- **Reference:** HTML prototype provided by user (ChatGPT-generated mockup)

### Layout
No sidebar. Full-width header + content. Navigation is category-based grid, not sidebar links.

---

## Content Structure

### Categories
```
POD
  └── T-Shirts      /prompts/pod/tshirts
  └── Stickers      /prompts/pod/stickers
  └── Mockups       /prompts/pod/mockups

Marketing
  └── Social Media          /prompts/marketing/social-media
  └── Product Photography   /prompts/marketing/product-photography
  └── Ad Creatives          /prompts/marketing/ad-creatives
```

### Launch Content
~20 curated prompts (3–5 per subcategory), all created by the site owner. Community submissions are post-launch.

---

## Data Model (Convex Schema)

### `categories`
```
name: string
slug: string
icon: string  ← lucide icon name
```

### `subcategories`
```
name: string
slug: string
categoryId: Id<"categories">
description: string
gumroadPackId: string  ← Gumroad product ID for $14.99 pack
```

### `prompts`
```
title: string
slug: string
description: string
promptText: string          ← NEVER returned by public queries
categoryId: Id<"categories">
subcategoryId: Id<"subcategories">
aiTool: "chatgpt" | "gemini"
isFree: boolean
price: number               ← 0 for free, 2.99 for paid
gumroadProductId?: string   ← Gumroad product ID for $2.99 single unlock (omitted for free prompts)
imageStorageId: Id<"_storage">
likeCount: number
isPublished: boolean
searchText: string          ← Combined title + description, used for searchIndex only
```

**Search index:** `searchIndex("search_prompts", { searchField: "searchText" })`

### `unlocks`
```
userId: string              ← Clerk user ID
promptId?: Id<"prompts">    ← set for single unlocks
subcategoryId?: Id<"subcategories">  ← set for pack unlocks
type: "single" | "pack"
gumroadOrderId: string      ← for idempotency
unlockedAt: number
```

### `likes`
```
userId: string
promptId: Id<"prompts">
```

### `bookmarks`
```
userId: string
promptId: Id<"prompts">   ← free prompts only; unlocked paid prompts appear in unlocks tab instead
```

### `purchases`
```
userId: string
type: "single" | "pack"
promptId?: Id<"prompts">
subcategoryId?: Id<"subcategories">
amount: number
gumroadOrderId: string
createdAt: number
```

---

## Application Routes

| Route | Rendering | Protection |
|---|---|---|
| `/` | ISR (revalidate: 3600) | Public |
| `/prompts/[category]/[subcategory]` | ISR (revalidate: 3600) | Public |
| `/prompts/[category]/[subcategory]/[slug]` | ISR (revalidate: 3600) | Public |
| `/search` | Client-side | Public |
| `/dashboard` | Client-side | Clerk (signed in) |
| `/admin` | Client-side | Clerk (role: admin) |
| `/admin/prompts/new` | Client-side | Clerk (role: admin) |
| `/admin/prompts/[id]/edit` | Client-side | Clerk (role: admin) |
| `/api/webhook/gumroad` | API Route | Gumroad signature |
| `sitemap.xml` | Dynamic | Public |
| `robots.txt` | Static | Public |

### Rendering Strategy
- **ISR pages** — prompt data fetched server-side via Convex `fetchQuery`. No auth dependency. Built at deploy, revalidated hourly.
- **Client pages** — use Convex `useQuery`/`useMutation` hooks. Auth-dependent data (unlocks, likes, bookmarks) always client-side.
- **Prompt modal** — client-side overlay on listing page. No URL change. Individual `/[slug]` page exists for SEO and sharing.

---

## Component Architecture

### Layout & Shell
```
RootLayout              ← ClerkProvider, ConvexProvider, global styles
├── Header              ← Logo, SearchBar, Sign In / user avatar
└── page content
```

### Shared Components
```
PromptCard              ← Watermarked thumbnail, badge, LikeButton, title, description
                          On listing: click → opens PromptModal
                          On SEO page: standalone display
PromptModal             ← Zoomable image (ImageViewer), partial prompt, unlock/copy CTA
CategoryCard            ← Lucide icon, subcategory name, parent category, chevron
LikeButton              ← Heart toggle; opens Clerk modal if not signed in
SearchBar               ← Debounced 300ms → navigates to /search?q=
FilterPills             ← ChatGPT / Gemini active-state toggle (listing page)
ImageViewer             ← Lightbox-style zoom for watermarked images
```

### Page Components
```
HomePage                ← Browse Categories 3×2 grid + Featured Prompts + Free Prompts
ListingPage             ← Breadcrumb + FilterPills + PromptCard grid
PromptPage              ← SEO full-page version of modal content
SearchPage              ← Convex searchIndex results as PromptCard grid
```

### Dashboard
```
DashboardPage
├── UnlockedPromptsTab  ← PromptCard grid, no lock overlay
├── BookmarksTab        ← PromptCard grid of bookmarked free prompts
└── PurchaseHistoryTab  ← Table: prompt name | date | amount paid
```

### Admin
```
AdminLayout             ← Verifies Clerk publicMetadata.role === "admin"
AdminPromptsPage        ← Full prompts table with edit / delete / publish toggle
PromptForm              ← Create/edit form: all fields + Convex file upload (generateUploadUrl)
```

---

## Key User Flows

### Unlock Flow (paid, $2.99 single)
1. User clicks "Unlock for $2.99" in `PromptModal`
2. Redirect to Gumroad URL: `?custom_field_clerk_id={userId}&custom_field_prompt_id={promptId}&wanted=true`
3. User pays on Gumroad
4. Gumroad fires Ping webhook → `POST /api/webhook/gumroad`
5. Validate Gumroad signature → Upstash rate check
6. Idempotency check: skip if `gumroadOrderId` already exists in `unlocks`
7. Convex mutation creates `unlocks` + `purchases` records
8. User returns to site → `useQuery("getUnlocks")` reflects unlock instantly
9. Modal shows full `promptText` + Copy button

### Pack Unlock ($14.99)
- Same flow but `custom_field_subcategory_id` passed instead of `promptId`
- Webhook creates one `unlocks` record per published prompt in that subcategory **at time of purchase**
- Prompts added to the subcategory after purchase are NOT automatically unlocked — intentional MVP behaviour
- All cards in subcategory that were published at purchase time show as unlocked

### Like Flow (anonymous user)
1. Guest clicks heart
2. `LikeButton` stores `pendingLike: promptId` in component state
3. Clerk `<SignInButton mode="modal">` opens
4. After sign-in, `useEffect` detects `userId` is now set + `pendingLike` is set → fires like mutation
5. `likes` record created, `prompts.likeCount` incremented
6. `pendingLike` cleared

### Search Flow
1. User types in `SearchBar` (debounced 300ms)
2. Enter / submit → navigate to `/search?q={term}`
3. `SearchPage` calls `useQuery("searchPrompts", { q })`
4. Convex `searchIndex` on `searchText` field returns results
5. `FilterPills` narrow results client-side by `aiTool`

### Copy Free Prompt
1. Anyone clicks "Copy Prompt" on a free prompt modal
2. `navigator.clipboard.writeText(promptText)` — no auth check, no server call
3. Button shows "Copied!" for 2 seconds

### Image Zoom
1. User clicks watermarked image in modal
2. `ImageViewer` lightbox opens — full-size watermarked image
3. Prompt text remains locked (watermark prevents direct use)

---

## Image Strategy

- **Manual workflow:** Owner runs AI prompt → gets output image → adds light watermark in Canva/Photoshop → uploads pre-watermarked image via Admin `PromptForm`
- **Storage:** Convex File Storage (`generateUploadUrl` mutation in admin)
- **Delivery:** Served via Convex global edge storage URL
- **Protection model:** Watermark makes image not directly usable for selling. Seeing the image attracts buyers; the clean prompt is what they pay for.
- **Premium cards:** Show watermarked thumbnail — visible and zoomable. Prompt text is what's locked, not the image.
- **Free cards:** Same — watermarked image shown, prompt text fully visible after copy.

---

## Monetization

| Type | Price | Gumroad entity |
|---|---|---|
| Single prompt unlock | $2.99 | One product per prompt |
| Full subcategory pack | $14.99 | One product per subcategory |

- Gumroad handles payment processing + VAT/tax globally
- Custom fields in checkout URL link purchase to Clerk user
- Webhook auto-unlocks prompt(s) in Convex on successful payment

---

## SEO

| Feature | Implementation |
|---|---|
| Rendering | ISR, revalidate: 3600 |
| URLs | `/prompts/[category]/[subcategory]/[slug]` |
| Sitemap | Dynamic `sitemap.xml` from Convex published prompts |
| Robots | Blocks `/dashboard`, `/admin`, `/api` |
| OG Images | Dynamic per-prompt via `next/og` — title + watermarked image + category badge |
| Metadata | Per-page title, description, canonical URL via `generateMetadata` |

---

## Security

### Convex Query Rules
- `promptText` never returned by public queries
- `getPromptText` query checks: `isFree === true` OR `unlocks` table has a record where:
  - `userId` matches AND `promptId` matches (single unlock), OR
  - `userId` matches AND `subcategoryId` matches the prompt's `subcategoryId` (pack unlock)
- Admin mutations check `ctx.auth` userId against `publicMetadata.role === "admin"`
- All user mutations (like, bookmark) require authenticated `ctx.auth`

### Webhook Security
- Validate `X-Gumroad-Signature` header against `GUMROAD_WEBHOOK_SECRET`
- Upstash rate limit: 20 requests/minute per IP
- Idempotent: check `gumroadOrderId` before writing

### Upstash Rate Limits
- `/api/webhook/gumroad` → 20 req/min per IP
- `/api/bookmark` → 30 req/min per user

### Clerk
- Middleware protects `/dashboard` and `/admin`
- Admin role: `publicMetadata.role === "admin"` set manually in Clerk dashboard

---

## Analytics (Posthog)

| Event | Properties |
|---|---|
| `prompt_viewed` | promptId, isFree, category, subcategory |
| `unlock_initiated` | promptId, price |
| `unlock_completed` | promptId, price (via webhook) |
| `prompt_copied` | promptId |
| `search_performed` | query, resultsCount |

---

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CONVEX_URL
CONVEX_DEPLOY_KEY
GUMROAD_WEBHOOK_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_POSTHOG_KEY
```

---

## Out of Scope (Post-Launch)

- Community prompt submissions
- Creator profiles + payouts
- Midjourney / Flux / Sora support
- Auto-watermarking on image upload
- Subscription model
- Reviews & ratings
- Private signed URLs for images
- Zustand (no complex client state in MVP)
- Dark mode
