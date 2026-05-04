# 🖤 Prompt Catalog MVP — Full Spec

## Stack

| Layer | Choice |
| --- | --- |
| **Frontend** | Next.js (App Router) + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui + Lucide Icons |
| **Auth** | Clerk |
| **Database** | Convex (Database + File Storage) |
| **Payments** | Gumroad (webhook auto-unlock) |
| **Rate Limiting** | Upstash (Redis) |
| **Analytics** | Posthog |
| **Hosting** | Netlify |
| **State** | React Query (server state) + useState (UI state) |

---

## Theme

- Black & white, clean, minimal
- Sidebar (categories/subcategories) + top header
- Lucide icons throughout

---

## Content Structure

### Categories & Subcategories

```text
/prompts/pod/tshirts
/prompts/pod/stickers
/prompts/pod/mockups
/prompts/marketing/social-media
/prompts/marketing/product-photography
/prompts/marketing/ad-creatives
```

### Launch Content

- ~20 curated prompts (3-5 per subcategory)
- You create all content at launch
- Community submissions open later

---

## Prompt Card (Listing Page)

- Watermarked output image
- Heart/like toggle (Ideogram-style, red on active)
- Like count (visible to all, clickable only when logged in)
- Title + short description
- AI tool badge (ChatGPT or Gemini)
- Category + subcategory tags
- Free / Paid badge
- Click → opens modal

---

## Prompt Modal

- Full watermarked image (pre-watermarked before upload)
- Partial prompt text (first 1-2 lines visible)
- Rest blurred with unlock CTA
- Copy button (unlocked users only)
- AI tool badge
- Gumroad unlock button → webhook → auto-unlock in Convex

---

## Monetization

| Type | Price |
| --- | --- |
| Single prompt unlock | $2.99 |
| Full category pack | $14.99 |

- Gumroad handles payment + VAT/tax globally
- Gumroad Ping webhook → Convex stores unlock against Clerk user ID
- Upstash rate limits webhook endpoint

---

## User Dashboard

- Unlocked prompts
- Purchase history
- Bookmarked free prompts

---

## SEO Strategy

| Feature | Implementation |
| --- | --- |
| Rendering | ISR (Incremental Static Regeneration) |
| URLs | `/prompts/[category]/[subcategory]/[slug]` |
| Sitemap | Dynamic `sitemap.xml` from Convex catalog |
| Robots | `robots.txt` blocks `/dashboard` + `/api` |
| OG Images | Dynamic per-prompt via `next/og` (title + image + category badge) |
| Metadata | Per-page title, description, canonical URL |

---

## Image Strategy

- Pre-watermarked before upload (manual, Photoshop/Canva)
- Stored in Convex File Storage
- Served via Convex global edge storage
- Heart like overlay via DOM (Lucide Heart icon)

---

## Security & Performance

- Upstash rate limiting on `/api/webhook`, `/api/unlock`, `/api/bookmark`
- `robots.txt` blocks non-public routes
- Clerk protects all dashboard + purchase routes
- Partial prompt blur (CSS) + watermark (baked into image)
- TypeScript end-to-end

---

## Analytics

- Posthog for:
  - Prompt view events
  - Unlock funnel tracking
  - Purchase conversion
  - Session replay
  - Traffic sources
- Like counts as built-in popularity signal for trending prompts

---

## What's NOT in MVP (post-launch)

- Community prompt submissions
- Creator profiles + payouts
- Midjourney / Flux / Sora support
- Cross-tool prompt variants
- Zustand (no complex client state yet)
- Private signed URLs for images
- Subscription model
- Reviews & ratings

---

