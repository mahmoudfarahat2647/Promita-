"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface PromptFormProps {
  initialData?: {
    id: Id<"prompts">;
    title: string;
    slug: string;
    description: string;
    promptText: string;
    aiTool: "chatgpt" | "gemini";
    isFree: boolean;
    price: number;
    gumroadProductId?: string;
    categoryId: Id<"categories">;
    subcategoryId: Id<"subcategories">;
    imageStorageId: Id<"_storage">;
  };
}

export function PromptForm({ initialData }: PromptFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const createPrompt = useMutation(api.admin.createPrompt);
  const updatePrompt = useMutation(api.admin.updatePrompt);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [promptText, setPromptText] = useState(initialData?.promptText ?? "");
  const [aiTool, setAiTool] = useState<"chatgpt" | "gemini">(initialData?.aiTool ?? "chatgpt");
  const [isFree, setIsFree] = useState(initialData?.isFree ?? true);
  const [price, setPrice] = useState(initialData?.price ?? 2.99);
  const [gumroadProductId, setGumroadProductId] = useState(initialData?.gumroadProductId ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let imageStorageId = initialData?.imageStorageId;

      if (fileRef.current?.files?.[0]) {
        const file = fileRef.current.files[0];
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        imageStorageId = storageId;
      }

      if (!imageStorageId) {
        alert("Please upload an image");
        setSaving(false);
        return;
      }

      if (initialData) {
        await updatePrompt({
          id: initialData.id,
          title,
          slug,
          description,
          promptText,
          aiTool,
          isFree,
          price,
          gumroadProductId: gumroadProductId || undefined,
          imageStorageId,
        });
      } else {
        await createPrompt({
          title,
          slug,
          description,
          promptText,
          aiTool,
          isFree,
          price,
          gumroadProductId: gumroadProductId || undefined,
          imageStorageId,
          categoryId: "" as any,
          subcategoryId: "" as any,
        });
      }
      router.push("/admin");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      {[
        { label: "Title", value: title, onChange: setTitle },
        { label: "Slug", value: slug, onChange: setSlug },
        { label: "Description", value: description, onChange: setDescription },
        { label: "Gumroad Product ID", value: gumroadProductId, onChange: setGumroadProductId },
      ].map(({ label, value, onChange }) => (
        <label key={label} className="flex flex-col gap-1 text-sm font-medium">
          {label}
          <input
            className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={label !== "Gumroad Product ID"}
          />
        </label>
      ))}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Prompt Text
        <textarea
          className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-black h-32 resize-y"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        AI Tool
        <select
          className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
          value={aiTool}
          onChange={(e) => setAiTool(e.target.value as "chatgpt" | "gemini")}
        >
          <option value="chatgpt">ChatGPT</option>
          <option value="gemini">Gemini</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
        Free prompt
      </label>

      {!isFree && (
        <label className="flex flex-col gap-1 text-sm font-medium">
          Price ($)
          <input
            type="number"
            step="0.01"
            className="border border-[#e8e4df] rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Watermarked Image
        <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
      </label>

      <Button type="submit" disabled={saving} className="bg-black text-white rounded-full w-fit px-6">
        {saving ? "Saving…" : initialData ? "Update Prompt" : "Create Prompt"}
      </Button>
    </form>
  );
}
