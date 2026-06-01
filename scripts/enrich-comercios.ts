import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

type EnrichmentRow = {
  slug?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  websiteUrl?: string | null;
};

const DEFAULT_FILE = "scripts/data/comercios-enrichment.json";
const PLACEHOLDER_IMAGE = "/images/comercios/catalogo-local-placeholder.svg";

function getArg(name: string): string | null {
  const idx = process.argv.findIndex((arg) => arg === name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function usage() {
  console.log(`
Uso:
  npx tsx scripts/enrich-comercios.ts --export [ruta.json] [--only-missing]
  npx tsx scripts/enrich-comercios.ts --apply [ruta.json]

Formato JSON (array):
[
  {
    "slug": "commerce-mi-restaurante",
    "description": "Texto mejorado...",
    "imageUrl": "https://...",
    "websiteUrl": "https://..."
  }
]
`);
}

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function exportTemplate(fileArg: string | null, onlyMissing: boolean) {
  const outFile = path.resolve(process.cwd(), fileArg || DEFAULT_FILE);

  const commerces = await prisma.localDirectoryEntry.findMany({
    where: { kind: "COMMERCE" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      websiteUrl: true,
    },
  });

  const rows: EnrichmentRow[] = commerces
    .filter((c) => {
      if (!onlyMissing) return true;
      const missingDescription = !c.description || c.description.trim().length < 30;
      const missingImage = !c.imageUrl || c.imageUrl === PLACEHOLDER_IMAGE;
      return missingDescription || missingImage;
    })
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      websiteUrl: c.websiteUrl,
    }));

  await ensureDir(outFile);
  await fs.writeFile(outFile, JSON.stringify(rows, null, 2), "utf8");
  console.log(`Exportados ${rows.length} comercios en: ${outFile}`);
}

async function applyEnrichment(fileArg: string | null) {
  const filePath = path.resolve(process.cwd(), fileArg || DEFAULT_FILE);
  const raw = await fs.readFile(filePath, "utf8");
  const rows = JSON.parse(raw) as EnrichmentRow[];

  if (!Array.isArray(rows)) {
    throw new Error("El archivo debe ser un array JSON.");
  }

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.slug && !row.name) {
      skipped += 1;
      continue;
    }

    const data: { description?: string; imageUrl?: string | null; websiteUrl?: string | null } = {};

    if (typeof row.description === "string" && row.description.trim()) {
      data.description = row.description.trim();
    }
    if (typeof row.imageUrl === "string") {
      data.imageUrl = row.imageUrl.trim() || null;
    }
    if (typeof row.websiteUrl === "string") {
      data.websiteUrl = row.websiteUrl.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      skipped += 1;
      continue;
    }

    const result = await prisma.localDirectoryEntry.updateMany({
      where: {
        ...(row.slug ? { slug: row.slug } : {}),
        ...(row.name ? { name: row.name } : {}),
        kind: "COMMERCE",
      },
      data,
    });

    if (result.count > 0) updated += 1;
    else skipped += 1;
  }

  console.log(`Actualizados: ${updated}. Omitidos: ${skipped}.`);
}

async function main() {
  const exportArg = getArg("--export");
  const applyArg = getArg("--apply");
  const onlyMissing = hasFlag("--only-missing");

  if (!exportArg && !applyArg) {
    usage();
    process.exit(1);
  }

  if (exportArg) {
    await exportTemplate(exportArg, onlyMissing);
  }
  if (applyArg) {
    await applyEnrichment(applyArg);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
