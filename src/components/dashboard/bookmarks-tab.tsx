"use client";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { PromptModal } from "@/components/prompts/prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";

export function BookmarksTab() {
  const bookmarks = useQuery(api.bookmarks.getBookmarks, {});
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);

  if (!bookmarks) return <p className="text-sm text-gray-400">Loading…</p>;
  if (bookmarks.length === 0)
    return <p className="text-sm text-gray-400">No bookmarks yet.</p>;

  return (
    <>
      <PromptGrid
        prompts={bookmarks.map((p: any) => ({ ...p, imageUrl: "/placeholder.png" }))}
        onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
      />
      {selectedId && (
        <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
