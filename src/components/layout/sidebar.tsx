"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./shell";

export function Sidebar() {
  const { isOpen } = useSidebar();
  const pathname = usePathname();
  const categories = useQuery(api.categories.listAll);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleSection(slug: string) {
    setCollapsed((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 w-[220px] bg-black border-r border-[#222] flex flex-col z-50",
        "transition-transform duration-200 ease-in-out",
        // mobile: slide in/out; desktop: always visible
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#222]">
        <Link
          href="/"
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-dancing)" }}
        >
          promptita
        </Link>
      </div>

      {/* Search link */}
      <div className="px-3 py-2 border-b border-[#222]">
        <Link
          href="/search"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <Search size={14} />
          <span>Search prompts</span>
        </Link>
      </div>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto py-2">
        {categories === undefined && (
          <p className="px-4 py-2 text-xs text-[#444]">Loading…</p>
        )}
        {categories?.map((cat) => {
          const isCollapsed = collapsed[cat.slug];
          return (
            <div key={cat._id}>
              <button
                onClick={() => toggleSection(cat.slug)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#444] hover:text-[#666] transition-colors"
              >
                <span>{cat.name}</span>
                <ChevronDown
                  size={12}
                  className={cn(
                    "transition-transform duration-150",
                    isCollapsed && "-rotate-90"
                  )}
                />
              </button>
              {!isCollapsed && (
                <div className="pb-1">
                  {cat.subcategories.map((sub) => {
                    const href = `/prompts/${cat.slug}/${sub.slug}`;
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={sub._id}
                        href={href}
                        className={cn(
                          "block mx-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-white text-black font-medium"
                            : "text-[#666] hover:text-white hover:bg-[#1a1a1a]"
                        )}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
