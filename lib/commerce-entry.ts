import { DirectoryKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const COMMERCE_KIND: DirectoryKind = "COMMERCE";

export type CommerceWriteInput = {
  name: string;
  nameVal: string | null;
  description: string;
  descriptionVal: string | null;
  categoryIds: number[];
  websiteUrl: string | null;
  address: string | null;
  phone: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  href: string | null;
  imageUrl: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
};

function normalizeKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .trim();
}

async function resolvePrimaryCategoryFields(categoryIds: number[]) {
  const categories = await prisma.localDirectoryCategory.findMany({
    where: { id: { in: categoryIds }, kind: COMMERCE_KIND },
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

export async function resolveCommerceCategoryIds(body: Record<string, unknown>): Promise<number[]> {
  const direct: number[] = Array.isArray(body.categoryIds)
    ? body.categoryIds.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0)
    : [];
  if (direct.length > 0) return direct;

  const pathRaw = body.categoryPath ?? body.category;
  if (!pathRaw) return [];

  const parts = String(pathRaw)
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);

  const categories = await prisma.localDirectoryCategory.findMany({
    where: { kind: COMMERCE_KIND },
  });

  if (parts.length >= 2) {
    const parentName = normalizeKey(parts[0]);
    const childName = normalizeKey(parts[1]);
    const parent = categories.find((c) => !c.parentId && normalizeKey(c.name) === parentName);
    if (!parent) return [];
    const child = categories.find(
      (c) => c.parentId === parent.id && normalizeKey(c.name) === childName,
    );
    return child ? [child.id] : [];
  }

  const single = normalizeKey(parts[0]);
  const child = categories.find((c) => c.parentId && normalizeKey(c.name) === single);
  if (child) return [child.id];
  const root = categories.find((c) => !c.parentId && normalizeKey(c.name) === single);
  return root ? [root.id] : [];
}

export function parseCommerceBody(body: Record<string, unknown>): CommerceWriteInput | { error: string } {
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!name || !description) {
    return { error: "Missing fields: name and description are required" };
  }

  const mapsUrl = body.mapsUrl != null ? String(body.mapsUrl).trim() || null : null;
  const hrefRaw = body.href != null ? String(body.href).trim() || null : null;

  return {
    name,
    nameVal: body.nameVal != null ? String(body.nameVal).trim() || null : null,
    description,
    descriptionVal: body.descriptionVal != null ? String(body.descriptionVal).trim() || null : null,
    categoryIds: [],
    websiteUrl: body.websiteUrl != null ? String(body.websiteUrl).trim() || null : null,
    address: body.address != null ? String(body.address).trim() || null : null,
    phone: body.phone != null ? String(body.phone).trim() || null : null,
    facebookUrl: body.facebookUrl != null ? String(body.facebookUrl).trim() || null : null,
    instagramUrl: body.instagramUrl != null ? String(body.instagramUrl).trim() || null : null,
    tiktokUrl: body.tiktokUrl != null ? String(body.tiktokUrl).trim() || null : null,
    href: mapsUrl ?? hrefRaw,
    imageUrl: body.imageUrl != null ? String(body.imageUrl).trim() || null : null,
    icon: body.icon != null ? String(body.icon).trim() || null : null,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : false,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  };
}

const entryInclude = {
  categoryLinks: {
    include: { category: { include: { parent: true } } },
    orderBy: [{ category: { parentId: "asc" } }, { category: { name: "asc" } }] as Prisma.LocalDirectoryEntryCategoryOrderByWithRelationInput[],
  },
} satisfies Prisma.LocalDirectoryEntryInclude;

export async function createCommerceEntry(
  input: CommerceWriteInput,
  categoryIds: number[],
) {
  const primaryCategory = await resolvePrimaryCategoryFields(categoryIds);
  if (!primaryCategory.category) {
    return { error: "Invalid categories" as const };
  }

  const slugBase = slugify(`${COMMERCE_KIND}-${input.name}`);
  const existing = await prisma.localDirectoryEntry.findUnique({ where: { slug: slugBase } });
  const slug = existing ? `${slugBase}-${Date.now()}` : slugBase;

  const entry = await prisma.localDirectoryEntry.create({
    data: {
      kind: COMMERCE_KIND,
      name: input.name,
      nameVal: input.nameVal,
      slug,
      category: primaryCategory.category,
      categoryVal: primaryCategory.categoryVal,
      description: input.description,
      descriptionVal: input.descriptionVal,
      websiteUrl: input.websiteUrl,
      address: input.address,
      phone: input.phone,
      facebookUrl: input.facebookUrl,
      instagramUrl: input.instagramUrl,
      tiktokUrl: input.tiktokUrl,
      href: input.href,
      imageUrl: input.imageUrl,
      icon: input.icon,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
      categoryLinks: {
        createMany: {
          data: categoryIds.map((categoryId) => ({ categoryId })),
          skipDuplicates: true,
        },
      },
    },
    include: entryInclude,
  });

  return { entry };
}

export async function updateCommerceEntry(
  id: number,
  input: CommerceWriteInput,
  categoryIds: number[],
) {
  const existing = await prisma.localDirectoryEntry.findUnique({ where: { id } });
  if (!existing || existing.kind !== COMMERCE_KIND) {
    return { error: "Not found" as const };
  }

  const primaryCategory = await resolvePrimaryCategoryFields(categoryIds);
  if (!primaryCategory.category) {
    return { error: "Invalid categories" as const };
  }

  const slug = slugify(`${COMMERCE_KIND}-${input.name}`);

  const entry = await prisma.$transaction(async (tx) => {
    await tx.localDirectoryEntryCategory.deleteMany({ where: { entryId: id } });
    return tx.localDirectoryEntry.update({
      where: { id },
      data: {
        kind: COMMERCE_KIND,
        name: input.name,
        nameVal: input.nameVal,
        slug,
        category: primaryCategory.category,
        categoryVal: primaryCategory.categoryVal,
        description: input.description,
        descriptionVal: input.descriptionVal,
        websiteUrl: input.websiteUrl,
        address: input.address,
        phone: input.phone,
        facebookUrl: input.facebookUrl,
        instagramUrl: input.instagramUrl,
        tiktokUrl: input.tiktokUrl,
        href: input.href,
        imageUrl: input.imageUrl,
        icon: input.icon,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
        categoryLinks: {
          createMany: {
            data: categoryIds.map((categoryId) => ({ categoryId })),
            skipDuplicates: true,
          },
        },
      },
      include: entryInclude,
    });
  });

  return { entry };
}
