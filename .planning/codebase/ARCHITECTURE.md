<!-- refreshed: 2026-05-03 -->
# Architecture

**Analysis Date:** 2026-05-03

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router (Frontend)                 │
│                          src/app/                                    │
├──────────────────────┬──────────────────────┬───────────────────────┤
│   Pages / Routes     │   React Components   │   Layout / Metadata   │
│  `src/app/page.tsx`  │  `src/components/`   │  `src/app/layout.tsx` │
└──────────┬───────────┴────────────┬─────────┴──────────┬────────────┘
           │                        │                     │
           │  Convex React SDK       │                     │
           ▼                        ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Convex Backend (BaaS)                            │
│                          convex/                                     │
├──────────────────────┬──────────────────────┬───────────────────────┤
│       Queries        │      Mutations       │        Actions        │
│   (read, reactive)   │   (write, transact)  │  (side effects/HTTP)  │
│  `convex/myFunctions │  `convex/myFunctions │  `convex/myFunctions  │
│         .ts`         │         .ts`         │         .ts`          │
└──────────┬───────────┴────────────┬─────────┴──────────────────────-┘
           │                        │
           ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│               Convex Database + File Storage                         │
│   Schema: `convex/schema.ts`   Generated API: `convex/_generated/`  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | HTML shell, font loading, global styles | `src/app/layout.tsx` |
| Home Page | Default landing page (placeholder) | `src/app/page.tsx` |
| Button | Reusable UI primitive (shadcn/radix-nova style) | `src/components/ui/button.tsx` |
| Utils | `cn()` class merging helper | `src/lib/utils.ts` |
| Convex Schema | Database table definitions | `convex/schema.ts` |
| Convex Functions | Public queries, mutations, actions | `convex/myFunctions.ts` |
| Auth Config | JWT provider registration for Convex | `convex/auth.config.ts` |
| Generated API | Type-safe function references (auto-generated) | `convex/_generated/api.d.ts` |
| Generated Data Model | Type-safe document types (auto-generated) | `convex/_generated/dataModel.d.ts` |

## Pattern Overview

**Overall:** Fullstack React with serverless BaaS — Next.js App Router on the frontend, Convex as the reactive database and backend.

**Key Characteristics:**
- Convex provides real-time reactive queries via WebSocket subscriptions — no manual polling or REST calls needed for live data
- All backend logic (queries, mutations, actions) lives in `convex/` and is type-safe end-to-end via code generation
- The Next.js App Router enables React Server Components (RSC), Server Actions, and ISR alongside client components
- Authentication is planned via Clerk (`@clerk/nextjs` installed), with Convex receiving JWTs through `convex/auth.config.ts`
- UI components are built on shadcn/ui (`radix-nova` style) with Tailwind CSS v4

## Layers

**Frontend Layer (Next.js App Router):**
- Purpose: UI rendering, routing, SEO, user interaction
- Location: `src/app/`, `src/components/`
- Contains: Pages, layouts, React components, CSS
- Depends on: Convex React SDK, Clerk SDK, UI primitives
- Used by: End users via browser

**UI Component Layer (shadcn/ui):**
- Purpose: Reusable, accessible UI primitives
- Location: `src/components/ui/`
- Contains: Button and future shadcn components
- Depends on: `radix-ui`, `class-variance-authority`, `src/lib/utils.ts`
- Used by: Pages and feature components

**Utility Layer:**
- Purpose: Shared helpers
- Location: `src/lib/`
- Contains: `cn()` for conditional class name merging
- Depends on: `clsx`, `tailwind-merge`
- Used by: All components

**Backend Layer (Convex):**
- Purpose: Data storage, business logic, auth enforcement, file storage
- Location: `convex/`
- Contains: Schema, queries, mutations, actions, auth config
- Depends on: Convex platform runtime
- Used by: Frontend via Convex React SDK

**Generated Layer (Convex codegen):**
- Purpose: Type-safe API references auto-generated from backend code
- Location: `convex/_generated/`
- Contains: `api.d.ts`, `dataModel.d.ts`, `server.d.ts`, `server.js`
- Generated: Yes — run `npx convex dev` to regenerate
- Used by: Both `convex/` functions and `src/` frontend code

## Data Flow

### Real-Time Query (Reactive)

1. Client component subscribes to Convex query via `useQuery(api.myFunctions.listNumbers, { count: 10 })` (frontend)
2. Convex backend executes `listNumbers` query handler against the database (`convex/myFunctions.ts:5`)
3. Result streams to client via WebSocket; UI re-renders automatically on data change
4. Auth identity resolved server-side via `ctx.auth.getUserIdentity()` — never passed as argument

### Mutation (Write Path)

1. Client calls `useMutation(api.myFunctions.addNumber)` and invokes it with args (`convex/myFunctions.ts:22`)
2. Convex mutation handler runs as a transaction — `ctx.db.insert("numbers", { value: args.value })`
3. All subscribed queries on the `numbers` table are automatically invalidated and re-run
4. Client state updates reactively with no manual cache invalidation

### Action (Side-Effect Path)

1. Client or another Convex function calls `myAction` (`convex/myFunctions.ts:31`)
2. Action can call external APIs, then delegates to queries/mutations via `ctx.runQuery` / `ctx.runMutation`
3. Actions that use Node.js built-ins must declare `"use node";` at file top and be isolated from queries/mutations

### Planned: Webhook Path (Gumroad → Convex)

1. Gumroad sends POST to Next.js API route `/api/webhook`
2. Upstash Redis rate-limits the endpoint
3. Handler calls a Convex mutation to record purchase unlock against Clerk `tokenIdentifier`
4. Client sees unlock state reactively via Convex subscription

**State Management:**
- Server/async state: Convex reactive queries (replaces React Query in this stack)
- Local UI state: React `useState`
- Auth state: Clerk session (client) + `ctx.auth.getUserIdentity()` (server)

## Key Abstractions

**Convex Function Reference (`api` / `internal`):**
- Purpose: Type-safe pointers to backend functions — never pass function directly
- Examples: `api.myFunctions.listNumbers`, `api.myFunctions.addNumber`
- Pattern: File-based routing — `convex/myFunctions.ts` → `api.myFunctions.*`

**Document Types (`Doc<T>`, `Id<T>`):**
- Purpose: Full type safety for database documents and IDs
- Examples: `Doc<"numbers">`, `Id<"numbers">`
- Import from: `convex/_generated/dataModel`

**`cn()` utility:**
- Purpose: Merge Tailwind classes safely (resolves conflicts)
- Examples: `cn("base-class", condition && "conditional-class", className)`
- Location: `src/lib/utils.ts`

**shadcn Button with CVA:**
- Purpose: Variant-driven button with compile-time type safety
- Pattern: `cva()` defines variants; `buttonVariants({ variant, size })` generates className
- Location: `src/components/ui/button.tsx`

## Entry Points

**Next.js App Entry:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: HTML shell, Google Fonts loading, global CSS, RSC-compatible provider wrapping

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Landing page (currently placeholder scaffold)

**Convex Backend Entry:**
- Location: `convex/myFunctions.ts`
- Triggers: Called by frontend via Convex React SDK or by other Convex functions
- Responsibilities: Public queries (`listNumbers`), mutations (`addNumber`), actions (`myAction`)

**Convex Schema:**
- Location: `convex/schema.ts`
- Triggers: `npx convex dev` reads this to generate types and apply migrations
- Responsibilities: Defines all database tables and their field validators

## Architectural Constraints

- **Convex runtime:** Queries and mutations run in Convex's V8 runtime (no Node.js built-ins). Actions that need Node.js must declare `"use node";` and be in a separate file from queries/mutations.
- **Global state:** No module-level singletons in app code yet. Convex client is initialized once and injected via React context (planned via `ConvexProviderWithAuth`).
- **Circular imports:** No circular dependencies detected; `convex/_generated/` is the shared type boundary between frontend and backend.
- **Auth enforcement:** Auth identity is always derived server-side via `ctx.auth.getUserIdentity()`. Never accept user IDs as function arguments for authorization.
- **Generated files:** Never manually edit `convex/_generated/` — these are overwritten by `npx convex dev`.

## Anti-Patterns

### Passing userId as a Convex function argument for auth

**What happens:** Frontend passes `userId` string to a mutation/query as an argument to identify the user.
**Why it's wrong:** Any caller can forge the value — there is no server-side verification.
**Do this instead:** Call `ctx.auth.getUserIdentity()` inside the handler and use `identity.tokenIdentifier` as the canonical user key. See `convex/_generated/ai/guidelines.md`.

### Using plain `ConvexProvider` with Clerk auth

**What happens:** App wraps with `ConvexProvider` instead of `ConvexProviderWithAuth`.
**Why it's wrong:** Session tokens are never sent with requests — `ctx.auth.getUserIdentity()` always returns `null`.
**Do this instead:** Use `ConvexProviderWithAuth` with Clerk's `useAuth` hook passed as the `useAuth` prop.

### Calling `.collect()` for unbounded table scans

**What happens:** `ctx.db.query("numbers").collect()` is used to get all rows.
**Why it's wrong:** As the table grows this hits memory and performance limits.
**Do this instead:** Use `.take(n)` with a bound or `.paginate(args.paginationOpts)`. See `convex/_generated/ai/guidelines.md`.

## Error Handling

**Strategy:** Currently no centralized error boundary. Convex SDK surfaces errors via hook return values.

**Patterns:**
- Convex validators (`v.*`) enforce argument types at the function boundary — invalid calls throw before the handler runs
- Auth checks return `null` from `ctx.auth.getUserIdentity()` — handlers must null-check and return early or throw
- Actions calling external APIs should handle fetch failures explicitly and return structured error responses

## Cross-Cutting Concerns

**Logging:** `console.log` in Convex functions appears in the Convex dashboard log stream. No structured logging library in use.
**Validation:** Convex validator system (`v.number()`, `v.string()`, etc.) in `convex/myFunctions.ts` — all public functions must declare argument validators.
**Authentication:** Clerk (planned) — `@clerk/nextjs` installed, `convex/auth.config.ts` present but providers commented out pending Clerk app setup.

---

*Architecture analysis: 2026-05-03*
