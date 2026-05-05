"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PromptGrid } from "./prompt-grid";
import { PromptModal } from "./prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";
import type { PromptCardData } from "./prompt-card";

export function ListingPrompts({ prompts }: { prompts: PromptCardData[] }) {
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);
  const searchParams = useSearchParams();
  const tool = searchParams.get("tool");

  const filtered = tool
    ? prompts.filter((p) => p.aiTool === tool)
    : prompts;

  return (
    <>
      <PromptGrid
        prompts={filtered}
        onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
      />
      {selectedId && (
        <PromptModal
          promptId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
