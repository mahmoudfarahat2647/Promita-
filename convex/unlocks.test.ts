/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("processGumroadPurchase is idempotent", async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.seed.seedCategories, {});
  const cats = await t.query(api.categories.listAll, {});
  const sub = cats[0].subcategories[0];
  const storageId = await t.run(async (ctx) =>
    ctx.storage.store(new Blob(["prompt-image"], { type: "image/png" }))
  );
  const promptId = await t.mutation(api.admin.createPrompt, {
    title: "T",
    slug: "t",
    description: "D",
    promptText: "P",
    categoryId: cats[0]._id,
    subcategoryId: sub._id,
    aiTool: "chatgpt",
    isFree: false,
    price: 2.99,
    gumroadProductId: "g1",
    imageStorageId: storageId,
  });

  await t.mutation(internal.webhook.processGumroadPurchase, {
    gumroadOrderId: "order-1",
    clerkUserId: "user_abc",
    promptId,
    amount: 2.99,
  });
  const r2 = await t.mutation(internal.webhook.processGumroadPurchase, {
    gumroadOrderId: "order-1",
    clerkUserId: "user_abc",
    promptId,
    amount: 2.99,
  });
  expect(r2.alreadyProcessed).toBe(true);
});
