<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

<!-- BEGIN:style-agent-rules -->
# Styling and UI rules

Use Tailwind CSS v4 and shadcn/ui as the default styling system for all
frontend work.

- Prefer existing shadcn/ui components from `src/components/ui/` before
  creating custom markup.
- Add new primitives through the shadcn CLI so generated code follows
  `components.json` (`radix-nova`, RSC enabled, Tailwind CSS variables,
  lucide icons).
- Use Tailwind utility classes for layout and spacing; use `gap-*` instead of
  `space-x-*` / `space-y-*`.
- Use semantic design tokens (`bg-background`, `text-foreground`,
  `text-muted-foreground`, `bg-primary`, `text-primary-foreground`,
  `text-destructive`) instead of raw color utilities.
- Use shadcn component variants before overriding styles with `className`.
- Use `cn()` from `src/lib/utils.ts` for conditional class composition.
- Keep theme-level customizations in `src/app/globals.css`; do not create
  parallel global CSS files.
- For icons, use the configured shadcn icon library (`lucide`) and the
  shadcn icon conventions for buttons and menus.

Use relevant installed skills for higher-quality work: shadcn for UI and
styling, Convex skills for backend/schema/auth work, Clerk skills for auth,
and the Next.js docs rule above for App Router changes.
<!-- END:style-agent-rules -->
