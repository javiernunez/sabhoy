import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { REPORT_CATEGORIES } from "@/lib/constants";

type Params = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const allowedStatuses = ["pending", "reviewed", "published"];
  const allowedCategories = new Set(REPORT_CATEGORIES);

  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? body.description ?? "").trim();
  const requestedCategories: unknown[] = [];
  if (Array.isArray(body.categories)) {
    requestedCategories.push(...body.categories);
  } else if (body.category) {
    requestedCategories.push(body.category);
  }
  const categories = requestedCategories
    .map((item) => (typeof item === "string" ? item : "").trim().toLowerCase())
    .filter((item, index, list) => Boolean(item) && list.indexOf(item) === index);
  const validCategories = categories.filter((item) => allowedCategories.has(item as (typeof REPORT_CATEGORIES)[number]));
  const status = String(body.status || "");
  const imageUrlRaw = body.imageUrl;
  const imageUrl = typeof imageUrlRaw === "string" ? imageUrlRaw.trim() || null : null;

  if (!title || !content) {
    return NextResponse.json({ error: "Invalid title/content" }, { status: 400 });
  }
  if (!validCategories.length) {
    return NextResponse.json({ error: "Invalid categories" }, { status: 400 });
  }
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const report = await prisma.report.update({
    where: { id },
    data: {
      title,
      content,
      categories: validCategories,
      imageUrl,
      status: status as "pending" | "reviewed" | "published",
    },
  });

  return NextResponse.json(report);
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.report.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
