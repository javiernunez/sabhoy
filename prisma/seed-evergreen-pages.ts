/**
 * Rellena EvergreenPage existentes (por slug) con contenido completo ES/VAL.
 *
 * Uso:
 *   npm run prisma:seed:evergreen           # solo stubs / campos vacíos
 *   npm run prisma:seed:evergreen -- --force  # sobrescribe todo el contenido del seed
 *
 * Datos basados en export CSV y guías de sabhoy.es.
 */
import { PrismaClient } from "@prisma/client";
import { EVERGREEN_PAGE_SEEDS } from "./data/evergreen-pages";

const prisma = new PrismaClient();

const STUB_MARKERS = [
  /^##\s+Agenda infantil\s*$/m,
  /^##\s+Proximos eventos\s*$/m,
  /^##\s+Guardias\s*$/m,
  /^##\s+Horarios\s*$/m,
  /^##\s+Parques destacados\s*$/m,
];

function isStubContent(content: string): boolean {
  const t = content.trim();
  if (t.length < 450) return true;
  return STUB_MARKERS.some((re) => re.test(t));
}

function parseArgs() {
  return { force: process.argv.includes("--force") };
}

async function main() {
  const { force } = parseArgs();
  let updated = 0;
  let skipped = 0;
  let missing = 0;

  console.log(force ? "Modo --force: sobrescribe contenido del seed." : "Modo seguro: solo stubs y campos VAL vacíos.");

  for (const seed of EVERGREEN_PAGE_SEEDS) {
    const existing = await prisma.evergreenPage.findUnique({ where: { slug: seed.slug } });

    if (!existing) {
      await prisma.evergreenPage.create({
        data: {
          title: seed.title,
          titleVal: seed.titleVal,
          slug: seed.slug,
          content: seed.content || seed.contentVal,
          contentVal: seed.contentVal,
          isHighlighted: seed.isHighlighted ?? false,
        },
      });
      console.log(`  + creada: ${seed.slug}`);
      updated += 1;
      continue;
    }

    const data: {
      title?: string;
      titleVal?: string | null;
      content?: string;
      contentVal?: string | null;
      isHighlighted?: boolean;
    } = {};

    if (force) {
      data.title = seed.title;
      data.titleVal = seed.titleVal;
      if (seed.content.trim()) data.content = seed.content;
      data.contentVal = seed.contentVal;
      if (seed.isHighlighted !== undefined) data.isHighlighted = seed.isHighlighted;
    } else {
      if (!existing.titleVal?.trim() && seed.titleVal) data.titleVal = seed.titleVal;
      if (!existing.contentVal?.trim() && seed.contentVal) data.contentVal = seed.contentVal;
      if (seed.content.trim() && isStubContent(existing.content)) data.content = seed.content;
      if (!seed.content.trim() && isStubContent(existing.content) && seed.contentVal) {
        /* telefonos/transporte: content vacío en seed = no tocar ES */
      }
    }

    if (Object.keys(data).length === 0) {
      console.log(`  ○ sin cambios: ${seed.slug}`);
      skipped += 1;
      continue;
    }

    await prisma.evergreenPage.update({
      where: { slug: seed.slug },
      data,
    });
    console.log(`  ✓ actualizada: ${seed.slug} (${Object.keys(data).join(", ")})`);
    updated += 1;
  }

  const allSlugs = new Set(EVERGREEN_PAGE_SEEDS.map((s) => s.slug));
  const inDb = await prisma.evergreenPage.findMany({ select: { slug: true, title: true } });
  for (const row of inDb) {
    if (!allSlugs.has(row.slug)) {
      console.log(`  ? en BBDD sin seed: ${row.slug} (${row.title})`);
      missing += 1;
    }
  }

  console.log(`\nResumen: ${updated} actualizadas/creadas · ${skipped} sin cambios · ${missing} en BBDD sin entrada en seed`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
