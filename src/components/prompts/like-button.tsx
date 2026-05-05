"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  promptId: Id<"prompts">;
  likeCount: number;
}

export function LikeButton({ promptId, likeCount }: LikeButtonProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [pendingLike, setPendingLike] = useState(false);
  const liked = useQuery(api.likes.getLikeState, { promptId });
  const toggleLike = useMutation(api.likes.toggleLike);

  useEffect(() => {
    if (isSignedIn && pendingLike) {
      setPendingLike(false);
      toggleLike({ promptId });
    }
  }, [isSignedIn, pendingLike, promptId, toggleLike]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isSignedIn) {
      setPendingLike(true);
      openSignIn();
      return;
    }
    toggleLike({ promptId });
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-sm"
      aria-label="Like prompt"
    >
      <Heart
        className={cn(
          "w-4 h-4",
          liked ? "fill-black text-black" : "text-black"
        )}
      />
      <span className="text-xs font-medium">{likeCount}</span>
    </button>
  );
}
