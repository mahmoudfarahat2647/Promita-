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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (promptData) {
      track("prompt_viewed", {
        promptId,
        isFree: promptData.isFree,
      });
    }
  }, [promptId, promptData]);

  if (!promptData) return null;

  const isLocked = !promptData.isFree && !promptText;
  const preview = promptText?.split("\n").slice(0, 2).join("\n") ?? "";
  const rest = promptText?.split("\n").slice(2).join("\n") ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-[#f0ece6] rounded-l-2xl overflow-hidden">
            {imageUrl && (
              <ImageViewer src={imageUrl} alt={promptData.title} />
            )}
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {promptData.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
                </p>
                <h2 className="text-xl font-bold text-black">
                  {promptData.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {promptData.description}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black ml-2 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="bg-black text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                {promptData.isFree ? "Free" : `$${promptData.price}`}
              </span>
              <span className="border border-[#e8e4df] text-xs px-3 py-1 rounded-full text-gray-600">
                {promptData.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
              </span>
            </div>

            <div className="bg-[#f9f7f4] rounded-xl p-4 font-mono text-sm relative overflow-hidden">
              <p className="whitespace-pre-wrap text-black">{preview}</p>
              {isLocked && rest && (
                <div className="relative mt-2">
                  <p className="whitespace-pre-wrap text-black blur-sm select-none">
                    {rest || "The rest of this prompt is hidden until unlocked."}
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                </div>
              )}
              {!isLocked && rest && (
                <p className="whitespace-pre-wrap text-black mt-2">{rest}</p>
              )}
            </div>

            <LikeButton promptId={promptId} likeCount={promptData.likeCount} />

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
    </div>
  );
}
