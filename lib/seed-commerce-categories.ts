import type { DirectoryKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMMERCE_ROOT_CATEGORIES } from "@/lib/commerce-category-tree";
import { slugify } from "@/lib/slug";

export async function upsertDirectoryCategory(
  kind: DirectoryKind,
  name: string,
  nameVal?: string | null,
  parentId?: number | null,
) {
  const existing = await prisma.localDirectoryCategory.findFirst({
    where: { kind, name, parentId: parentId ?? null },
  });
  if (existing) {
    return prisma.localDirectoryCategory.update({
      where: { id: existing.id },
      data: { nameVal: nameVal ?? existing.nameVal ?? null },
    });
  }

  let baseSlug = parentId
    ? slugify(
        `${(await prisma.localDirectoryCategory.findUnique({ where: { id: parentId } }))!.name}-${name}`,
      )
    : slugify(name);
  if (!baseSlug) baseSlug = "categoria";

  for (let counter = 0; counter < 10_000; counter++) {
    const slug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
    const bySlug = await prisma.localDirectoryCategory.findFirst({ where: { kind, slug } });
    if (!bySlug) {
      return prisma.localDirectoryCategory.create({
        data: { kind, name, nameVal: nameVal ?? null, parentId: parentId ?? null, slug },
      });
    }
    if (bySlug.name === name && (bySlug.parentId ?? null) === (parentId ?? null)) {
      return prisma.localDirectoryCategory.update({
        where: { id: bySlug.id },
        data: { nameVal: nameVal ?? bySlug.nameVal ?? null },
      });
    }
  }
  throw new Error(`No slug for ${kind}/${name}`);
}

export async function seedCommerceRootCategories() {
  const created: string[] = [];
  for (const cat of COMMERCE_ROOT_CATEGORIES) {
    await upsertDirectoryCategory("COMMERCE", cat.name, cat.nameVal, null);
    created.push(cat.name);
  }
  return { count: created.length, names: created };
}
