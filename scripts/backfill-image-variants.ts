/**
 * Genera variantes WebP (-w320, -w640, -w1200) para imágenes master ya subidas.
 *
 * Uso:
 *   npm run media:variants:backfill              # simulación
 *   npm run media:variants:backfill -- --apply   # escribe ficheros
 *   npm run media:variants:backfill -- --apply --s3
 *   npm run media:variants:backfill -- --apply --force
 *   npm run media:variants:backfill -- --apply --limit 10
 *   npm run media:variants:backfill -- --apply --root /ruta/custom/media
 *
 * En producción: `set -a && source .env && set +a` antes de ejecutar, o `node --env-file=.env`.
 */
import {
  backfillLocalMaster,
  backfillS3Master,
  discoverLocalMasters,
  discoverS3Masters,
  formatVariantSummary,
  type BackfillResult,
} from "@/lib/media-backfill";

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply");
  const dryRun = !apply;
  const force = argv.includes("--force");
  const reoptimizeMaster = argv.includes("--reoptimize-master");
  const s3 = argv.includes("--s3") || argv.includes("--s3-only");
  const s3Only = argv.includes("--s3-only");
  const localOnly = argv.includes("--local-only");

  let limit = Infinity;
  const limitIdx = argv.indexOf("--limit");
  if (limitIdx !== -1) {
    const n = Number(argv[limitIdx + 1]);
    if (Number.isFinite(n) && n > 0) limit = n;
  }

  const roots: string[] = [];
  const rootIdx = argv.indexOf("--root");
  if (rootIdx !== -1) {
    const r = argv[rootIdx + 1];
    if (r) roots.push(r);
  }

  return { dryRun, force, reoptimizeMaster, s3, s3Only, localOnly, limit, roots };
}

function printResult(r: BackfillResult, dryRun: boolean) {
  const rel = r.master.length > 72 ? `…${r.master.slice(-68)}` : r.master;
  if (r.errors.length) {
    console.log(`  ✗ ${rel}`);
    for (const e of r.errors) console.log(`      ${e}`);
    return;
  }
  if (r.created.length === 0 && r.skipped.length > 0) {
    console.log(`  ○ ${rel} (ya tenía ${formatVariantSummary(r.skipped)})`);
    return;
  }
  const mode = dryRun ? "crearía" : "creadas";
  console.log(`  ✓ ${rel} → ${mode}: ${formatVariantSummary(r.created)}${r.skipped.length ? ` · omitidas: ${formatVariantSummary(r.skipped)}` : ""}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const backfillOpts = {
    dryRun: opts.dryRun,
    force: opts.force,
    reoptimizeMaster: opts.reoptimizeMaster,
  };

  console.log(
    opts.dryRun
      ? "Modo simulación (--apply para escribir). Variantes: w320, w640, w1200"
      : "Aplicando variantes en disco/S3…"
  );

  let processed = 0;
  let created = 0;
  let errors = 0;

  if (!opts.s3Only) {
    const groups = await discoverLocalMasters(opts.roots);
    for (const { root, masters } of groups) {
      console.log(`\nLocal: ${root} (${masters.length} masters)`);
      for (const masterAbs of masters) {
        if (processed >= opts.limit) break;
        const r = await backfillLocalMaster(root, masterAbs, backfillOpts);
        printResult(r, opts.dryRun);
        processed += 1;
        created += r.created.length;
        errors += r.errors.length ? 1 : 0;
      }
    }
  }

  if (opts.s3 || opts.s3Only) {
    const keys = await discoverS3Masters();
    console.log(`\nS3: ${keys.length} masters`);
    for (const key of keys) {
      if (processed >= opts.limit) break;
      const r = await backfillS3Master(key, backfillOpts);
      printResult(r, opts.dryRun);
      processed += 1;
      created += r.created.length;
      errors += r.errors.length ? 1 : 0;
    }
  }

  if (!opts.s3Only && !opts.s3) {
    const hasS3 = Boolean(process.env.S3_BUCKET?.trim() && process.env.S3_ENDPOINT?.trim());
    if (hasS3) {
      console.log("\n(S3 disponible en .env; añade --s3 para procesar también el bucket)");
    }
  }

  console.log(`\nResumen: ${processed} masters · ${created} variantes ${opts.dryRun ? "pendientes" : "escritas"} · ${errors} errores`);
  if (opts.dryRun) {
    console.log("Ejecuta con --apply para generar los ficheros.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
