# Premium Dark Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a full Premium Dark visual polish to the Promptita homepage — new hero section, better cards, refined typography, polished sidebar/header.

**Architecture:** Targeted component upgrades. No routing, Convex query, or schema changes. One new file (`hero-section.tsx`); five existing files modified.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, shadcn/ui, Lucide icons, `cn()` from `src/lib/utils.ts`

---

## File Map

| File | Action |
|---|---|
| `src/components/layout/hero-section.tsx` | CREATE — compact banner hero |
| `src/app/page.tsx` | MODIFY — insert HeroSection, remove py-10, update h2 styles |
| `src/components/layout/header.tsx` | MODIFY — backdrop blur |
| `src/components/layout/sidebar.tsx` | MODIFY — logo, search pill, section label tracking |
| `src/components/categories/category-card.tsx` | MODIFY — ChevronRight → ›, icon border, hover tweaks |
| `src/components/prompts/prompt-card.tsx` | MODIFY — AI tool badge, border, radius, zoom speed |

---

### Task 1: Header — backdrop blur

**Files:**
- Modify: `src/components/layout/header.tsx`

- [ ] Change `bg-black` to `backdrop-blur-sm bg-black/80` in the header className

```tsx
// Before
<header className="h-14 border-b border-[#222] bg-black flex items-center ...">

// After
<header className="h-14 border-b border-[#222] backdrop-blur-sm bg-black/80 flex items-center ...">
```

- [ ] Commit: `git commit -m "style: add backdrop blur to sticky header"`

---

### Task 2: Sidebar — logo, search pill, section labels

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] Update logo className: `text-xl font-bold text-white` → `text-[22px] font-extrabold tracking-[-1px] italic text-white`

- [ ] Replace search link with pill-styled version:

```tsx
{/* Search link */}
<div className="py-1">
  <Link
    href="/search"
    className="flex items-center gap-2 bg-[#111] border border-[#1e1e1e] rounded-md px-3 py-2 mx-3 text-sm text-[#666] hover:text-white hover:border-[#2a2a2a] transition-colors"
  >
    <Search size={14} />
    <span>Search prompts</span>
  </Link>
</div>
```

- [ ] Update section label (category button) tracking and color: `tracking-widest text-[#444]` → `tracking-[2.5px] text-[#333]`

- [ ] Commit: `git commit -m "style: polish sidebar logo, search pill, section labels"`

---

### Task 3: Category card — ChevronRight → ›, icon border, hover tweaks

**Files:**
- Modify: `src/components/categories/category-card.tsx`

- [ ] Remove `ChevronRight` from import (keep other icons)
- [ ] Add `group` to the outer Link className
- [ ] Change card border: `border-[#222]` → `border-[#1e1e1e]`
- [ ] Change hover: `hover:border-[#444] hover:bg-[#1a1a1a]` → `hover:border-[#2e2e2e] hover:bg-[#141414]`
- [ ] Add `border border-[#222] group-hover:bg-[#222] transition-colors` to icon box
- [ ] Replace `<ChevronRight ...>` with `<span className="text-[#333] text-lg shrink-0">›</span>`

```tsx
import Link from "next/link";
import { Shirt, Image, MessageSquare, Camera, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

// ...iconMap unchanged...

export function CategoryCard({ name, parentName, icon, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 p-4 bg-[#111] border border-[#1e1e1e] rounded-xl",
        "hover:border-[#2e2e2e] hover:bg-[#141414] transition-colors duration-150"
      )}
    >
      <div className="p-2 rounded-lg bg-[#1a1a1a] border border-[#222] text-white shrink-0 group-hover:bg-[#222] transition-colors">
        {iconMap[icon] ?? <Shirt className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold tracking-[-0.1px] text-white truncate">{name}</p>
        <p className="text-xs text-[#666]">{parentName}</p>
      </div>
      <span className="text-[#333] text-lg shrink-0">›</span>
    </Link>
  );
}
```

- [ ] Commit: `git commit -m "style: polish category cards — icon border, hover, dimmed arrow"`

---

### Task 4: Prompt card — AI tool badge, border, radius, zoom speed

**Files:**
- Modify: `src/components/prompts/prompt-card.tsx`

- [ ] Card: `border-[#222]` → `border-[#1e1e1e]`, `rounded-[10px]` → `rounded-xl`
- [ ] Image zoom: `scale-105 duration-700` → `scale-[1.04] duration-500`
- [ ] Paid badge: add `backdrop-blur-sm bg-black/60` (free badge stays as-is)
- [ ] Like button: add `border border-[#2a2a2a]`
- [ ] AI tool badge: new top-right pill based on `prompt.aiTool`
- [ ] Card body: `gap-0.5` → `gap-1`, title `text-[14px]` → `text-[13px] tracking-[-0.1px]`, desc `text-[#666]` → `text-[#555]`

```tsx
{/* AI tool badge — top right */}
{prompt.aiTool && (
  <span className={cn(
    "absolute top-3 right-3 text-[8px] font-bold tracking-[0.5px] uppercase border rounded px-1.5 py-0.5 backdrop-blur-sm bg-black/60",
    prompt.aiTool === "chatgpt"
      ? "text-[#10a37f] border-[#10a37f]/30"
      : "text-[#4285f4] border-[#4285f4]/30"
  )}>
    {prompt.aiTool === "chatgpt" ? "GPT" : "Gemini"}
  </span>
)}
```

- [ ] Commit: `git commit -m "style: polish prompt cards — AI badge, border, radius, hover zoom"`

---

### Task 5: Create hero-section.tsx

**Files:**
- Create: `src/components/layout/hero-section.tsx`

- [ ] Create component:

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="border-b border-[#1a1a1a] bg-black -mx-6 px-8 py-8 flex gap-8 items-center">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-[#555] mb-3">
          Premium AI Prompts
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight leading-tight text-white mb-2">
          Prompts that sell.<br />
          <span className="text-[#444]">Designs that stand out.</span>
        </h1>
        <p className="text-[13px] text-[#666] leading-relaxed max-w-sm">
          Curated ChatGPT & Gemini prompts for print-on-demand sellers and marketers. Ready to use, instantly.
        </p>
      </div>
      {/* Right */}
      <div className="flex flex-col gap-3 w-[340px] shrink-0">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden focus-within:border-[#333] transition-colors"
        >
          <Search size={14} className="ml-3 text-[#444] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts, categories…"
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-[#3a3a3a] px-3 py-3"
          />
          <button
            type="submit"
            className="m-1 px-4 py-2 bg-white text-black text-[12px] font-bold rounded-md shrink-0 hover:bg-[#e5e5e5] transition-colors"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-white">2,400+</span>
            <span className="text-[11px] text-[#444]">Prompts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-white">12</span>
            <span className="text-[11px] text-[#444]">Categories</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-white">Free & Paid</span>
            <span className="text-[11px] text-[#444]">Plans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Commit: `git commit -m "feat: add HeroSection compact banner component"`

---

### Task 6: Homepage — insert HeroSection, update styles

**Files:**
- Modify: `src/app/page.tsx`

- [ ] Add `HeroSection` import
- [ ] Remove `py-10` from `<main>` className
- [ ] Insert `<HeroSection />` as first child of `<main>` (before categories section)
- [ ] Update all three `h2` elements: `text-xl font-bold` → `text-lg font-bold tracking-tight`

- [ ] Commit: `git commit -m "feat: insert hero section into homepage, refine section headings"`
