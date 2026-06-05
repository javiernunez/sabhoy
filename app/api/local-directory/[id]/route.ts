import { DirectoryKind } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminUser } from "@/lib/auth";
import { isNewsWriteAuthorized } from "@/lib/api-auth";
import { slugify } from "@/lib/slug";

type Params = {
  params: { id: string };
};

function isDirectoryKind(value: string): value is DirectoryKind {
  return Object.values(DirectoryKind).includes(value as DirectoryKind);
}

async function resolvePrimaryCategoryFields(kind: DirectoryKind, categoryIds: number[]) {
  const categories = await prisma.localDirectoryCategory.findMany({
    where: { id: { in: categoryIds }, kind },
    include: { parent: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
  if (categories.length === 0) return { category: "", categoryVal: null as string | null };
  const first = categories[0];
  const category = first.parent ? `${first.parent.name} / ${first.name}` : first.name;
  const categoryVal = first.parent
    ? [first.parent.nameVal ?? first.parent.name, first.nameVal ?? first.name].join(" / ")
    : (first.nameVal ?? first.name);
  return { category, categoryVal };
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
  const name = String(body.name || "").trim();
  const nameVal = body.nameVal != null ? String(body.nameVal).trim() || null : null;
  const description = String(body.description || "").trim();
  const descriptionVal = body.descriptionVal != null ? String(body.descriptionVal).trim() || null : null;
  const kindRaw = String(body.kind || "");
  const kind = isDirectoryKind(kindRaw) ? kindRaw : null;
  const categoryIds: number[] = Array.isArray(body.categoryIds)
    ? body.categoryIds.map((v: unknown) => Number(v)).filter((v: number) => Number.isInteger(v) && v > 0)
    : [];
  const websiteUrl = body.websiteUrl ? String(body.websiteUrl).trim() : null;
  const address = body.address ? String(body.address).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;
  const facebookUrl = body.facebookUrl ? String(body.facebookUrl).trim() : null;
  const instagramUrl = body.instagramUrl ? String(body.instagramUrl).trim() : null;
  const tiktokUrl = body.tiktokUrl ? String(body.tiktokUrl).trim() : null;
  const href = body.href ? String(body.href).trim() : null;
  const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
  const icon = body.icon ? String(body.icon).trim() : null;
  const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;

  if (!name || !description || !kind || categoryIds.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const primaryCategory = await resolvePrimaryCategoryFields(kind, categoryIds);
  if (!primaryCategory.category) {
    return NextResponse.json({ error: "Invalid categories" }, { status: 400 });
  }

  const slug = slugify(`${kind}-${name}`);

  const entry = await prisma.$transaction(async (tx) => {
    await tx.localDirectoryEntryCategory.deleteMany({ where: { entryId: id } });
    return tx.localDirectoryEntry.update({
      where: { id },
      data: {
        kind,
        name,
        nameVal,
        slug,
        category: primaryCategory.category,
        categoryVal: primaryCategory.categoryVal,
        description,
        descriptionVal,
        websiteUrl,
        address,
        phone,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
        href,
        imageUrl,
        icon,
        isActive,
        sortOrder,
        categoryLinks: {
          createMany: {
            data: categoryIds.map((categoryId) => ({ categoryId })),
            skipDuplicates: true,
          },
        },
      },
      include: {
        categoryLinks: {
          include: { category: { include: { parent: true } } },
          orderBy: [{ category: { parentId: "asc" } }, { category: { name: "asc" } }],
        },
      },
    });
  });

  return NextResponse.json(entry);
}

export async function DELETE(_: Request, { params }: Params) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.localDirectoryEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
