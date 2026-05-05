import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { FilterPills } from "@/components/prompts/filter-pills";
import { ListingPrompts } from "@/components/prompts/listing-prompts";

export const revalidate = 3600;

interface Props {
  params: { category: string; subcategory: string };
}

export async function generateMetadata({ params }: Props) {
  const sub = await fetchQuery(api.categories.getSubcategoryBySlug, {
    slug: params.subcategory,
  });
  if (!sub) return {};
  return {
    title: `${sub.name} Prompts — Promptita`,
    description: sub.description,
  };
}

export default async function ListingPage({ params }: Props) {
  const [category, subcategory] = await Promise.all([
    fetchQuery(api.categories.getBySlug, { slug: params.category }),
    fetchQuery(api.categories.getSubcategoryBySlug, {
      slug: params.subcategory,
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
      imageUrl:
        (await fetchQuery(api.prompts.getImageUrl, {
          storageId: p.imageStorageId,
        })) ?? "/placeholder.png",
    }))
  );

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <nav className="text-xs text-gray-400 mb-4">
          {category.name} / {subcategory.name}
        </nav>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">{subcategory.name}</h1>
          <FilterPills />
        </div>
        <p className="text-sm text-gray-500 mb-8">{subcategory.description}</p>
        <ListingPrompts prompts={prompts as any} />
      </main>
    </>
  );
}
