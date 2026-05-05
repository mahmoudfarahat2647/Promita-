import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { CategoryGrid } from "@/components/categories/category-grid";
import { HomepagePrompts } from "@/components/prompts/homepage-prompts";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, featuredRaw, freeRaw] = await Promise.all([
    fetchQuery(api.categories.listAll, {}),
    fetchQuery(api.prompts.getFeatured, {}),
    fetchQuery(api.prompts.getFree, {}),
  ]);

  const withUrls = async (prompts: typeof featuredRaw) =>
    Promise.all(
      prompts.map(async (p: (typeof featuredRaw)[number]) => ({
        ...p,
        imageUrl:
          (await fetchQuery(api.prompts.getImageUrl, {
            storageId: p.imageStorageId,
          })) ?? "/placeholder.png",
      }))
    );

  const [featured, free] = await Promise.all([
    withUrls(featuredRaw),
    withUrls(freeRaw),
  ]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex flex-col gap-12">
        <section>
          <h2 className="text-xl font-bold text-black mb-6">
            Browse Categories
          </h2>
          <CategoryGrid categories={categories as any} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Featured Prompts</h2>
            <a href="/search" className="text-sm text-gray-500 hover:text-black flex items-center gap-1">
              View all →
            </a>
          </div>
          <HomepagePrompts prompts={featured as any} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-6">Free Prompts</h2>
          <HomepagePrompts prompts={free as any} />
        </section>
      </main>
    </>
  );
}
