import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { GeneratedVariant } from "@/lib/image-optimize";
import { variantRelativeKey } from "@/lib/image-variants";

function slugifyForFilename(input: string): string {
  const base = input.replace(/\.[^/.]+$/, "");
  const normalized = base
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 64);
  return normalized || "imagen";
}

function keyPath(originalName?: string): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const seo = slugifyForFilename(originalName || "");
  const short = randomUUID().slice(0, 8);
  return `${y}/${m}/${y}-${m}-${day}-${seo}-${short}.webp`;
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

/**
 * Sube WebP. Devuelve path para guardar en BBDD: URL absoluta (S3) o path relativo /media/...
 */
export async function storeWebP(buffer: Buffer, cacheControl = "public, max-age=31536000, immutable"): Promise<string> {
  const publicPrefix = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const bucket = process.env.S3_BUCKET?.trim();
  const client = s3Client();
  if (client && bucket && publicPrefix) {
    const key = `media/${keyPath()}`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: "image/webp",
        CacheControl: cacheControl,
        ContentLength: buffer.length,
      })
    );
    const base = publicPrefix.replace(/\/$/, "");
    const k = key.replace(/^\//, "");
    return `${base}/${k}`;
  }

  const rel = `media/${keyPath()}`;
  const outDir = join(process.cwd(), "public", dirnameOf(rel));
  await mkdir(outDir, { recursive: true });
  const filePath = join(process.cwd(), "public", rel);
  await writeFile(filePath, buffer);
  return `/${rel}`;
}

/** Escribe un WebP en `media/…` (disco local o S3 según env). */
export async function putWebPAtRelativeKey(
  relKey: string,
  buffer: Buffer,
  cacheControl = "public, max-age=31536000, immutable"
): Promise<string> {
  const publicPrefix = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const bucket = process.env.S3_BUCKET?.trim();
  const client = s3Client();
  const key = relKey.startsWith("media/") ? relKey : `media/${relKey}`;

  if (client && bucket && publicPrefix) {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: "image/webp",
        CacheControl: cacheControl,
        ContentLength: buffer.length,
      })
    );
    const base = publicPrefix.replace(/\/$/, "");
    return `${base}/${key.replace(/^\//, "")}`;
  }

  const outDir = join(process.cwd(), "public", dirnameOf(key));
  await mkdir(outDir, { recursive: true });
  const filePath = join(process.cwd(), "public", key);
  await writeFile(filePath, buffer);
  return `/${key}`;
}

export async function storeWebPWithName(
  buffer: Buffer,
  originalName: string,
  cacheControl = "public, max-age=31536000, immutable"
): Promise<string> {
  return putWebPAtRelativeKey(keyPath(originalName), buffer, cacheControl);
}

export type StoredUploadVariant = { width: number; url: string; bytes: number; height: number };

/**
 * Guarda todas las variantes con el mismo stem (p. ej. `…-w320.webp`, master `….webp`).
 * La URL master (1920) es la que se guarda en BBDD.
 */
export async function storeUploadVariantSet(
  variants: GeneratedVariant[],
  originalName: string
): Promise<{ url: string; variants: StoredUploadVariant[] }> {
  const stem = keyPath(originalName);
  const stored: StoredUploadVariant[] = [];

  await Promise.all(
    variants.map(async (v) => {
      const relKey = variantRelativeKey(stem, v.maxWidth);
      const url = await putWebPAtRelativeKey(relKey, v.buffer);
      stored.push({
        width: v.maxWidth,
        url,
        bytes: v.bytes,
        height: v.height,
      });
    })
  );

  const master =
    stored.find((s) => s.width === 1920) ??
    stored.reduce((a, b) => (a.width > b.width ? a : b));

  return { url: master.url, variants: stored.sort((a, b) => b.width - a.width) };
}

function dirnameOf(rel: string) {
  const i = rel.lastIndexOf("/");
  return i === -1 ? "" : rel.slice(0, i);
}
