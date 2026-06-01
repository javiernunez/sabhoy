/**
 * Coloca todas las categorías deportivas de asociaciones bajo una sola raíz "Deportes"
 * y elimina artificios "padre=hijo mismo nombre".
 *
 * Idempotente: se puede ejecutar varias veces.
 *
 * Uso: npm run associations:categories:reorganize-sports
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Raíces temáticas que no deben colgarse del árbol de deportes. */
function skipAsNonSportHierarchy(name: string): boolean {
  const n = normalize(name);
  if (n === "deporte" || n === "deportes") return false;
  return (
    /(casal|falla|fallero)/.test(n) ||
    /(ampa|ong|vecin|veinal)/.test(n) ||
    /(polit|familia|escolar)/.test(n)
  );
}

async function nextFreeSlug(kind: "ASSOCIATION", baseSlug: string): Promise<string> {
  for (let counter = 0; counter < 10_000; counter++) {
    const slug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
    const taken = await prisma.localDirectoryCategory.findFirst({ where: { kind, slug } });
    if (!taken) return slug;
  }
  throw new Error(`Sin slug disponible partiendo de ${baseSlug}`);
}

async function mergeEntryCategoryLinks(fromCategoryId: number, toCategoryId: number) {
  if (fromCategoryId === toCategoryId) return;
  const links = await prisma.localDirectoryEntryCategory.findMany({
    where: { categoryId: fromCategoryId },
    select: { entryId: true },
  });
  for (const { entryId } of links) {
    await prisma.localDirectoryEntryCategory.upsert({
      where: { entryId_categoryId: { entryId, categoryId: toCategoryId } },
      create: { entryId, categoryId: toCategoryId },
      update: {},
    });
    try {
      await prisma.localDirectoryEntryCategory.delete({
        where: { entryId_categoryId: { entryId, categoryId: fromCategoryId } },
      });
    } catch {
      // Ya sustituido por upsert
    }
  }
}

async function ensureDeportesRoot(): Promise<number> {
  const roots = await prisma.localDirectoryCategory.findMany({
    where: { kind: "ASSOCIATION", parentId: null },
    orderBy: { id: "asc" },
  });
  const existing = roots.find((c) => ["deporte", "deportes"].includes(normalize(c.name)));
  if (existing) {
    if (normalize(existing.name) === "deporte") {
      const slug = await nextFreeSlug("ASSOCIATION", "deportes");
      await prisma.localDirectoryCategory.update({
        where: { id: existing.id },
        data: { name: "Deportes", nameVal: "Esports", slug },
      });
    }
    return existing.id;
  }

  const slug = await nextFreeSlug("ASSOCIATION", "deportes");
  const created = await prisma.localDirectoryCategory.create({
    data: {
      kind: "ASSOCIATION",
      name: "Deportes",
      nameVal: "Esports",
      parentId: null,
      slug,
    },
  });
  return created.id;
}

async function absorbDuplicateRoot(deportesId: number, rootId: number): Promise<boolean> {
  const root = await prisma.localDirectoryCategory.findUnique({
    where: { id: rootId },
    include: { children: { orderBy: { id: "asc" } } },
  });
  if (!root || root.kind !== "ASSOCIATION" || root.parentId != null || root.id === deportesId) return false;
  if (skipAsNonSportHierarchy(root.name)) return false;

  const children = root.children.filter((ch) => ch.kind === "ASSOCIATION");

  const singleTwin =
    children.length === 1 && normalize(children[0].name) === normalize(root.name) ? children[0] : null;

  let targetLeafId: number;
  let dropIds: number[] = [];

  if (singleTwin) {
    await mergeEntryCategoryLinks(root.id, singleTwin.id);
    targetLeafId = singleTwin.id;
    dropIds = [root.id];
  } else if (children.length === 0) {
    targetLeafId = root.id;
  } else {
    return false;
  }

  const nameForUnderDeportes = (await prisma.localDirectoryCategory.findUnique({ where: { id: targetLeafId } }))
    ?.name;
  if (!nameForUnderDeportes) return false;

  const peer = await prisma.localDirectoryCategory.findFirst({
    where: {
      kind: "ASSOCIATION",
      parentId: deportesId,
      name: nameForUnderDeportes,
    },
  });
  if (peer && peer.id !== targetLeafId) {
    await mergeEntryCategoryLinks(targetLeafId, peer.id);
    await prisma.localDirectoryCategory.delete({ where: { id: targetLeafId } });
    if (singleTwin && dropIds.length) {
      for (const id of dropIds) {
        try {
          await prisma.localDirectoryCategory.delete({ where: { id } });
        } catch {
          /* ya eliminado o restricciones */
        }
      }
    }
    return true;
  }

  await prisma.localDirectoryCategory.update({
    where: { id: targetLeafId },
    data: { parentId: deportesId },
  });

  for (const id of dropIds) {
    try {
      await prisma.localDirectoryCategory.delete({ where: { id } });
    } catch {
      /* */
    }
  }

  return true;
}

async function main() {
  const deportesId = await ensureDeportesRoot();
  const roots = await prisma.localDirectoryCategory.findMany({
    where: { kind: "ASSOCIATION", parentId: null },
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });

  let moved = 0;
  for (const r of roots) {
    if (r.id === deportesId) continue;
    if (skipAsNonSportHierarchy(r.name)) continue;
    const ok = await absorbDuplicateRoot(deportesId, r.id);
    if (ok) moved += 1;
  }

  console.log(
    `Raíz "Deportes" (id=${deportesId}). Grupos deportivos reubicados o fusionados: ${moved}. ` +
      `Las categorías de casales/AMPAs/ONGs/vecinales no se han tocado.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
