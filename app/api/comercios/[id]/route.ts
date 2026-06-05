import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";
import {
  parseCommerceBody,
  resolveCommerceCategoryIds,
  updateCommerceEntry,
} from "@/lib/commerce-entry";

type Params = {
  params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const entry = await prisma.localDirectoryEntry.findFirst({
    where: { id, kind: "COMMERCE" },
    include: {
      categoryLinks: {
        include: { category: { include: { parent: true } } },
        orderBy: [{ category: { parentId: "asc" } }, { category: { name: "asc" } }],
      },
    },
  });

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(entry);
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

  const result = await updateCommerceEntry(id, parsed, categoryIds);
  if ("error" in result) {
    const status = result.error === "Not found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result.entry);
}
