# Coding Conventions

**Analysis Date:** 2026-05-03

## Naming Patterns

**Files:**
- React components: PascalCase, `.tsx` extension — `Button.tsx`, `layout.tsx`, `page.tsx`
- Utility modules: camelCase, `.ts` extension — `utils.ts`
- Convex backend functions: camelCase, `.ts` extension — `myFunctions.ts`, `schema.ts`, `auth.config.ts`
- Next.js App Router reserved files: lowercase — `layout.tsx`, `page.tsx`, `globals.css`
- Config files: kebab-case or camelCase, various extensions — `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`

**Functions:**
- React components: PascalCase function declarations — `export default function Home()`
- Convex handlers: named arrow functions passed into wrappers — `handler: async (ctx, args) => {}`
- Exported Convex functions: camelCase — `listNumbers`, `addNumber`, `myAction`
- Utility functions: camelCase — `cn()`

**Variables:**
- camelCase throughout TypeScript/TSX — `geistSans`, `geistMono`, `buttonVariants`
- CSS custom properties: kebab-case prefixed with `--` — `--font-geist-sans`, `--color-background`
- Convex `cva` variant objects: camelCase keys — `variant`, `size`, `defaultVariants`

**Types:**
- TypeScript interfaces and types: PascalCase — `Metadata`, `NextConfig`, `AuthConfig`
- Convex doc types: `Doc<"tableName">` pattern from `_generated/dataModel`
- Convex id types: `Id<"tableName">` pattern from `_generated/dataModel`
- VariantProps: generic import from `class-variance-authority` — `VariantProps<typeof buttonVariants>`

**Convex Functions:**
- Public functions: `query`, `mutation`, `action` from `./_generated/server`
- Internal functions: `internalQuery`, `internalMutation`, `internalAction` (private, not yet in codebase but prescribed)
- All Convex functions MUST include argument validators using `v` from `convex/values`

## Code Style

**Formatting:**
- No Prettier config file detected — formatting governed by ESLint config
- TypeScript strict mode enabled (`"strict": true` in both `tsconfig.json` and `convex/tsconfig.json`)
- Double quotes for JSX attributes, no preference enforced in TS/JS (eslint-config-next defaults)

**Linting:**
- ESLint 9 with flat config (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Run: `eslint` (no path required — uses flat config auto-detection)

**TypeScript Strictness:**
- `"strict": true` — all strict checks active (no `any`, no implicit returns, etc.)
- `"noEmit": true` — TypeScript only for type checking, not compilation
- `"isolatedModules": true` — no cross-file type-only constructs without `import type`
- Never use `any` for Convex context parameters; use `QueryCtx`, `MutationCtx`, `ActionCtx`

## Import Organization

**Order (observed in source files):**
1. Framework/React imports — `import * as React from "react"`, `import type { Metadata } from "next"`
2. Third-party library imports — `import { cva, type VariantProps } from "class-variance-authority"`, `import { Slot } from "radix-ui"`
3. Internal path-aliased imports — `import { cn } from "@/lib/utils"`
4. Relative/local imports — `import "./globals.css"`

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- shadcn aliases configured in `components.json`:
  - `@/components` → components
  - `@/components/ui` → UI primitives
  - `@/lib/utils` → utilities
  - `@/lib` → lib
  - `@/hooks` → hooks

**Convex Imports:**
- Generated types/functions always from `./_generated/server` and `./_generated/api`
- Use `api` object for public function references, `internal` for private ones
- Import validators: `import { v } from "convex/values"`
- Import schema helpers: `import { defineSchema, defineTable } from "convex/server"`

**Import Style:**
- Use `import type` for type-only imports — `import type { Metadata } from "next"`
- Direct named imports preferred over barrel re-exports (aligns with `bundle-barrel-imports` skill rule)

## Error Handling

**Patterns:**
- Optional chaining for nullable values — `(await ctx.auth.getUserIdentity())?.name ?? null`
- Nullish coalescing for defaults — `?? null`
- No explicit try/catch blocks in current source — error boundaries not yet implemented
- Convex guidelines mandate: never accept user identity from function args; always use `ctx.auth.getUserIdentity()` server-side
- TypeScript strict mode acts as first-line defense against null/undefined errors at compile time

## Logging

**Framework:** `console.log` (Node.js/browser built-in)

**Patterns:**
- Convex actions use `console.log` for debug output — `console.log(data)` in `convex/myFunctions.ts`
- No structured logging library detected
- Convex actions are the appropriate place for side-effectful logging

## Comments

**When to Comment:**
- Inline comments for configuration guidance — `// Uncomment this once you have set up a Clerk app.`
- No JSDoc observed in current source files
- Code block comments used for temporary/disabled configuration (e.g., auth.config.ts)

**JSDoc/TSDoc:**
- Not currently used — minimal surface area in initial scaffold

## Function Design

**Size:** Functions are small and focused — each Convex export is a single-purpose handler

**Parameters:**
- Convex functions: always typed via `args` object with validators, context always first parameter (`ctx`)
- React components: use `React.ComponentProps<"element">` spread with explicit additions
- Prop types inline in function signature (not separate `type Props = {}`)

**Return Values:**
- Convex queries: return plain objects or primitives — `{ viewer: string | null, numbers: number[] }`
- Convex mutations: return `void` (no explicit return) or `null`
- React components: return JSX elements directly, no wrapper needed

## Module Design

**Exports:**
- Named exports for Convex functions — `export const listNumbers = query({...})`
- Default export for React page/layout components — `export default function Home()`
- Named exports for reusable UI components — `export { Button, buttonVariants }`
- Default export for Convex schema — `export default defineSchema({...})`
- Default export for Convex auth config — `export default { providers: [...] } satisfies AuthConfig`

**Barrel Files:**
- `components.json` configures shadcn aliases but no index.ts barrel files observed
- Skill rule `bundle-barrel-imports` advises against barrel imports; import directly from source files

## React/Next.js Conventions

**Component Model:**
- App Router (Next.js 16) — all components are Server Components by default
- Add `'use client'` directive only for components needing browser APIs or hooks
- Server Components use `await auth()` from `@clerk/nextjs/server`
- Client Components use `useAuth()` hook from `@clerk/nextjs`

**Styling:**
- Tailwind CSS v4 with `@import "tailwindcss"` in `globals.css`
- CSS variables via `@theme inline` block — all design tokens as custom properties
- `oklch` color space for CSS color values
- Component variants via `class-variance-authority` (cva) — see `src/components/ui/button.tsx`
- `cn()` utility from `src/lib/utils.ts` merges Tailwind classes — use for all className composition
- shadcn/ui `radix-nova` style, `neutral` base color, RSC-compatible

**shadcn/ui Component Pattern:**
```typescript
// Spread native element props + explicit additions
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
export { Button, buttonVariants }
```

**Convex Backend Pattern:**
```typescript
// Every function must have args with validators
export const listNumbers = query({
  args: {
    count: v.number(),
  },
  handler: async (ctx, args) => {
    // Use ctx.db for queries/mutations, ctx.auth for identity
    // Use ctx.runQuery/runMutation/runAction for cross-function calls
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});
```

---

*Convention analysis: 2026-05-03*
