import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  const pages = await prisma.evergreenPage.findMany({
    orderBy: { title: "asc" },
  });
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const titleVal = body.titleVal != null ? String(body.titleVal).trim() || null : null;
  const content = String(body.content || "").trim();
  const contentVal = body.contentVal != null ? String(body.contentVal).trim() || null : null;
  const isHighlighted = Boolean(body.isHighlighted);
  const slug = body.slug ? slugify(String(body.slug)) : slugify(title);

  if (!title || !content || !slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const page = await prisma.evergreenPage.create({
    data: { title, titleVal, slug, content, contentVal, isHighlighted },
  });

  return NextResponse.json(page, { status: 201 });
}
