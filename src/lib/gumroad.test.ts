import { expect, test } from "vitest";
import { buildCheckoutUrl, validateGumroadSellerId } from "./gumroad";

test("buildCheckoutUrl includes clerk user id and prompt id", () => {
  const url = buildCheckoutUrl({
    gumroadProductId: "abc123",
    clerkUserId: "user_xyz",
    promptId: "prompt_456",
  });
  expect(url).toContain("gumroad.com");
  expect(url).toContain("user_xyz");
  expect(url).toContain("prompt_456");
});

test("buildCheckoutUrl uses subcategoryId for pack", () => {
  const url = buildCheckoutUrl({
    gumroadProductId: "pack789",
    clerkUserId: "user_xyz",
    subcategoryId: "sub_111",
  });
  expect(url).toContain("sub_111");
  expect(url).not.toContain("prompt_");
});

test("validateGumroadSellerId returns true for matching seller", () => {
  process.env.GUMROAD_SELLER_ID = "seller_abc";
  expect(validateGumroadSellerId("seller_abc")).toBe(true);
  expect(validateGumroadSellerId("seller_wrong")).toBe(false);
});
