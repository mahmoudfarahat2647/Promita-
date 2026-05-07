import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { webhookRatelimit } from "@/lib/upstash";
import { validateGumroadSellerId } from "@/lib/gumroad";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await webhookRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await req.formData();
  const sellerId = body.get("seller_id") as string | null;

  if (!sellerId || !validateGumroadSellerId(sellerId)) {
    return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
  }

  const orderId = body.get("order_id") as string;
  const price = parseFloat((body.get("price") as string) ?? "0") / 100;
  const clerkUserId = body.get("custom_field_clerk_id") as string | null;
  const promptId = body.get("custom_field_prompt_id") as Id<"prompts"> | null;
  const subcategoryId =
    body.get("custom_field_subcategory_id") as Id<"subcategories"> | null;

  if (!clerkUserId) {
    return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
  }

  try {
    await convex.mutation(api.webhook.processGumroadPurchaseFromWebhook, {
      sellerId,
      gumroadOrderId: orderId,
      clerkUserId,
      promptId: promptId ?? undefined,
      subcategoryId: subcategoryId ?? undefined,
      amount: price,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook mutation failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
