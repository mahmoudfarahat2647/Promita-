"use client";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { useSidebar } from "./shell";

export function Header() {
  const { toggle } = useSidebar();
  const { isSignedIn } = useAuth();

  return (
    <header className="h-14 border-b border-[#222] bg-black flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="lg:hidden text-[#666] hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm text-[#666]">AI Prompts for POD &amp; Marketing</span>
      </div>

      <div>
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button className="border border-[#333] text-white text-sm px-3 py-1.5 rounded-lg bg-transparent hover:bg-[#111] transition-colors">
              Sign in
            </button>
          </SignInButton>
        ) : (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        )}
      </div>
    </header>
  );
}
