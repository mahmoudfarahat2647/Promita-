# External Integrations

**Analysis Date:** 2026-05-03

## APIs & External Services

**Authentication:**
- Clerk - User identity, session management, route protection
  - SDK/Client: `@clerk/nextjs` v7.3.0 (current SDK, App Router compatible)
  - Auth: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (in `.env.local`)
  - JWT domain: `CLERK_JWT_ISSUER_DOMAIN` (needed for Convex auth integration — currently commented out in `convex/auth.config.ts`)
  - Config: `convex/auth.config.ts` (Clerk → Convex JWT provider, not yet active)
  - Skill reference: `.agents/skills/clerk-nextjs-patterns/SKILL.md`

**Payments (Planned):**
- Gumroad - Payment processing, product unlocks, VAT/tax handling
  - Webhook endpoint: `/api/webhook` (planned, not yet implemented)
  - Mechanism: Gumroad Ping webhook → Convex mutation stores unlock against Clerk user ID
  - Products: single prompt unlock ($2.99), full category pack ($14.99)

**Analytics (Planned):**
- PostHog - Product analytics, session replay, funnel tracking
  - Not yet installed (no `posthog-js` in `package.json`)
  - Planned events: prompt views, unlock funnel, purchase conversion, traffic sources

## Data Storage

**Databases:**
- Convex - Primary database and serverless function runtime
  - Version: `convex` 1.37.0
  - Connection: `CONVEX_URL` (deployment URL in `.env.local`)
  - Schema: `convex/schema.ts` — currently defines only `numbers` table (placeholder from quickstart)
  - Functions: `convex/myFunctions.ts` — placeholder queries/mutations/actions
  - Generated types: `convex/_generated/` (api, server, dataModel types)
  - AI guidelines: `convex/_generated/ai/guidelines.md`
  - Skill reference: `.agents/skills/convex/SKILL.md`

**File Storage:**
- Convex File Storage - Image hosting for prompt output images
  - Served via Convex global edge storage
  - Pre-watermarked images uploaded and stored in Convex (per `MVP.md`)

**Caching:**
- Upstash (Redis) - Rate limiting (planned)
  - Not yet installed
  - Planned use: rate limit webhook endpoint (`/api/webhook`), `/api/unlock`, `/api/bookmark`

## Authentication & Identity

**Auth Provider:**
- Clerk (current SDK v7.3.0)
  - Implementation: Next.js App Router integration via `@clerk/nextjs`
  - Protects dashboard routes and purchase flows
  - User IDs stored in Convex to associate unlocked prompts
  - Clerk → Convex JWT auth bridge: configured in `convex/auth.config.ts` but **not yet active** (provider block commented out)
  - Note: To activate, uncomment provider in `convex/auth.config.ts` and set `CLERK_JWT_ISSUER_DOMAIN`

## Monitoring & Observability

**Error Tracking:**
- None currently installed

**Logs:**
- Convex built-in function logging (`console.log` in actions/mutations)
- No structured logging library present

**Analytics:**
- PostHog (planned — not yet installed)

## CI/CD & Deployment

**Hosting:**
- Netlify (per `MVP.md`)
- Convex cloud deployment (separate managed backend)

**CI Pipeline:**
- None detected (no `.github/workflows/`, `netlify.toml`, or similar)

## Environment Configuration

**Required env vars (inferred from integrations):**
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL (required for Convex client)
- `CONVEX_DEPLOY_KEY` - Convex deploy key (for CI/production deploys)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT domain (needed for Convex auth integration)
- Planned additions: Upstash Redis URL/token, PostHog project API key

**Secrets location:**
- `.env.local` - Local development secrets (gitignored)
- `.env` - May contain non-secret defaults or shared config (present but contents not read)

## Webhooks & Callbacks

**Incoming (Planned):**
- `POST /api/webhook` - Gumroad Ping webhook; triggers prompt unlock flow in Convex
  - Rate-limited via Upstash
  - Stores unlock record in Convex keyed to Clerk user ID

**Outgoing:**
- None currently implemented

## Next.js Font Loading

- Google Fonts via `next/font/google` — `Geist` and `Geist_Mono` loaded in `src/app/layout.tsx`
  - This makes an external call to Google Fonts CDN at build/runtime

---

*Integration audit: 2026-05-03*
