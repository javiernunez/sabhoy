import { ArticleCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";
import { clearHeroExcept } from "@/lib/article-hero";
import { isArticleCategory } from "@/lib/article-categories";
import { nextPortadaRankForPublished } from "@/lib/article-portada-rank";
import { slugify } from "@/lib/slug";

function coerceArticleStatus(raw: unknown): "draft" | "published" {
  const value = String(raw ?? "published").trim().toLowerCase();
  return value === "draft" ? "draft" : "published";
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const allowed = (await isAdminUser()) || isNewsWriteAuthorized(request);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title || "").trim();
  const titleVal = body.titleVal != null ? String(body.titleVal).trim() || null : null;
  const content = String(body.content || "").trim();
  const contentVal = body.contentVal != null ? String(body.contentVal).trim() || null : null;
  const summary = body.summary != null ? String(body.summary).trim() || null : null;
  const summaryVal = body.summaryVal != null ? String(body.summaryVal).trim() || null : null;
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  const categoryRaw = String(body.category || "GENERAL");
  const category: ArticleCategory = isArticleCategory(categoryRaw) ? categoryRaw : "GENERAL";
  const status = coerceArticleStatus(body.status);
  const isHero = Boolean(body.isHero);

  if (!title || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const slugBase = slugify(title);
  const existing = await prisma.article.findUnique({
    where: { slug: slugBase },
  });
  const slug = existing ? `${slugBase}-${Date.now()}` : slugBase;

  const portadaRank = status === "published" ? await nextPortadaRankForPublished() : 0;

  const article = await prisma.article.create({
    data: {
      title,
      titleVal,
      slug,
      content,
      contentVal,
      summary,
      summaryVal,
      imageUrl,
      category,
      status,
      portadaRank,
      isHero,
    },
  });

  if (isHero) {
    await clearHeroExcept(article.id);
  }

  return NextResponse.json(article, { status: 201 });
}
