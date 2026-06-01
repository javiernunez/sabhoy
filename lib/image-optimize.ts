import sharp from "sharp";
import { UPLOAD_VARIANT_WIDTHS, type UploadVariantWidth } from "@/lib/image-variants";

const WEBP_Q = 82;
const EFFORT = 5;

export type OptimizeResult = { buffer: Buffer; width: number; height: number; bytes: number };

export type GeneratedVariant = {
  maxWidth: UploadVariantWidth;
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
};

/**
 * Rota EXIF, redimensiona sin ampliar, WebP.
 */
export async function optimizeImageToWebPAtWidth(
  input: Buffer,
  maxWidth: number,
  _mime?: string
): Promise<OptimizeResult> {
  if (!input.length) {
    throw new Error("Fichero vacio");
  }

  const rotated = sharp(input, { failOn: "none" }).rotate();
  const meta = await rotated.metadata();
  if (!meta.width) {
    throw new Error("No se pudo leer la imagen");
  }
  const piped = rotated.resize({
    width: maxWidth,
    height: maxWidth,
    fit: "inside",
    withoutEnlargement: true,
  });

  const buffer = await piped
    .webp({ quality: WEBP_Q, effort: EFFORT, smartSubsample: true, alphaQuality: 90 })
    .toBuffer();

  const o = await sharp(buffer).metadata();
  return {
    buffer,
    width: o.width || meta.width,
    height: o.height || meta.height || meta.width,
    bytes: buffer.length,
  };
}

/** @deprecated Usa generateUploadVariants; mantiene compatibilidad. */
export async function optimizeImageToWebP(input: Buffer, mime?: string): Promise<OptimizeResult> {
  return optimizeImageToWebPAtWidth(input, 1920, mime);
}

/**
 * Genera un WebP por cada ancho de UPLOAD_VARIANT_WIDTHS (sin ampliar).
 * Omite variantes más grandes que el original salvo el master (1920).
 */
export async function generateUploadVariants(input: Buffer, mime?: string): Promise<GeneratedVariant[]> {
  const rotated = sharp(input, { failOn: "none" }).rotate();
  const meta = await rotated.metadata();
  if (!meta.width) {
    throw new Error("No se pudo leer la imagen");
  }
  const sourceW = meta.width;

  const out: GeneratedVariant[] = [];
  for (const maxWidth of UPLOAD_VARIANT_WIDTHS) {
    if (maxWidth > sourceW && maxWidth !== 1920) continue;
    const result = await optimizeImageToWebPAtWidth(input, maxWidth, mime);
    const last = out[out.length - 1];
    if (last && last.bytes === result.bytes && last.width === result.width) continue;
    out.push({
      maxWidth,
      buffer: result.buffer,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  }

  if (out.length === 0) {
    const result = await optimizeImageToWebPAtWidth(input, sourceW, mime);
    out.push({
      maxWidth: 1920,
      buffer: result.buffer,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  }

  return out;
}

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export function isAllowedImageMime(mime: string) {
  return (
    mime === "image/jpeg" || mime === "image/png" || mime === "image/webp" || mime === "image/gif" || mime === "image/tiff"
  );
}
