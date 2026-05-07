import { CategoryCard } from "./category-card";

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const subcategoryIconMap: Record<string, string> = {
    tshirts: "shirt",
    stickers: "shirt",
    mockups: "image",
    "social-media": "message-square",
    "product-photography": "camera",
    "ad-creatives": "megaphone",
  };

  const items = categories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      id: sub._id,
      name: sub.name,
      parentName: cat.name,
      icon: subcategoryIconMap[sub.slug] ?? cat.icon,
      href: `/prompts/${cat.slug}/${sub.slug}`,
    }))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <CategoryCard key={item.id} {...item} />
      ))}
    </div>
  );
}
