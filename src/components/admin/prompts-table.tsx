"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PromptsTable() {
  const prompts = useQuery(api.admin.listAll, {});
  const togglePublished = useMutation(api.admin.togglePublished);
  const deletePrompt = useMutation(api.admin.deletePrompt);

  if (!prompts) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div className="border border-[#e8e4df] rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#f9f7f4]">
          <tr>
            {["Title", "AI Tool", "Price", "Published", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 font-medium text-black">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prompts.map((p: (typeof prompts)[number]) => (
            <tr key={p._id} className="border-t border-[#e8e4df]">
              <td className="px-4 py-3 font-medium text-black">{p.title}</td>
              <td className="px-4 py-3 text-gray-500 uppercase text-xs">{p.aiTool}</td>
              <td className="px-4 py-3 text-gray-500">{p.isFree ? "Free" : `$${p.price}`}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => togglePublished({ id: p._id as Id<"prompts">, isPublished: !p.isPublished })}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.isPublished ? "bg-black text-white" : "bg-[#f9f7f4] text-gray-500 border border-[#e8e4df]"}`}
                >
                  {p.isPublished ? "Live" : "Draft"}
                </button>
              </td>
              <td className="px-4 py-3 flex gap-2">
                <Link href={`/admin/prompts/${p._id}/edit`}>
                  <Button size="sm" variant="outline" className="rounded-full text-xs">Edit</Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs text-red-500 border-red-200"
                  onClick={() => { if (confirm("Delete this prompt?")) deletePrompt({ id: p._id as Id<"prompts"> }); }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
