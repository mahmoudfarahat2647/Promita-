"use client";
import Link from "next/link";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";

export function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="w-full bg-white border-b border-[#e8e4df] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col shrink-0">
          <div className="flex items-center gap-1">
            <span
              className="text-[22px] text-black leading-none"
              style={{ fontFamily: "var(--font-dancing)" }}
            >
              Promptita
            </span>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="text-[11px] text-gray-400 leading-none mt-0.5">
            AI Prompts for POD &amp; Marketing
          </span>
        </Link>

        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        <div className="shrink-0">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <Button
                className="rounded-full bg-black text-white hover:bg-black/80 px-5 text-sm"
                size="sm"
              >
                Sign In
              </Button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
    </header>
  );
}
