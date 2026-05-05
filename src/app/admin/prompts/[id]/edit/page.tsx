import { Header } from "@/components/layout/header";
import { PromptForm } from "@/components/admin/prompt-form";

export default function EditPromptPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-black mb-6">Edit Prompt</h1>
        <PromptForm />
      </main>
    </>
  );
}
