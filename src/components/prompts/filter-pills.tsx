"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function FilterPills() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("tool") ?? "all";

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("tool");
    else params.set("tool", value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const pills = [
    { label: "All", value: "all" },
    { label: "ChatGPT", value: "chatgpt" },
    { label: "Gemini", value: "gemini" },
  ];

  return (
    <div className="flex gap-2">
      {pills.map((pill) => (
        <button
          key={pill.value}
          onClick={() => setFilter(pill.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
            active === pill.value
              ? "bg-white text-black border-white"
              : "bg-transparent text-[#666] border-[#333] hover:text-white hover:border-[#555]"
          )}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
