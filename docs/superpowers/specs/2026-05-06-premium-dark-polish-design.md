# Promptita — Premium Dark Visual Polish

**Date:** 2026-05-06  
**Scope:** Full frontend visual upgrade — hero, prompt cards, category cards, typography, sidebar & header  
**Approach:** Targeted component upgrades (no structural/routing changes)  
**Direction:** Premium Dark — deep blacks, refined depth, white accents, no color injection

---

## 1. Architecture

No changes to routing, data fetching, or Convex queries. All changes are confined to:

- `src/app/globals.css` — typography token tweaks, spacing scale
- `src/components/layout/header.tsx` — backdrop blur
- `src/components/layout/sidebar.tsx` — logo weight + search pill
- `src/components/categories/category-card.tsx` — count badge, icon border, hover lift
- `src/components/categories/category-grid.tsx` — grid density
- `src/components/prompts/prompt-card.tsx` — AI tool badge, backdrop overlays, hover zoom
- `src/app/page.tsx` — new `HeroSection` component inserted above category grid

One new file:
- `src/components/layout/hero-section.tsx` — compact banner hero (Option C)

---

## 2. Hero Section (new component)

**Layout:** Compact horizontal banner. Heading + eyebrow left, search bar + stat pills right.  
**Style:** `border-b border-[#1a1a1a]`, `bg-black`, `px-8 py-5`.

### Left column
- Eyebrow: `text-[10px] font-bold tracking-[2.5px] uppercase text-[#555]`
- Heading line 1: `text-2xl font-extrabold tracking-tight text-white`
- Heading line 2: same size, `text-[#444]` (faded)
- Subtitle: `text-[13px] text-[#666] leading-relaxed`

### Right column
- Search bar: `bg-[#111] border border-[#1e1e1e] rounded-lg` with icon left, white CTA button right
  - On submit: navigates to `/search?q=<value>`
- Stat pills below search: 2–3 stats (`2,400+ Prompts`, `12 Categories`, `Free & Paid`) — `text-[11px] text-[#444]` with white number

### No radial glow — Option C is clean/minimal, skip the decorative glow.

---

## 3. Prompt Cards (`prompt-card.tsx`)

### Image overlay changes
- **Free/price badge** (top-left): keep existing logic, add `backdrop-blur-sm bg-black/60` on paid variant
- **AI tool badge** (top-right, new): pill showing `GPT` or `Gemini` based on `prompt.aiTool`
  - `text-[8px] font-bold tracking-[0.5px] uppercase border rounded px-1.5 py-0.5`
  - ChatGPT: `text-[#10a37f] border-[#10a37f]/30 bg-black/60 backdrop-blur-sm`
  - Gemini: `text-[#4285f4] border-[#4285f4]/30 bg-black/60 backdrop-blur-sm`
- **Like button** (bottom-right): add `backdrop-blur-sm border border-[#2a2a2a]` to existing button

### Hover states
- Card: no transform on card itself
- Image inner div: `group-hover:scale-[1.04] transition-transform duration-500 ease-out` (currently 1.05/700ms — tighten)

### Structural
- Border: `border-[#1e1e1e]` (was `#222`) — subtler
- Radius: `rounded-xl` (was `rounded-[10px]`) — 12px
- Card body padding: `p-4` stays, add `gap-1` between title and desc

---

## 4. Category Cards (`category-card.tsx`)

- **Remove** `<ChevronRight>` from right side — replace with a subtler `›` text char styled `text-[#333]`
- **Icon box**: add `border border-[#222]` + `group-hover:bg-[#222] transition-colors`
- **Card border**: `border-[#1e1e1e]` (was `#222`)
- **Hover**: `hover:border-[#2e2e2e] hover:bg-[#141414]` (was `#444`/`#1a1a1a` — tone down)

### No prompt count
The Convex `categories.listAll` query does not return a prompt count per subcategory, and adding it would require a schema change (out of scope). The chevron is replaced with a dimmed `›` instead of a count badge.

---

## 5. Typography & Spacing (`globals.css` + components)

### Token additions to `globals.css`
```css
/* No new CSS variables needed — use Tailwind utilities directly */
```

### Applied changes across components
| Element | Before | After |
|---|---|---|
| Section headings (`h2`) | `text-xl font-bold` | `text-lg font-bold tracking-tight` |
| Section eyebrow labels | none | `text-[10px] font-bold tracking-[2.5px] uppercase text-[#555]` |
| Card titles | `text-[14px] font-bold` | `text-[13px] font-bold tracking-[-0.1px]` |
| Card descriptions | `text-[12px] text-[#666]` | `text-[12px] text-[#555]` (slightly lighter) |
| Category names | `text-sm font-semibold` | `text-[13px] font-semibold tracking-[-0.1px]` |

---

## 6. Sidebar (`sidebar.tsx`)

- **Logo**: `text-[22px] font-extrabold tracking-[-1px] italic` (was `text-xl font-bold`)
- **Search link**: wrap in a pill-style container — `bg-[#111] border border-[#1e1e1e] rounded-md px-3 py-2 mx-3 my-2` with `Search` icon already present
- **Section labels**: `tracking-[2.5px]` (was default), `text-[#333]` (was `#444`)
- **Active item**: keep `bg-white text-black` — already correct

---

## 7. Header (`header.tsx`)

- Add `backdrop-blur-sm bg-black/80` to the sticky header (was `bg-black`)
- This makes it read cleanly when scrolling over the hero section

---

## 8. Homepage (`page.tsx`)

Insert `<HeroSection />` as the first child of `<main>`, above the categories `<section>`. The hero uses full-width padding internally (`px-8 py-5`) so it sits flush against the shell edges:

```tsx
<main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
  <HeroSection />   {/* new — handles own padding */}
  <section>         {/* categories — unchanged */}
  ...
```

Remove `py-10` from `<main>` — the hero handles top spacing, and `gap-12` handles spacing between subsequent sections.

---

## 9. Error Handling & Edge Cases

- Hero search: if query is empty, do nothing (no navigation)
- AI tool badge: if `prompt.aiTool` is undefined/unknown, render nothing (no badge)
- Category count: if `count` prop is 0 or undefined, hide the count (don't show "0")
- Image fallback: no change — existing Unsplash fallback stays

---

## 10. What Is NOT in Scope

- No changes to search page, listing page, dashboard, or admin
- No new Convex queries or mutations
- No authentication changes
- No color introduction (stays black & white)
- No mobile-specific layout overhaul (responsive behavior inherited from existing grid)
