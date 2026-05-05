"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PurchaseHistoryTab() {
  const purchases = useQuery(api.purchases.getUserPurchases, {});

  if (!purchases) return <p className="text-sm text-gray-400">Loading…</p>;
  if (purchases.length === 0)
    return <p className="text-sm text-gray-400">No purchases yet.</p>;

  return (
    <div className="border border-[#e8e4df] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#f9f7f4]">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-black">Item</th>
            <th className="text-left px-4 py-3 font-medium text-black">Date</th>
            <th className="text-left px-4 py-3 font-medium text-black">Amount</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p: (typeof purchases)[number]) => (
            <tr key={p._id} className="border-t border-[#e8e4df]">
              <td className="px-4 py-3 text-gray-700 capitalize">
                {p.type === "pack" ? "Category Pack" : "Single Prompt"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-700">${p.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
