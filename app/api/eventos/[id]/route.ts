import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { coerceEventCategory, normalizeDetailsPayload } from "@/lib/event-category";

type Params = {
  params: { id: string };
};

function toDate(raw: unknown) {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const titleVal = body.titleVal != null ? String(body.titleVal).trim() || null : null;
  const description = String(body.description || "").trim();
  const descriptionVal = body.descriptionVal != null ? String(body.descriptionVal).trim() || null : null;
  const eventDate = toDate(body.eventDate);
  const category = coerceEventCategory(body.category);
  const imageUrl = body.imageUrl != null ? String(body.imageUrl).trim() || null : null;
  const linkUrl = body.linkUrl != null ? String(body.linkUrl).trim() || null : null;
  const source = body.source != null ? String(body.source).trim() || null : null;
  const sourceUrl = body.sourceUrl != null ? String(body.sourceUrl).trim() || null : null;

  if (!title || !description || !eventDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const detailsNorm = normalizeDetailsPayload(category, eventDate, body.details ?? body.extra);
  if (!detailsNorm.ok) {
    return NextResponse.json({ error: detailsNorm.error }, { status: 400 });
  }

  const slugBase = slugify(title) || `evento-${id}`;
  const existing = await prisma.event.findUnique({ where: { slug: slugBase } });
  const slug = existing && existing.id !== id ? `${slugBase}-${Date.now()}` : slugBase;

  const updated = await prisma.event.update({
    where: { id },
    data: {
      category,
      details: detailsNorm.value === null ? Prisma.DbNull : detailsNorm.value,
      title,
      titleVal,
      description,
      descriptionVal,
      eventDate,
      imageUrl,
      linkUrl,
      slug,
      source,
      sourceUrl,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
