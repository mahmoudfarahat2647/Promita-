import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { ImageViewer } from "@/components/prompts/image-viewer";

export const revalidate = 3600;

interface Props {
  params: Promise<{ category: string; subcategory: string; slug: string }>;
}

export async function generateStaticParams() {
  const prompts = await fetchQuery(api.prompts.getAllPublishedSlugs, {});
  return prompts.map((p: (typeof prompts)[number]) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const prompt = await fetchQuery(api.prompts.getBySlug, { slug: resolvedParams.slug });
  if (!prompt) return {};
  return {
    title: `${prompt.title} — Promptita`,
    description: prompt.description,
    openGraph: { title: prompt.title, description: prompt.description },
  };
}

export default async function PromptPage({ params }: Props) {
  const resolvedParams = await params;
  const prompt = await fetchQuery(api.prompts.getBySlug, { slug: resolvedParams.slug });
  if (!prompt) notFound();

  const imageUrl = await fetchQuery(api.prompts.getImageUrl, {
    storageId: prompt.imageStorageId,
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="aspect-video bg-[#0a0a0a] rounded-xl overflow-hidden mb-6">
        {imageUrl && <ImageViewer src={imageUrl} alt={prompt.title} />}
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">{prompt.title}</h1>
      <p className="text-[#666] mb-4">{prompt.description}</p>
      <div className="flex gap-2">
        <span className={`text-xs px-3 py-1 rounded-full uppercase font-medium ${prompt.isFree ? "bg-white text-black" : "bg-black text-white border border-[#333]"}`}>
          {prompt.isFree ? "Free" : `$${prompt.price}`}
        </span>
        <span className="border border-[#333] text-xs px-3 py-1 rounded-full text-[#666]">
          {prompt.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
        </span>
      </div>
    </main>
  );
}
