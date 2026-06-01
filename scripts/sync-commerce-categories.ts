import { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/slug";

const prisma = new PrismaClient();

type ParsedCategory = { parent: string; child: string | null };

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLegacyCategory(raw: string): ParsedCategory {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return { parent: "Otros", child: null };

  if (cleaned.includes("/")) {
    const [a, b] = cleaned.split("/").map((s) => s.trim()).filter(Boolean);
    if (a && b) return { parent: a, child: b };
    if (a) return { parent: a, child: null };
  }

  const n = normalize(cleaned);
  if (/(mediterr|ital|japon|sushi|china|kebab|bar|helader|marisc|hamburg|americana|comida rapida)/.test(n)) {
    return { parent: "Restaurante", child: cleaned };
  }
  if (/(ropa|tienda|tenda|supermerc|hogar|electronica|deporte)/.test(n)) {
    return { parent: "Tienda", child: cleaned };
  }
  if (/(peluquer|clinica|asesor|taller|inmobili|servicio)/.test(n)) {
    return { parent: "Servicios", child: cleaned };
  }
  if (/(pub|coctel|discoteca|ocio)/.test(n)) {
    return { parent: "Ocio", child: cleaned };
  }
  return { parent: "Otros", child: cleaned };
}

async function findOrCreateCategory(kind: "COMMERCE" | "SPORT", name: string, parentId: number | null) {
  const existing = await prisma.localDirectoryCategory.findFirst({
    where: { kind, name, parentId },
  });
  if (existing) return { category: existing, created: false };

  let baseSlug: string;
  if (parentId) {
    const parent = await prisma.localDirectoryCategory.findUnique({ where: { id: parentId } });
    if (!parent) throw new Error(`Categoría padre no encontrada: id=${parentId}`);
    baseSlug = slugify(`${parent.name}-${name}`);
  } else {
    baseSlug = slugify(name);
  }
  if (!baseSlug) baseSlug = "categoria";

  for (let counter = 0; counter < 10_000; counter++) {
    const slug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
    const bySlug = await prisma.localDirectoryCategory.findFirst({ where: { kind, slug } });
    if (!bySlug) {
      const created = await prisma.localDirectoryCategory.create({
        data: { kind, name, slug, parentId },
      });
      return { category: created, created: true };
    }
    if (bySlug.name === name && (bySlug.parentId ?? null) === (parentId ?? null)) {
      return { category: bySlug, created: false };
    }
  }
  throw new Error(`No se pudo asignar slug único para categoría ${kind} / ${name}`);
}

async function syncCommerceCategories() {
  const entries = await prisma.localDirectoryEntry.findMany({
    where: { kind: "COMMERCE" },
    select: { id: true, name: true, category: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  let linked = 0;
  let createdParents = 0;
  let createdChildren = 0;

  for (const entry of entries) {
    const parsed = parseLegacyCategory(entry.category || "");
    const parentResult = await findOrCreateCategory("COMMERCE", parsed.parent, null);
    const parent = parentResult.category;
    if (parentResult.created) {
      createdParents += 1;
    }

    let categoryId = parent.id;
    if (parsed.child && normalize(parsed.child) !== normalize(parsed.parent)) {
      const childResult = await findOrCreateCategory("COMMERCE", parsed.child, parent.id);
      categoryId = childResult.category.id;
      if (childResult.created) {
        createdChildren += 1;
      }
    }

    await prisma.localDirectoryEntryCategory.upsert({
      where: { entryId_categoryId: { entryId: entry.id, categoryId } },
      create: { entryId: entry.id, categoryId },
      update: {},
    });

    linked += 1;
  }

  console.log(
    `Comercios procesados: ${entries.length}. Enlaces creados/asegurados: ${linked}.` +
      ` Nuevas categorías padre aprox: ${createdParents}. Nuevas hijas aprox: ${createdChildren}.`,
  );
}

async function main() {
  await syncCommerceCategories();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
