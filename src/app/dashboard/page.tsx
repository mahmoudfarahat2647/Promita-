"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { UnlockedTab } from "@/components/dashboard/unlocked-tab";
import { BookmarksTab } from "@/components/dashboard/bookmarks-tab";
import { PurchaseHistoryTab } from "@/components/dashboard/purchase-history-tab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "unlocked", label: "Unlocked Prompts" },
  { id: "bookmarks", label: "Bookmarks" },
  { id: "history", label: "Purchase History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("unlocked");

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <h1 className="text-2xl font-bold text-black mb-6">Dashboard</h1>
        <div className="flex gap-1 border-b border-[#e8e4df] mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "unlocked" && <UnlockedTab />}
        {activeTab === "bookmarks" && <BookmarksTab />}
        {activeTab === "history" && <PurchaseHistoryTab />}
      </main>
    </>
  );
}
