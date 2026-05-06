import { PromptForm } from "@/components/admin/prompt-form";

export default function NewPromptPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">New Prompt</h1>
      <PromptForm />
    </main>
  );
}
