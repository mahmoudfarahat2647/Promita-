"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PurchaseHistoryTab() {
  const purchases = useQuery(api.purchases.getUserPurchases, {});

  if (!purchases) return <p className="text-sm text-[#666]">Loading…</p>;
  if (purchases.length === 0)
    return <p className="text-sm text-[#666]">No purchases yet.</p>;

  return (
    <div className="border border-[#222] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#111]">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-[#666] text-xs uppercase tracking-wide">Item</th>
            <th className="text-left px-4 py-3 font-medium text-[#666] text-xs uppercase tracking-wide">Date</th>
            <th className="text-left px-4 py-3 font-medium text-[#666] text-xs uppercase tracking-wide">Amount</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p: (typeof purchases)[number]) => (
            <tr key={p._id} className="border-t border-[#222]">
              <td className="px-4 py-3 text-[#ccc] capitalize">
                {p.type === "pack" ? "Category Pack" : "Single Prompt"}
              </td>
              <td className="px-4 py-3 text-[#666]">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-[#ccc]">${p.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
