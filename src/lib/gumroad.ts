interface BuildCheckoutUrlArgs {
  gumroadProductId: string;
  clerkUserId: string;
  promptId?: string;
  subcategoryId?: string;
}

export function buildCheckoutUrl({
  gumroadProductId,
  clerkUserId,
  promptId,
  subcategoryId,
}: BuildCheckoutUrlArgs): string {
  const base = `https://app.gumroad.com/l/${gumroadProductId}`;
  const params = new URLSearchParams({
    wanted: "true",
    custom_field_clerk_id: clerkUserId,
    ...(promptId ? { custom_field_prompt_id: promptId } : {}),
    ...(subcategoryId ? { custom_field_subcategory_id: subcategoryId } : {}),
  });
  return `${base}?${params.toString()}`;
}

export function validateGumroadSellerId(sellerId: string): boolean {
  return sellerId === process.env.GUMROAD_SELLER_ID;
}
