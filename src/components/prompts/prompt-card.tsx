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
      className="bg-[#f9f7f4] border border-[#e8e4df] rounded-xl overflow-hidden cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow"
      onClick={() => onClick(prompt._id)}
    >
      <div className="relative aspect-[4/3] bg-[#f0ece6]">
        <ImageViewer src={prompt.imageUrl} alt={prompt.title} />
        <span className="absolute top-2 left-2 bg-black text-white text-[11px] font-medium uppercase tracking-wide px-2.5 py-0.5 rounded-full">
          {prompt.isFree ? "FREE" : `$${prompt.price.toFixed(2)}`}
        </span>
        <button
          className="absolute bottom-2 right-2 flex items-center gap-1 text-sm"
          onClick={handleLike}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              liked ? "fill-black text-black" : "text-black"
            )}
          />
          <span className="text-black text-xs font-medium">{likes}</span>
        </button>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-black truncate">{prompt.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{prompt.description}</p>
      </div>
    </div>
  );
}
