"use client";
import { useState } from "react";
import { PromptGrid } from "./prompt-grid";
import { PromptModal } from "./prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";
import type { PromptCardData } from "./prompt-card";

export function HomepagePrompts({ prompts }: { prompts: PromptCardData[] }) {
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);

  return (
    <>
      <PromptGrid prompts={prompts} onCardClick={(id) => setSelectedId(id as Id<"prompts">)} />
      {selectedId && (
        <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
