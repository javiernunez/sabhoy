import { NextResponse } from "next/server";
import type { PoblePageCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const CATEGORIES: PoblePageCategory[] = ["MONUMENTS", "TRADITIONS", "HISTORY", "MAYORS", "OTHER"];

function parseCategory(value: unknown): PoblePageCategory | null {
  const s = String(value || "");
  return CATEGORIES.includes(s as PoblePageCategory) ? (s as PoblePageCategory) : null;
}

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = (await request.json()) as Record<string, unknown>;
  const category = parseCategory(body.category);
  const title = String(body.title || "").trim();
  const titleVal = body.titleVal != null ? String(body.titleVal).trim() || null : null;
  const content = String(body.content || "").trim();
  const contentVal = body.contentVal != null ? String(body.contentVal).trim() || null : null;
  const summary = body.summary != null ? String(body.summary).trim() || null : null;
  const summaryVal = body.summaryVal != null ? String(body.summaryVal).trim() || null : null;
  const imageUrl = body.imageUrl != null ? String(body.imageUrl).trim() || null : null;
  const slug = slugify(String(body.slug || title));
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  if (!category || !title || !content || !slug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const page = await prisma.nostrePoblePage.update({
    where: { id },
    data: {
      category,
      title,
      titleVal: titleVal,
      content,
      contentVal: contentVal,
      summary: summary,
      summaryVal: summaryVal,
      imageUrl,
      slug,
      sortOrder,
      isPublished: body.isPublished === false ? false : true,
    },
  });
  return NextResponse.json(page);
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await prisma.nostrePoblePage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
