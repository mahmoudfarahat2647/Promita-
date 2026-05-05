import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PromptsTable } from "@/components/admin/prompts-table";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Admin — Prompts</h1>
          <Link href="/admin/prompts/new">
            <Button className="bg-black text-white rounded-full px-5">+ New Prompt</Button>
          </Link>
        </div>
        <PromptsTable />
      </main>
    </>
  );
}
