"use client";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { PromptModal } from "@/components/prompts/prompt-modal";
import { Id } from "../../../convex/_generated/dataModel";

export function UnlockedTab() {
  const unlocked = useQuery(api.unlocks.getUserUnlocks, {});
  const [selectedId, setSelectedId] = useState<Id<"prompts"> | null>(null);

  if (!unlocked) return <p className="text-sm text-[#666]">Loading…</p>;
  if (unlocked.length === 0)
    return <p className="text-sm text-[#666]">No unlocked prompts yet.</p>;

  return (
    <>
      <PromptGrid
        prompts={unlocked.map((p: any) => ({ ...p, imageUrl: "/placeholder.png" }))}
        onCardClick={(id) => setSelectedId(id as Id<"prompts">)}
      />
      {selectedId && (
        <PromptModal promptId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
