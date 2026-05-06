import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { CategoryGrid } from "@/components/categories/category-grid";
import { HomepagePrompts } from "@/components/prompts/homepage-prompts";
import { HeroSection } from "@/components/layout/hero-section";

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
        imageUrl: p.imageStorageId
          ? await fetchQuery(api.prompts.getImageUrl, { storageId: p.imageStorageId })
          : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      }))
    );

  const [featured, free] = await Promise.all([
    withUrls(featuredRaw),
    withUrls(freeRaw),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
      <HeroSection />

      <section>
        <h2 className="text-lg font-bold tracking-tight text-white mb-6">Browse Categories</h2>
        <CategoryGrid categories={categories as any} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight text-white">Featured Prompts</h2>
          <a href="/search" className="text-sm text-[#666] hover:text-white flex items-center gap-1">
            View all →
          </a>
        </div>
        <HomepagePrompts prompts={featured as any} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight text-white">Free Prompts</h2>
          <a href="/search?isFree=true" className="text-sm text-[#666] hover:text-white flex items-center gap-1">
            View all →
          </a>
        </div>
        <HomepagePrompts prompts={free as any} />
      </section>
    </main>
  );
}
