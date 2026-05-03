# Promita AI

## What This Is

Promita AI is a prompt marketplace where creators browse and unlock AI-generated design prompts for print-on-demand (POD) and marketing niches. Users pay per prompt or per category pack through Gumroad and get instant access to the full prompt text. The site is built to rank organically for prompt-related queries and serve POD sellers who want ready-to-use prompts they can feed straight into ChatGPT, Gemini, or Ideogram.

## Core Value

Someone pays on Gumroad and immediately gets access to the full prompt — no delay, no extra steps.

## Requirements

### Validated

- ✓ Next.js App Router scaffold initialized — existing
- ✓ Convex backend dependency installed — existing
- ✓ Clerk authentication dependency installed — existing
- ✓ shadcn/ui component system configured (radix-nova style) — existing
- ✓ Tailwind CSS 4 configured — existing
- ✓ TypeScript strict mode with `@/*` path alias configured — existing

### Active

**Foundation**
- [ ] ConvexProvider + ClerkProvider wired into root layout
- [ ] Clerk JWT auth configured in Convex (`auth.config.ts`)
- [ ] Product schema: prompts, unlocks, users tables in Convex
- [ ] App metadata updated (title, description — remove CNA defaults)

**Catalog**
- [ ] User can browse prompts by category and subcategory
- [ ] User can view a prompt detail page with watermarked preview image (blurred/locked)
- [ ] Prompt URLs follow `/prompts/[category]/[subcategory]/[slug]` pattern
- [ ] Category and subcategory listing pages exist

**Unlock Flow**
- [ ] Locked prompt shows a blurred preview with a "Unlock for $2.99" CTA
- [ ] Clicking unlock opens Gumroad payment for the prompt
- [ ] Gumroad Ping webhook verifies payment and records unlock in Convex
- [ ] Unlocked user sees full prompt text immediately after payment
- [ ] Category pack available for $14.99 (unlocks all prompts in a category)

**Auth & Dashboard**
- [ ] User can sign in with Clerk (required for dashboard, optional for browsing)
- [ ] Authenticated user has a dashboard showing all their unlocked prompts
- [ ] Dashboard routes (`/dashboard/*`) are protected by Clerk middleware

**SEO**
- [ ] Prompt detail pages use ISR (Incremental Static Regeneration)
- [ ] Each prompt page has a unique OG image
- [ ] Dynamic XML sitemap generated at `/sitemap.xml`
- [ ] `robots.txt` configured

**Content**
- [ ] POD category seeded with initial prompts (t-shirts, mugs, wall art, etc.)
- [ ] Prompt records include: title, preview image, locked full text, category, subcategory, slug, price
- [ ] Some prompts include a short usage tip (e.g., "Paste this into Ideogram, download, upload to Redbubble")

**Operations**
- [ ] Gumroad Ping webhook handler at `/api/webhook/gumroad` with Upstash rate limiting
- [ ] Webhook validates Gumroad signature before processing

### Out of Scope

- Marketing category — deferred to v2 (validate POD first)
- Video tutorials / guided walkthroughs — text-only tips in v1 (POD users already know the tools)
- Mobile app — web only
- Subscription model — per-prompt and pack pricing only in v1
- User ratings / reviews — deferred
- Multiple currencies — USD only
- Custom payment processing — Gumroad only
- Analytics beyond Posthog basic events — deferred

## Context

- **Existing scaffold**: Next.js 16.2.4 (App Router), Convex 1.37.0, Clerk 7.3.0, shadcn/ui radix-nova, Tailwind 4.2.4, pnpm, Node v22
- **Not yet wired**: Convex auth (Clerk JWT commented out), no providers in layout, placeholder schema (`numbers` table only), default create-next-app template UI
- **Full product spec** lives in `MVP.md` — authoritative reference for prompt content structure, pricing, category taxonomy, image strategy
- **Image strategy**: prompts are pre-watermarked before upload; Convex File Storage serves the watermarked previews. Full (unwatermarked) prompt text is what gets unlocked — not a different image
- **Target audience**: POD sellers (Redbubble, Printful, etc.) who use ChatGPT / Gemini / Ideogram and want high-quality prompts they don't have to write themselves
- **Tech debt at start**: dual lockfiles (`pnpm-lock.yaml` + `package-lock.json`), `convex/myFunctions.ts` placeholder, default CNA metadata

## Constraints

- **Tech stack**: Next.js + Convex + Clerk — already installed, stay with these
- **Payments**: Gumroad only — no Stripe, no custom checkout
- **Hosting**: Netlify — target deployment platform
- **Package manager**: pnpm — not npm (delete `package-lock.json` early)
- **Node.js**: v22+
- **Scope**: POD category only for MVP — no marketing category until POD validates
- **Content creation**: Prompts are created and uploaded manually (no CMS or admin UI required in v1)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prompts are prompt text (+ optional short tip) | POD audience already knows the tools; extra content = scope creep | — Pending |
| POD-first lean launch | Validates core unlock flow before building second category | — Pending |
| Gumroad for payments | Zero payment infrastructure to build; Ping webhook is simple | — Pending |
| Pre-watermark images before upload | No server-side processing needed; simpler and cheaper | — Pending |
| Unlock = record in Convex, not email | Immediate access, dashboard-trackable, no email delivery edge cases | — Pending |
| Brand name: Promita AI (temporary) | Placeholder — may change before launch | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-03 after initialization*
