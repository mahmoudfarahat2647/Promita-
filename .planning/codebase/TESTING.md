# Testing Patterns

**Analysis Date:** 2026-05-03

## Test Framework

**Runner:**
- Not configured — no test runner detected in `package.json` dependencies or devDependencies
- No `jest.config.*`, `vitest.config.*`, or `playwright.config.*` files present
- No test scripts in `package.json` (`scripts` contains only `dev`, `build`, `start`, `lint`)

**Assertion Library:**
- Not applicable — no test framework installed

**Run Commands:**
```bash
# No test commands currently configured
# To add Vitest (recommended for Next.js + Convex):
# npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
# To add Jest:
# npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
```

## Test File Organization

**Location:**
- No test files exist in the codebase
- No `__tests__` directories or `*.test.*` / `*.spec.*` files found anywhere under `src/` or `convex/`

**Naming:**
- Not established — no convention to follow yet

**Structure:**
- Not established

## Test Structure

**Suite Organization:**
- Not established — no tests written yet

**Patterns:**
- No setup, teardown, or assertion patterns observed

## Mocking

**Framework:**
- Not configured

**Patterns:**
- Not established

**Convex Testing Note:**
- Convex provides a testing library (`convex-test`) for unit-testing queries, mutations, and actions
- Install: `npm install --save-dev convex-test`
- Use `convexTest()` to create an in-memory Convex environment for function tests
- Example pattern (to adopt):

```typescript
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

test("listNumbers returns numbers", async () => {
  const t = convexTest(schema);
  await t.mutation(api.myFunctions.addNumber, { value: 42 });
  const result = await t.query(api.myFunctions.listNumbers, { count: 10 });
  expect(result.numbers).toEqual([42]);
});
```

**What to Mock:**
- External HTTP calls in Convex actions (fetch calls to third-party APIs)
- Clerk auth identity — `ctx.auth.getUserIdentity()` in Convex function tests
- Next.js `next/navigation` hooks in client component tests

**What NOT to Mock:**
- Convex database operations — use `convex-test` in-memory runtime instead
- Tailwind class merging — `cn()` utility tests should use real implementation

## Fixtures and Factories

**Test Data:**
- Not established

**Location:**
- No fixtures directory exists

## Coverage

**Requirements:** None enforced — no coverage tooling configured

**View Coverage:**
```bash
# With Vitest (once configured):
npx vitest run --coverage
```

## Test Types

**Unit Tests:**
- Not written — no test files present
- Recommended scope: Convex queries/mutations/actions via `convex-test`, utility functions in `src/lib/`

**Integration Tests:**
- Not written
- Recommended scope: Next.js API routes and page rendering with `@testing-library/react`

**E2E Tests:**
- Not configured — no Playwright or Cypress setup detected
- Recommended: Playwright for full user-flow testing

## Clerk Testing Skill

The `.agents/skills/clerk-testing` skill is available for Clerk auth test patterns.
Key patterns from that skill apply when testing authenticated routes:
- Use Clerk's test helpers to mock auth state in component tests
- Server component tests must mock `auth()` from `@clerk/nextjs/server`
- Client component tests must mock `useAuth()` hook from `@clerk/nextjs`

## Recommended Setup (When Tests Are Added)

**Vitest + React Testing Library** is the recommended stack for this project:

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom \
  convex-test
```

**vitest.config.ts** (place at repo root):
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Proposed file layout:**
```
src/
  test/
    setup.ts          # Global test setup (jest-dom imports)
  components/
    ui/
      button.test.tsx # Co-located with component
  lib/
    utils.test.ts     # Co-located with util
convex/
  myFunctions.test.ts # Co-located with Convex functions
```

**package.json test scripts to add:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Common Patterns (To Adopt)

**Async Testing (Convex):**
```typescript
import { convexTest } from "convex-test";
import { expect, test } from "vitest";

test("mutation inserts document", async () => {
  const t = convexTest(schema);
  await t.mutation(api.myFunctions.addNumber, { value: 7 });
  const result = await t.query(api.myFunctions.listNumbers, { count: 1 });
  expect(result.numbers).toContain(7);
});
```

**Error Testing:**
```typescript
import { expect, test } from "vitest";

test("cn merges class names correctly", () => {
  expect(cn("px-2", "px-4")).toBe("px-4"); // tailwind-merge deduplication
});

test("cn handles conditional classes", () => {
  expect(cn("base", false && "excluded", "included")).toBe("base included");
});
```

**Component Testing:**
```typescript
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

test("renders button with text", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
});
```

---

*Testing analysis: 2026-05-03*
