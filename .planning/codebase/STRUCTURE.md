# Directory Structure

**Analysis Date:** 2026-05-03

## Top-Level Layout

```
d:/promptita/
├── convex/                  # Convex backend (functions, schema, auth config)
├── src/                     # Next.js App Router source
│   ├── app/                 # Routes, layouts, pages
│   ├── components/          # Shared UI components
│   └── lib/                 # Utilities
├── public/                  # Static assets (SVGs)
├── .planning/               # GSD planning documents
├── .claude/                 # Claude Code configuration (hooks, agents, skills)
├── .agents/                 # Agent skill definitions
├── AGENTS.md                # Agent instructions (Next.js + Convex guidance)
├── CLAUDE.md                # Claude project instructions (references AGENTS.md)
├── MVP.md                   # Full product spec / feature roadmap
├── README.md                # Project readme
├── components.json          # shadcn/ui config
├── next.config.ts           # Next.js config (currently default/empty)
├── tsconfig.json            # TypeScript config (strict, path alias @/* → ./src/*)
├── eslint.config.mjs        # ESLint flat config
├── postcss.config.mjs       # PostCSS (Tailwind)
├── package.json             # Dependencies
├── pnpm-lock.yaml           # pnpm lockfile (primary)
├── package-lock.json        # npm lockfile (also present — dual lockfile issue)
├── .env                     # Environment secrets (do not read)
└── .env.local               # Local environment secrets (do not read)
```

## Source Directory (`src/`)

```
src/
├── app/
│   ├── layout.tsx           # Root layout — sets fonts (Geist), metadata
│   ├── page.tsx             # Home page — currently the default create-next-app template
│   ├── globals.css          # Global CSS — Tailwind base + CSS custom properties
│   └── favicon.ico
├── components/
│   └── ui/
│       └── button.tsx       # shadcn Button component (radix-nova style, cva-based)
└── lib/
    └── utils.ts             # cn() helper — clsx + tailwind-merge
```

## Convex Backend (`convex/`)

```
convex/
├── _generated/              # Auto-generated types (do not edit manually)
│   ├── api.d.ts             # Typed API references
│   ├── server.d.ts          # Server-side type definitions
│   └── ai/
│       └── guidelines.md    # AI coding guidelines for Convex — read before writing Convex code
├── schema.ts                # Database schema (currently: numbers table — placeholder)
├── myFunctions.ts           # Starter functions (listNumbers, addNumber, myAction — placeholder)
├── auth.config.ts           # Auth provider config (Clerk provider commented out)
├── tsconfig.json            # Convex-specific TypeScript config
└── README.md                # Convex getting-started instructions
```

## Key File Purposes

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — wraps all pages; will need ConvexProvider + ClerkProvider added here |
| `src/app/page.tsx` | Home page — currently placeholder; will become landing/catalog page |
| `src/app/globals.css` | Global styles — Tailwind directives + CSS variables for design system |
| `convex/schema.ts` | Database schema — define all Convex tables here |
| `convex/auth.config.ts` | Clerk JWT auth config — uncomment once Clerk app is created |
| `components.json` | shadcn/ui config — controls component generation style and paths |
| `tsconfig.json` | TypeScript — `@/*` alias maps to `src/`, strict mode on |

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g. `Button.tsx`)
- Utilities / helpers: `camelCase.ts` (e.g. `utils.ts`)
- Next.js special files: lowercase (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`)
- Convex functions: `camelCase.ts` named by domain (e.g. `prompts.ts`, `users.ts`)

**Components:**
- UI primitives in `src/components/ui/` (generated via shadcn CLI)
- Feature/domain components should go in `src/components/[feature]/`

**Convex:**
- One file per domain (e.g. `convex/prompts.ts`, `convex/users.ts`, `convex/unlocks.ts`)
- Export named functions: `export const listPrompts = query({...})`
- Import generated API via `import { api } from "./_generated/api"`

## Where to Add New Code

| What | Where |
|------|-------|
| New page/route | `src/app/[route]/page.tsx` |
| New layout | `src/app/[route]/layout.tsx` |
| Shared UI component | `src/components/ui/` (shadcn) or `src/components/[feature]/` |
| Feature component | `src/components/[feature]/FeatureName.tsx` |
| Utility function | `src/lib/[name].ts` |
| Custom hook | `src/lib/hooks/use[Name].ts` or `src/hooks/use[Name].ts` |
| Convex query/mutation | `convex/[domain].ts` (e.g. `convex/prompts.ts`) |
| New Convex table | Add to `convex/schema.ts` |
| API route (Next.js) | `src/app/api/[route]/route.ts` |
| Static assets | `public/` |

## Planned Route Structure (per MVP.md)

```
src/app/
├── page.tsx                              # Landing / catalog home
├── prompts/
│   ├── [category]/
│   │   ├── page.tsx                      # Category listing
│   │   └── [subcategory]/
│   │       ├── page.tsx                  # Subcategory listing
│   │       └── [slug]/
│   │           └── page.tsx              # Individual prompt page
├── dashboard/
│   ├── page.tsx                          # User dashboard (unlocked + bookmarked)
│   └── purchases/
│       └── page.tsx                      # Purchase history
├── api/
│   └── webhook/
│       └── route.ts                      # Gumroad Ping webhook handler
└── sitemap.xml/
    └── route.ts                          # Dynamic sitemap
```

---

*Structure analysis: 2026-05-03*
