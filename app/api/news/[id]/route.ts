import { ArticleCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";
import { clearHeroExcept } from "@/lib/article-hero";
import { nextPortadaRankForPublished } from "@/lib/article-portada-rank";
import { isArticleCategory } from "@/lib/article-categories";
import { parsePublishedAtInput } from "@/lib/article-dates";

type Params = {
  params: { id: string };
};

function coerceArticleStatus(raw: unknown): "draft" | "published" | undefined {
  if (raw == null) return undefined;
  const value = String(raw).trim().toLowerCase();
  return value === "draft" ? "draft" : "published";
}

export async function PATCH(request: Request, { params }: Params) {
  const allowed = (await isAdminUser()) || isNewsWriteAuthorized(request);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();

  if (body?.intent === "status") {
    const statusIn = coerceArticleStatus(body.status);
    if (!statusIn) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data: { status: string; portadaRank?: number } = { status: statusIn };
    if (statusIn === "published" && existing.status !== "published") {
      data.portadaRank = await nextPortadaRankForPublished();
    } else if (statusIn === "draft" && existing.status === "published") {
      data.portadaRank = 0;
    }

    const article = await prisma.article.update({ where: { id }, data });
    return NextResponse.json(article);
  }

  const title = String(body.title || "").trim();
  const titleVal = body.titleVal != null ? String(body.titleVal).trim() || null : null;
  const content = String(body.content || "").trim();
  const contentVal = body.contentVal != null ? String(body.contentVal).trim() || null : null;
  const summary = body.summary != null ? String(body.summary).trim() || null : null;
  const summaryVal = body.summaryVal != null ? String(body.summaryVal).trim() || null : null;
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  const categoryRaw = body.category != null ? String(body.category) : undefined;
  const category: ArticleCategory | undefined = categoryRaw
    ? isArticleCategory(categoryRaw)
      ? categoryRaw
      : undefined
    : undefined;
  const status = coerceArticleStatus(body.status);
  const isHero = body.isHero !== undefined ? Boolean(body.isHero) : undefined;
  const publishedAt = parsePublishedAtInput(body.publishedAt);

  if (!title || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  /** No recalcular slug al cambiar el titular: estabilidad de URL y SEO (enlaces, índices). */

  const nextStatus = status !== undefined ? status : existing.status;
  const portadaRankPatch: { portadaRank?: number } = {};
  if (status !== undefined) {
    if (nextStatus === "published" && existing.status !== "published") {
      portadaRankPatch.portadaRank = await nextPortadaRankForPublished();
    } else if (nextStatus === "draft" && existing.status === "published") {
      portadaRankPatch.portadaRank = 0;
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      titleVal,
      content,
      contentVal,
      summary,
      summaryVal,
      imageUrl,
      ...(category !== undefined ? { category } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(isHero !== undefined ? { isHero } : {}),
      ...(publishedAt !== undefined ? { publishedAt } : {}),
      ...portadaRankPatch,
    },
  });

  if (article.isHero) {
    await clearHeroExcept(article.id);
  }

  return NextResponse.json(article);
}

export async function DELETE(request: Request, { params }: Params) {
  const allowed = (await isAdminUser()) || isNewsWriteAuthorized(request);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
