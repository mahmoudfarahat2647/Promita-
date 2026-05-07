import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { FilterPills } from "@/components/prompts/filter-pills";
import { ListingPrompts } from "@/components/prompts/listing-prompts";

export const revalidate = 3600;

interface Props {
  params: Promise<{ category: string; subcategory: string }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const sub = await fetchQuery(api.categories.getSubcategoryBySlug, {
    slug: resolvedParams.subcategory,
  });
  if (!sub) return {};
  return {
    title: `${sub.name} Prompts — Promptita`,
    description: sub.description,
  };
}

export default async function ListingPage({ params }: Props) {
  const resolvedParams = await params;
  const [category, subcategory] = await Promise.all([
    fetchQuery(api.categories.getBySlug, { slug: resolvedParams.category }),
    fetchQuery(api.categories.getSubcategoryBySlug, {
      slug: resolvedParams.subcategory,
    }),
  ]);
  if (!category || !subcategory) notFound();

  const { page: promptsRaw } = await fetchQuery(
    api.prompts.listBySubcategory,
    {
      subcategoryId: subcategory._id,
      paginationOpts: { numItems: 20, cursor: null },
    }
  );

  const prompts = await Promise.all(
    promptsRaw.map(async (p: (typeof promptsRaw)[number]) => ({
      ...p,
      imageUrl: p.imageStorageId
        ? await fetchQuery(api.prompts.getImageUrl, { storageId: p.imageStorageId })
        : "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=80",
    }))
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 w-full">
      <nav className="text-xs text-[#666] mb-4">
        {category.name} / {subcategory.name}
      </nav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{subcategory.name}</h1>
        <FilterPills />
      </div>
      <p className="text-sm text-[#666] mb-8">{subcategory.description}</p>
      <ListingPrompts prompts={prompts as any} />
    </main>
  );
}
