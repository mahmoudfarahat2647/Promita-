import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { ImageViewer } from "@/components/prompts/image-viewer";

export const revalidate = 3600;

interface Props {
  params: { category: string; subcategory: string; slug: string };
}

export async function generateStaticParams() {
  const prompts = await fetchQuery(api.prompts.getAllPublishedSlugs, {});
  return prompts.map((p: (typeof prompts)[number]) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const prompt = await fetchQuery(api.prompts.getBySlug, { slug: params.slug });
  if (!prompt) return {};
  return {
    title: `${prompt.title} — Promptita`,
    description: prompt.description,
    openGraph: { title: prompt.title, description: prompt.description },
  };
}

export default async function PromptPage({ params }: Props) {
  const prompt = await fetchQuery(api.prompts.getBySlug, { slug: params.slug });
  if (!prompt) notFound();

  const imageUrl = await fetchQuery(api.prompts.getImageUrl, {
    storageId: prompt.imageStorageId,
  });

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="aspect-video bg-[#f0ece6] rounded-xl overflow-hidden mb-6">
          {imageUrl && <ImageViewer src={imageUrl} alt={prompt.title} />}
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">{prompt.title}</h1>
        <p className="text-gray-500 mb-4">{prompt.description}</p>
        <div className="flex gap-2">
          <span className="bg-black text-white text-xs px-3 py-1 rounded-full uppercase">
            {prompt.isFree ? "Free" : `$${prompt.price}`}
          </span>
          <span className="border border-[#e8e4df] text-xs px-3 py-1 rounded-full text-gray-500">
            {prompt.aiTool === "chatgpt" ? "ChatGPT" : "Gemini"}
          </span>
        </div>
      </main>
    </>
  );
}
