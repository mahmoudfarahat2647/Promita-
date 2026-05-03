# Feature Landscape — Promita AI

**Domain:** Prompt marketplace — pay-per-unlock, POD niche, SEO-first discovery
**Researched:** 2026-05-03

---

## Competitive Reference Points

| Platform | Model | Relevance to Promita |
|----------|-------|---------------------|
| **PromptBase** | Marketplace, creator payouts, per-prompt sale | Closest direct competitor — defines table stakes for a prompt store |
| **Gumroad** | Pay-once digital download, creator-owned store | Defines unlock UX expectations; Promita reuses Gumroad as payment rail |
| **Etsy (digital downloads)** | Per-product purchase, instant file delivery | Shapes buyer expectation of instant access, clear preview, "what you get" |
| **Notion template stores** | Pay-once, duplicate template | Preview blur + unlock is a widespread pattern for digital text products |
| **Ideogram / Midjourney showcase** | Heart/like, image grid, community gallery | Shapes visual browsing expectations for AI output catalogs |

---

## Table Stakes

Features users expect. Missing any of these causes users to leave or distrust the product.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Browsable prompt catalog** | Users arrive from search or direct; need immediate signal of what's available | Low | Grid/card layout; universal to PromptBase, Gumroad storefronts |
| **Category / subcategory navigation** | Without filtering a 20-prompt catalog feels like a dump; users go straight to their niche | Low | Sidebar or top filters; `/prompts/pod/tshirts` structure already defined in MVP spec |
| **Prompt card with preview image** | Buyers need a visual quality signal before paying; text-only looks amateurish | Low | Watermarked output image; Gumroad and Etsy thumbnails set this expectation |
| **Partial prompt preview + blur/lock** | Standard paywall UX — shows enough to justify purchase, hides the sellable value | Low-Med | First 1-2 lines visible; CSS blur on remainder; Notion templates and PromptBase both use this pattern |
| **Clear price display** | Hidden pricing causes bounce; users need cost visible before clicking unlock | Low | $2.99 / $14.99 — on card and in modal |
| **Single-click payment path** | Friction = abandonment; minimum steps between "I want this" and "I have it" | Med | Gumroad overlay or redirect; Gumroad Ping webhook closes the loop |
| **Instant post-payment access** | Etsy digital downloads and Gumroad set the expectation: zero wait after payment | Med | Webhook → Convex unlock → reactive query; no reload |
| **Copy-to-clipboard** | Prompts are used by pasting into AI tools; every prompt product has this | Low | Unlocked modal only; `navigator.clipboard.writeText()` |
| **Dashboard — purchased items** | "Where did I put that prompt I bought?" is a universal concern | Med | `/dashboard/unlocks`; all unlocked prompts with copy access |
| **Sign-in to access dashboard** | Auth expected before any purchase history; prevents multi-account pack abuse | Med | Clerk; optional for browsing, required for dashboard and unlock recording |
| **Mobile-responsive layout** | Most discovery is Google search → prompt page on mobile; non-responsive = immediate bounce | Low-Med | Tailwind responsive classes; CSS effort not architecture effort |
| **Unique crawlable URLs per prompt** | Required for SEO and shareability | Low | `/prompts/[category]/[subcategory]/[slug]` |
| **Per-page metadata (title, description, canonical)** | Google requires unique descriptive metadata to rank | Low | Next.js `generateMetadata()` per prompt page |
| **robots.txt** | Without it Google may index `/dashboard` and `/api` | Low | Single file; blocks non-public routes |
| **XML sitemap** | Accelerates indexing of the full catalog | Low-Med | Dynamic from Convex catalog at `/sitemap.xml` |
| **Free prompt tier (some prompts)** | Drives discovery and trust; pure paywall without a taste = low conversion | Low | Free/Paid badge on card; field in MVP spec |
| **AI tool badge** | Buyers need to know which tool the prompt targets; ChatGPT vs Gemini vs Ideogram are not interchangeable | Low | Badge on card and in modal |
| **Basic webhook security** | Without rate limiting and signature verification, anyone can trigger fake unlocks | Med | Upstash rate limiting + Gumroad signature validation on `/api/webhook/gumroad` |

---

## Differentiators

Features that give Promita AI competitive advantage in the POD niche.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **POD-specific taxonomy** | PromptBase is tool-agnostic and not organized around product types. A catalog organized by t-shirts / mugs / wall art / stickers maps directly to how POD sellers think. | Low | Already designed in MVP spec; execution quality matters |
| **Usage tip per prompt** | "Paste into Ideogram → download → upload to Redbubble" adds workflow context novice POD sellers need. No video required. | Low | Optional `tip` field on prompt record; text only |
| **Category pack pricing** | $14.99 for all t-shirt prompts vs. $2.99 each = high-value bundle that encourages larger transactions | Med | Pack = one Gumroad product per category; bulk unlock mutation |
| **SEO landing pages for POD prompt queries** | "Midjourney prompts for t-shirts", "Ideogram prompts for wall art" — real search intent, relatively uncompeted | Med | ISR + descriptive slugs + structured metadata |
| **OG image per prompt** | When shared on Twitter/X, Discord, Reddit — rich OG image with watermarked output builds trust and click-through | Low-Med | `next/og` with title + image + category badge |
| **Like/bookmark on free prompts** | Builds a shortlist for "not sure yet" buyers; lightweight engagement signal | Low | Like count visible to all; click requires sign-in |
| **Convex reactive unlock** | The moment Gumroad's webhook fires, the user sees full prompt text without refreshing — UX differentiator vs Etsy's email delivery | Med | Convex real-time subscription on unlock record |

---

## Anti-Features

Features to deliberately NOT build in v1.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Creator submissions / marketplace** | Requires moderation, creator payouts, quality control — doubles surface area before any validation | Seed all content manually |
| **Subscription model** | Competing with Midjourney/ChatGPT subscriptions is a positioning trap | Keep per-prompt and pack pricing only |
| **Reviews and ratings** | Empty stars look worse than no stars; needs purchase volume to be meaningful | Add only after 50+ purchases per prompt |
| **Community / Discord integration** | Building a community is a full second product | Analytics only; community is v3+ |
| **Multiple currencies / localization** | Gumroad handles VAT and currency display automatically | USD pricing only |
| **Video tutorials** | POD sellers know their tools; text tips are sufficient and 10x faster to produce | Short text `tip` field |
| **Mobile app** | Web-first is correct for an SEO-driven discovery product | Responsive web |
| **Admin CMS** | ~20 prompts at launch; Convex dashboard seeding is sufficient | Seed script or direct Convex dashboard |
| **Email delivery of prompts** | Adds email infrastructure and delivery failure risk | Dashboard-based access |
| **Private/signed image URLs** | Watermark is baked into the image; no unlock value in the image | Pre-watermarked images; public Convex storage URLs |
| **Search within catalog** | At ~20 prompts, search has negative ROI; category nav is sufficient | Add when catalog exceeds ~100 prompts |
| **Marketing category** | Validate POD first; marketing prompts are a different buyer persona | Defer until POD unlocks prove the model |

---

## Feature Dependencies

```
Clerk auth
  └─ Dashboard (requires identity)
      └─ Unlock records (requires Clerk tokenIdentifier)
          └─ Gumroad webhook (records unlock against Clerk user)
              └─ Gumroad product IDs (required in prompt/pack schema)

Convex schema (prompts table)
  └─ Prompt card (title, preview image, slug, price, AI tool badge)
  └─ Prompt modal (partial text, full text, tip)
  └─ Category listing page (category, subcategory fields)
  └─ SEO sitemap (slugs, updated_at)

ISR rendering
  └─ Prompt detail page SEO (static generation + revalidation)
  └─ OG image (prompt data at build/revalidation time)

Category pack
  └─ Gumroad pack product (separate product per category)
  └─ Bulk unlock mutation (marks all prompts in category as unlocked for user)
```

---

## Unlock / Paywall UX Deep Dive

### Interaction states

**State 1 — Card (listing page):** Watermarked image visible. Title + description visible. Price badge visible. No prompt text.

**State 2 — Modal, locked:** Full watermarked image. First 1-2 lines of prompt text visible (real, selectable text). Rest blurred via CSS `filter: blur()`. "Unlock for $2.99" is the single most prominent element. Pack upsell ("Unlock all 12 t-shirt prompts — $14.99") appears below as secondary CTA. Copy button absent.

**State 3 — Gumroad payment:** Opens Gumroad overlay (preferred) or new tab. Payment completes on Gumroad.

**State 4 — Post-payment (webhook fired):** Convex reactive query updates. Modal re-renders showing full prompt text. Copy button appears. No page reload, no "check your email" step.

**State 5 — Return visit (logged in, already unlocked):** Convex query for `unlocks` returns this prompt as unlocked. Modal opens directly to full text view.

### Critical details

- Blur must be CSS-only, not image-based. Partial text must be selectable — users want to confirm it's real text before paying.
- **Auth-before-payment is a hard technical constraint**: you cannot record an unlock without a Clerk `tokenIdentifier`. If user is not signed in, the "Unlock" button must trigger sign-in first, then redirect back to the modal.
- Pack CTA must not compete visually with the single-prompt CTA — it is an upsell, not an alternative.

---

## MVP Launch Priority Order

### Must have for day one (ordered by dependency)

1. Convex schema: `prompts`, `unlocks`, `users` tables
2. Category/subcategory listing pages with prompt cards
3. Prompt detail modal with blur/unlock CTA
4. Gumroad webhook handler → Convex unlock record
5. Clerk auth + protected dashboard routes
6. Dashboard: unlocked prompts view with copy access
7. Copy-to-clipboard on unlocked modal
8. SEO: `generateMetadata()` per prompt, sitemap, robots.txt
9. ISR on prompt detail pages
10. POD category seeded (~20 prompts)

### Can defer to post-launch (week 2+)

- OG images per prompt
- Usage tips field on prompts
- Category pack pricing
- Like/bookmark feature
- Posthog event tracking

### Explicitly out of scope for v1

- Marketing category
- Creator submissions
- Reviews/ratings
- Subscription model
- In-catalog search

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Table stakes | HIGH | Direct analysis of PromptBase, Gumroad, Etsy digital downloads |
| Unlock UX pattern | HIGH | Consistent across PromptBase, Notion template stores, Gumroad product pages |
| SEO opportunity (POD prompt queries) | MEDIUM | Keyword intent is real; actual search volume not validated |
| POD taxonomy as differentiator | MEDIUM | PromptBase is tool-centric not product-type-centric — competitive gap is real but market validation pending |
| Pack pricing conversion lift | MEDIUM | Standard digital goods bundling pattern; not POD-specific data |
| Auth-before-payment requirement | HIGH | Technical constraint: Convex unlock requires Clerk tokenIdentifier |
