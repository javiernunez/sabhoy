import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, join, relative } from "node:path";
import { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { generateUploadVariants } from "@/lib/image-optimize";
import { UPLOAD_VARIANT_WIDTHS, variantRelativeKey, type UploadVariantWidth } from "@/lib/image-variants";
import { putWebPAtRelativeKey } from "@/lib/media-storage";

export const DEFAULT_MEDIA_ROOTS = [
  join(process.cwd(), "public", "media"),
  "/opt/sabhoy.es/public/media",
];

export function isMasterWebpFilename(name: string): boolean {
  return name.toLowerCase().endsWith(".webp") && !/-w\d+\.webp$/i.test(name);
}

/** `2025/05/foo.webp` relativo al directorio `media/`. */
export function relKeyFromAbsolute(masterAbs: string, mediaRoot: string): string {
  return relative(mediaRoot, masterAbs).split("\\").join("/");
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function walkMasterWebps(dir: string, acc: string[] = []): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      await walkMasterWebps(full, acc);
    } else if (ent.isFile() && isMasterWebpFilename(ent.name)) {
      acc.push(full);
    }
  }
  return acc;
}

export async function discoverLocalMasters(extraRoots: string[] = []): Promise<{ root: string; masters: string[] }[]> {
  const roots = [...DEFAULT_MEDIA_ROOTS, ...extraRoots];
  const seen = new Set<string>();
  const out: { root: string; masters: string[] }[] = [];

  for (const root of roots) {
    if (seen.has(root)) continue;
    seen.add(root);
    const masters = await walkMasterWebps(root);
    if (masters.length > 0) {
      out.push({ root, masters });
    }
  }
  return out;
}

function s3Client(): S3Client | null {
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const key = process.env.S3_ACCESS_KEY?.trim();
  const secret = process.env.S3_SECRET_KEY?.trim();
  const region = process.env.S3_REGION?.trim() || "us-east-1";
  if (!endpoint || !key || !secret) return null;
  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId: key, secretAccessKey: secret },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "0" && process.env.S3_FORCE_PATH_STYLE !== "false",
  });
}

export async function discoverS3Masters(): Promise<string[]> {
  const bucket = process.env.S3_BUCKET?.trim();
  const client = s3Client();
  if (!client || !bucket) return [];

  const masters: string[] = [];
  let token: string | undefined;

  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "media/",
        ContinuationToken: token,
      })
    );
    for (const obj of res.Contents ?? []) {
      const key = obj.Key ?? "";
      const name = key.split("/").pop() ?? "";
      if (isMasterWebpFilename(name)) {
        masters.push(key);
      }
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return masters;
}

async function s3ObjectExists(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function writeLocalVariant(mediaRoot: string, relKey: string, buffer: Buffer): Promise<void> {
  const dest = join(mediaRoot, relKey);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buffer);
}

export type BackfillResult = {
  master: string;
  created: UploadVariantWidth[];
  skipped: UploadVariantWidth[];
  errors: string[];
};

export type BackfillOptions = {
  dryRun?: boolean;
  force?: boolean;
  reoptimizeMaster?: boolean;
};

async function applyVariants(
  masterLabel: string,
  masterRel: string,
  buf: Buffer,
  options: BackfillOptions,
  exists: (relKey: string, width: UploadVariantWidth) => Promise<boolean>,
  write: (relKey: string, width: UploadVariantWidth, buffer: Buffer) => Promise<void>
): Promise<BackfillResult> {
  const result: BackfillResult = { master: masterLabel, created: [], skipped: [], errors: [] };
  const variants = await generateUploadVariants(buf, "image/webp");

  for (const v of variants) {
    if (v.maxWidth === 1920 && !options.reoptimizeMaster) continue;

    const relKey = variantRelativeKey(masterRel, v.maxWidth);
    const already = await exists(relKey, v.maxWidth);

    if (already && !options.force) {
      result.skipped.push(v.maxWidth);
      continue;
    }

    if (options.dryRun) {
      result.created.push(v.maxWidth);
      continue;
    }

    try {
      await write(relKey, v.maxWidth, v.buffer);
      result.created.push(v.maxWidth);
    } catch (e) {
      result.errors.push(`w${v.maxWidth}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return result;
}

/** Genera `-w320`, `-w640`, `-w1200` junto al master en disco. */
export async function backfillLocalMaster(
  mediaRoot: string,
  masterAbs: string,
  options: BackfillOptions = {}
): Promise<BackfillResult> {
  const masterRel = relKeyFromAbsolute(masterAbs, mediaRoot);
  let buf: Buffer;
  try {
    buf = await readFile(masterAbs);
  } catch (e) {
    return {
      master: masterAbs,
      created: [],
      skipped: [],
      errors: [`No se pudo leer: ${e instanceof Error ? e.message : String(e)}`],
    };
  }

  return applyVariants(
    masterAbs,
    masterRel,
    buf,
    options,
    async (relKey) => fileExists(join(mediaRoot, relKey)),
    async (relKey, _w, buffer) => writeLocalVariant(mediaRoot, relKey, buffer)
  );
}

/** Genera variantes en S3 para un objeto `media/…/foo.webp`. */
export async function backfillS3Master(s3Key: string, options: BackfillOptions = {}): Promise<BackfillResult> {
  const bucket = process.env.S3_BUCKET?.trim();
  const client = s3Client();

  if (!client || !bucket) {
    return { master: s3Key, created: [], skipped: [], errors: ["S3 no configurado (S3_BUCKET, credenciales)"] };
  }

  const masterRel = s3Key.replace(/^media\//, "");
  let buf: Buffer;
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: s3Key }));
    const body = res.Body;
    if (!body) throw new Error("Cuerpo vacío");
    buf = Buffer.from(await body.transformToByteArray());
  } catch (e) {
    return {
      master: s3Key,
      created: [],
      skipped: [],
      errors: [`GET: ${e instanceof Error ? e.message : String(e)}`],
    };
  }

  return applyVariants(
    s3Key,
    masterRel,
    buf,
    options,
    async (relKey) => s3ObjectExists(client, bucket, `media/${relKey}`),
    async (relKey, _w, buffer) => {
      await putWebPAtRelativeKey(`media/${relKey}`, buffer);
    }
  );
}

export function formatVariantSummary(widths: UploadVariantWidth[]): string {
  return widths.map((w) => `w${w}`).join(", ") || "—";
}
