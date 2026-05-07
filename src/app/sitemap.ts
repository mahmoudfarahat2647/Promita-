import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prompts = await fetchQuery(api.prompts.getAllPublishedSlugs, {});
  const categories = await fetchQuery(api.categories.listAll, {});

  const promptUrls = prompts.map((p: (typeof prompts)[number]) => ({
    url: `https://promptita.com/prompts/${p.slug}`,
    lastModified: new Date(p._creationTime),
  }));

  const subcategoryUrls = categories.flatMap((cat: (typeof categories)[number]) =>
    cat.subcategories.map((sub: (typeof cat.subcategories)[number]) => ({
      url: `https://promptita.com/prompts/${cat.slug}/${sub.slug}`,
      lastModified: new Date(),
    }))
  );

  return [
    { url: "https://promptita.com", lastModified: new Date() },
    ...subcategoryUrls,
    ...promptUrls,
  ];
}
