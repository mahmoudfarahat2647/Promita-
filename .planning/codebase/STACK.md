# Technology Stack

**Analysis Date:** 2026-05-03

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`src/`, `convex/`)

**Secondary:**
- CSS - Tailwind utility classes in `.tsx` files; global styles at `src/app/globals.css`

## Runtime

**Environment:**
- Node.js (v22 detected in shell)

**Package Manager:**
- pnpm (primary — `pnpm-lock.yaml` present)
- npm lockfile also present (`package-lock.json`, lockfileVersion 3)
- Lockfile: present (`pnpm-lock.yaml`)

## Frameworks

**Core:**
- Next.js 16.2.4 - Full-stack React framework with App Router (`src/app/`)
- React 19.2.4 - UI rendering
- Convex 1.37.0 - Serverless backend (database + functions), located at `convex/`

**Build/Dev:**
- TypeScript 5.9.3 - Compilation (`tsconfig.json`)
- ESLint 9.39.4 - Linting (`eslint.config.mjs`)
- `eslint-config-next` 16.2.4 - Next.js-specific lint rules
- Tailwind CSS 4.2.4 - Utility-first CSS
- `@tailwindcss/postcss` 4.2.4 - Tailwind PostCSS integration (`postcss.config.mjs`)

## Key Dependencies

**Critical:**
- `@clerk/nextjs` ^7.3.0 (resolved 7.3.0) - Authentication/identity (current SDK, not Core 2)
- `convex` ^1.37.0 (resolved 1.37.0) - Backend-as-a-service: database, functions, file storage

**UI:**
- `shadcn` 4.6.0 - Component generator/CLI (`components.json` configured, style: `radix-nova`)
- `radix-ui` 1.4.3 - Headless UI primitives (used directly in `src/components/ui/button.tsx`)
- `class-variance-authority` 0.7.1 - Component variant utility (`cva`)
- `lucide-react` 1.14.0 - Icon library
- `clsx` 2.1.1 - Conditional class utility
- `tailwind-merge` 3.5.0 - Tailwind class conflict resolution
- `tw-animate-css` 1.4.0 - CSS animation utility for Tailwind

**State (Planned per MVP.md):**
- React Query - server state management (not yet installed)

## Configuration

**Environment:**
- `.env` file present (do not read — contains secrets)
- `.env.local` file present (do not read — contains secrets)
- Required env vars include Convex deployment URL and Clerk publishable/secret keys
- Clerk JWT issuer domain needed for Convex auth (`convex/auth.config.ts` — currently commented out)

**Build:**
- `next.config.ts` - Next.js config (currently empty/default)
- `tsconfig.json` - TypeScript config; path alias `@/*` → `./src/*`; target ES2017; strict mode enabled
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `eslint.config.mjs` - ESLint flat config with Next.js core-web-vitals + TypeScript rules
- `components.json` - shadcn/ui configuration (style: `radix-nova`, icon: `lucide`, RSC enabled)

## shadcn/ui Configuration

- Style: `radix-nova`
- RSC: enabled
- Tailwind CSS variables: enabled
- Base color: `neutral`
- Aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`
- Icon library: `lucide`

## Platform Requirements

**Development:**
- Node.js v22+
- pnpm package manager
- Convex dev server (`npx convex dev`)

**Production:**
- Hosting target: Netlify (per `MVP.md`)
- Convex cloud backend (auto-managed deployment)

---

*Stack analysis: 2026-05-03*
