"use client";
import { useState } from "react";
import { Copy, Check, Lock } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { buildCheckoutUrl } from "@/lib/gumroad";
import { track } from "@/lib/posthog";

interface UnlockButtonProps {
  promptId: Id<"prompts">;
  isFree: boolean;
  price: number;
  gumroadProductId?: string;
  promptText?: string;
}

export function UnlockButton({
  promptId,
  isFree,
  price,
  gumroadProductId,
  promptText,
}: UnlockButtonProps) {
  const { userId } = useAuth();
  const isUnlocked = useQuery(api.unlocks.getUnlockState, { promptId });
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!promptText) return;
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    track("prompt_copied", { promptId });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleUnlock() {
    if (!userId || !gumroadProductId) return;
    track("unlock_initiated", { promptId, price });
    const url = buildCheckoutUrl({
      gumroadProductId,
      clerkUserId: userId,
      promptId,
    });
    window.open(url, "_blank");
  }

  if (isFree || isUnlocked) {
    return (
      <Button
        onClick={handleCopy}
        className="w-full bg-black text-white hover:bg-black/80 rounded-full"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" /> Copy Prompt
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleUnlock}
      className="w-full bg-black text-white hover:bg-black/80 rounded-full"
    >
      <Lock className="w-4 h-4 mr-2" />
      Unlock for ${price.toFixed(2)}
    </Button>
  );
}
