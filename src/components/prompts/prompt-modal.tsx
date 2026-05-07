"use client";
import { useEffect } from "react";
import { X, Lock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ImageViewer } from "./image-viewer";
import { LikeButton } from "./like-button";
import { UnlockButton } from "./unlock-button";
import { track } from "@/lib/posthog";

interface PromptModalProps {
  promptId: Id<"prompts">;
  onClose: () => void;
}

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function PromptModal({ promptId, onClose }: PromptModalProps) {
  const promptData = useQuery(api.prompts.getById, { id: promptId });
  const promptText = useQuery(api.prompts.getPromptText, { promptId });
  const imageUrl = useQuery(
    api.prompts.getImageUrl,
    promptData?.imageStorageId
      ? { storageId: promptData.imageStorageId }
      : "skip"
  );

  useEffect(() => {
    if (promptData) {
      track("prompt_viewed", {
        promptId,
        isFree: promptData.isFree,
      });
    }
  }, [promptId, promptData]);

  if (!promptData) return null;

  // Simple blur logic for MVP. If it's paid and we don't have text, blur the rest.
  // Assuming 'promptText' only returns full text if unlocked. Otherwise, we might only get a preview from the backend.
  // Wait, if it's locked, 'promptText' might be null. The current logic uses 'preview' and 'rest' based on 'promptText'.
  // If 'promptText' is null, we should show a placeholder or the promptData description as preview.
  
  // Actually, let's just show a locked state if promptText is missing and it's not free.
  const isLocked = !promptData.isFree && !promptText;
  
  // If we have text, use it. Otherwise use description as preview.
  const displayPreview = promptText ? promptText.split("\n").slice(0, 2).join("\n") : promptData.description;
  const displayRest = promptText ? promptText.split("\n").slice(2).join("\n") : "The rest of this prompt is hidden until unlocked. Purchase to reveal the exact instructions, variables, and parameters used to generate this result.";

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#111] rounded-xl border border-[#333] gap-0">
        <DialogTitle className="sr-only">{promptData.title}</DialogTitle>
        <DialogDescription className="sr-only">{promptData.description}</DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side: Image */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-[#0a0a0a] overflow-hidden">
            {imageUrl && (
              <ImageViewer src={imageUrl} alt={promptData.title} className="object-cover w-full h-full" />
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${promptData.isFree ? "bg-white text-black" : "bg-black text-white border border-[#333]"}`}>
                {promptData.isFree ? "FREE" : `$${promptData.price.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="p-8 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#666] uppercase tracking-wider">
                  {promptData.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
                </span>
                <LikeButton promptId={promptId} likeCount={promptData.likeCount} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {promptData.title}
              </h2>
              <p className="text-[14px] text-[#666] leading-relaxed">
                {promptData.description}
              </p>
            </div>

            {/* Prompt Text Area */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-5 font-mono text-[13px] leading-relaxed relative overflow-hidden flex-grow">
              <p className="whitespace-pre-wrap text-[#999]">{displayPreview}</p>

              {isLocked ? (
                <div className="relative mt-2">
                  <div className="whitespace-pre-wrap text-[#999] blur-[6px] select-none opacity-40">
                    {displayRest}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[13px] font-semibold text-white bg-[#0a0a0a]/90 border border-[#333] px-4 py-1.5 rounded-full backdrop-blur-md">
                      Unlock to view full prompt
                    </span>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-[#999] mt-2">{displayRest}</p>
              )}
            </div>

            <div className="pt-2">
              <UnlockButton
                promptId={promptId}
                isFree={promptData.isFree}
                price={promptData.price}
                gumroadProductId={promptData.gumroadProductId}
                promptText={promptText ?? undefined}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
