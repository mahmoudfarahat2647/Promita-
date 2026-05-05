/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function createStorageId(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) =>
    ctx.storage.store(new Blob(["prompt-image"], { type: "image/png" }))
  );
}

async function setupPrompt(t: ReturnType<typeof convexTest>) {
  await t.mutation(api.seed.seedCategories, {});
  const cats = await t.query(api.categories.listAll, {});
  const sub = cats[0].subcategories[0];
  const storageId = await createStorageId(t);
  return t.mutation(api.admin.createPrompt, {
    title: "Vintage Mountain Tee",
    slug: "vintage-mountain-tee",
    description: "Retro sun and pines linework",
    promptText: "A secret prompt",
    categoryId: cats[0]._id,
    subcategoryId: sub._id,
    aiTool: "chatgpt",
    isFree: false,
    price: 2.99,
    gumroadProductId: "abc123",
    imageStorageId: storageId,
  });
}

test("getBySlug returns prompt without promptText", async () => {
  const t = convexTest(schema, modules);
  await setupPrompt(t);
  const prompt = await t.query(api.prompts.getBySlug, {
    slug: "vintage-mountain-tee",
  });
  expect(prompt?.title).toBe("Vintage Mountain Tee");
  expect((prompt as any)?.promptText).toBeUndefined();
});

test("getPromptText returns null for unauthenticated user on paid prompt", async () => {
  const t = convexTest(schema, modules);
  const promptId = await setupPrompt(t);
  const text = await t.query(api.prompts.getPromptText, { promptId });
  expect(text).toBeNull();
});

test("getPromptText returns text for free prompt without auth", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.seed.seedCategories, {});
  const cats = await t.query(api.categories.listAll, {});
  const sub = cats[0].subcategories[0];
  const storageId = await createStorageId(t);
  const promptId = await t.mutation(api.admin.createPrompt, {
    title: "Free Prompt",
    slug: "free-prompt",
    description: "Free desc",
    promptText: "Free secret",
    categoryId: cats[0]._id,
    subcategoryId: sub._id,
    aiTool: "gemini",
    isFree: true,
    price: 0,
    imageStorageId: storageId,
  });
  const text = await t.query(api.prompts.getPromptText, { promptId });
  expect(text).toBe("Free secret");
});
