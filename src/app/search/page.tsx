"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useState, Suspense } from "react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { PromptModal } from "@/components/prompts/prompt-modal";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { Id } from "../../../convex/_generated/dataModel";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);
  const results = useQuery(api.search.searchPrompts, { q });

  return (
    <>
      <h1 className="text-xl font-bold text-black mb-2">
        {q ? `Results for "${q}"` : "Search Prompts"}
      </h1>
      {results === undefined && (
        <p className="text-gray-400 text-sm">Searching…</p>
      )}
      {results?.length === 0 && (
        <p className="text-gray-400 text-sm">No prompts found for "{q}"</p>
      )}
      {results && results.length > 0 && (
        <PromptGrid
          prompts={results.map((p: any) => ({ ...p, imageUrl: "/placeholder.png" }))}
          onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
        />
      )}
      {selectedId && (
        <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <Suspense fallback={<p className="text-gray-400 text-sm">Loading search...</p>}>
          <SearchContent />
        </Suspense>
      </main>
    </>
  );
}
