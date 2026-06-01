import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { REPORT_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slug";

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  const body = await request.json();
  const title = String(body.title || "").trim();
  const content = String(body.description || body.content || "").trim();
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  const anonymous = Boolean(body.anonymous);
  const allowedCategories = new Set(REPORT_CATEGORIES);
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

  if (!title || !content || !validCategories.length) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const baseSlug = slugify(title);
  const existing = await prisma.report.findUnique({
    where: { slug: baseSlug },
  });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const report = await prisma.report.create({
    data: {
      title,
      slug,
      content,
      categories: validCategories,
      imageUrl,
      status: "pending",
      userId: anonymous ? null : session?.user?.id ?? null,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
