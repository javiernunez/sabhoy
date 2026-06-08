import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";
import { seedCommerceRootCategories } from "@/lib/seed-commerce-categories";

export async function POST(request: Request) {
  const allowed = (await isAdminUser()) || isNewsWriteAuthorized(request);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await seedCommerceRootCategories();
  return NextResponse.json({ ok: true, ...result });
}
