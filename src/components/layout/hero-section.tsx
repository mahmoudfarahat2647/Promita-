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
      {/* Left column */}
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
      {/* Right column */}
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
