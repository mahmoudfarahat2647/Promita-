/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("listAll returns categories with their subcategories", async () => {
  const t = convexTest(schema, modules);
  const catId = await t.mutation(api.seed.seedCategories, {});
  const result = await t.query(api.categories.listAll, {});
  expect(result.length).toBeGreaterThan(0);
  expect(result[0].subcategories).toBeDefined();
});

test("getSubcategoryBySlug returns correct subcategory", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.seed.seedCategories, {});
  const sub = await t.query(api.categories.getSubcategoryBySlug, {
    slug: "tshirts",
  });
  expect(sub?.name).toBe("T-Shirts");
});
