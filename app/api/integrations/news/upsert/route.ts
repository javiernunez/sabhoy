import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEventsWriteAuthorized } from "@/lib/api-auth";
import { slugify } from "@/lib/slug";
import { isArticleCategory } from "@/lib/article-categories";
import type { ArticleCategory } from "@prisma/client";

function asOptionalString(raw: unknown) {
  if (raw == null) return null;
  const value = String(raw).trim();
  return value || null;
}

function extractBatch(body: unknown): any[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const payload = body as Record<string, unknown>;
    if (Array.isArray(payload.news)) return payload.news as any[];
    if (Array.isArray(payload.items)) return payload.items as any[];
    if (Array.isArray(payload.data)) return payload.data as any[];
  }
  return [body];
}

async function upsertOne(raw: any) {
  const title = String(raw?.title ?? "").trim();
  const titleVal = asOptionalString(raw?.titleVal);
  const summary = asOptionalString(raw?.summary);
  const summaryVal = asOptionalString(raw?.summaryVal);
  const content = String(raw?.content ?? "").trim();
  const contentVal = asOptionalString(raw?.contentVal);
  const imageUrl = asOptionalString(raw?.imageUrl);
  const categoryRaw = asOptionalString(raw?.category) ?? "GENERAL";
  const category: ArticleCategory = isArticleCategory(categoryRaw) ? categoryRaw : "GENERAL";

  if (!title || !content) {
    return { ok: false as const, error: "Missing fields", slug: null };
  }

  const slugBase = slugify(title) || `noticia-${Date.now()}`;
  const existing = await prisma.article.findUnique({ where: { slug: slugBase } });

  if (existing && existing.status === "draft") {
    const updated = await prisma.article.update({
      where: { id: existing.id },
      data: {
        title,
        titleVal,
        summary,
        summaryVal,
        content,
        contentVal,
        imageUrl,
        category,
        status: "draft",
      },
    });
    return { ok: true as const, article: updated };
  }

  const slug = existing ? `${slugBase}-${Date.now()}` : slugBase;
  const created = await prisma.article.create({
    data: {
      title,
      titleVal,
      slug,
      summary,
      summaryVal,
      content,
      contentVal,
      imageUrl,
      category,
      status: "draft",
    },
  });

  return { ok: true as const, article: created };
}

export async function POST(request: Request) {
  if (!isEventsWriteAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const entries = extractBatch(body);

  if (entries.length === 0) {
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  const results = [];
  for (const entry of entries) {
    try {
      results.push(await upsertOne(entry));
    } catch (error) {
      results.push({
        ok: false as const,
        error: error instanceof Error ? error.message : "Unexpected error",
        slug: String(entry?.slug ?? "").trim() || null,
      });
    }
  }

  if (entries.length === 1) {
    const single = results[0];
    if (!single.ok) {
      return NextResponse.json({ error: single.error }, { status: 400 });
    }
    return NextResponse.json(single.article, { status: 200 });
  }

  const ok = results.filter((item) => item.ok).length;
  const failed = results.length - ok;
  return NextResponse.json(
    {
      total: results.length,
      ok,
      failed,
      results,
    },
    { status: failed > 0 ? 207 : 200 },
  );
}
