import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";
import {
  createCommerceEntry,
  parseCommerceBody,
  resolveCommerceCategoryIds,
} from "@/lib/commerce-entry";

/**
 * API de comercios (misma auth que /api/news: NEWS_API_TOKEN o sesión admin).
 * POST crea una ficha COMMERCE; GET lista activos (o todos con ?all=1 + token).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get("all") === "1";
  const privileged = includeAll && ((await isAdminUser()) || isNewsWriteAuthorized(request));

  const entries = await prisma.localDirectoryEntry.findMany({
    where: {
      kind: "COMMERCE",
      ...(privileged ? {} : { isActive: true }),
    },
    include: {
      categoryLinks: {
        include: { category: { include: { parent: true } } },
        orderBy: [{ category: { parentId: "asc" } }, { category: { name: "asc" } }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const allowed = (await isAdminUser()) || isNewsWriteAuthorized(request);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const parsed = parseCommerceBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const categoryIds = await resolveCommerceCategoryIds(body);
  if (categoryIds.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid category (categoryIds, category or categoryPath)" },
      { status: 400 },
    );
  }

  const result = await createCommerceEntry(parsed, categoryIds);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.entry, { status: 201 });
}
