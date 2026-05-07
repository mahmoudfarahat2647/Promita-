"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageViewer } from "./image-viewer";

export interface PromptCardData {
  _id: string;
  title: string;
  description: string;
  isFree: boolean;
  price: number;
  likeCount: number;
  imageUrl: string;
  aiTool: "chatgpt" | "gemini";
}

interface PromptCardProps {
  prompt: PromptCardData;
  onClick: (id: string) => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const [likes, setLikes] = useState(prompt.likeCount);
  const [liked, setLiked] = useState(false);

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  }

  return (
    <div
      className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden cursor-pointer hover-lift-shadow group flex flex-col"
      onClick={() => onClick(prompt._id)}
    >
      <div className="relative aspect-[4/5] bg-[#1a1a1a] overflow-hidden">
        <ImageViewer
          src={prompt.imageUrl}
          alt={prompt.title}
          className="group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />
        {/* Free/price badge — top left */}
        <span className={cn(
          "absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full",
          prompt.isFree
            ? "bg-white text-black"
            : "backdrop-blur-sm bg-black/60 text-white border border-[#333]"
        )}>
          {prompt.isFree ? "FREE" : `$${prompt.price.toFixed(2)}`}
        </span>
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
        {/* Like button — bottom right */}
        <button
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-[#2a2a2a] px-2.5 py-1 rounded-full transition-colors"
          onClick={handleLike}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              liked ? "fill-red-500 text-red-500" : "text-[#999] fill-none"
            )}
          />
          <span className={cn("text-xs font-medium", liked ? "text-red-500" : "text-[#999]")}>{likes}</span>
        </button>
      </div>
      <div className="p-4 flex flex-col gap-1">
        <p className="text-[13px] font-bold tracking-[-0.1px] text-white truncate">{prompt.title}</p>
        <p className="text-[12px] text-[#555] truncate">{prompt.description}</p>
      </div>
    </div>
  );
}
