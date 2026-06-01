/** Anchos generados al subir (sufijo `-w{N}.webp`). El master en BBDD es el de 1920px máx. */
export const UPLOAD_VARIANT_WIDTHS = [1920, 1200, 640, 320] as const;

export type UploadVariantWidth = (typeof UPLOAD_VARIANT_WIDTHS)[number];

/** Hero en artículo / evergreen (`max-w-4xl` ≈ 56rem). */
export const CSS_ARTICLE_HERO_WIDTH = 768;
/** Imágenes en cuerpo prose (`max-w-2xl` ≈ 42rem). */
export const CSS_ARTICLE_BODY_IMAGE_WIDTH = 672;
/** Hero ficha comercio o asociación (`max-w-5xl`, ~h-56). */
export const CSS_DIRECTORY_HERO_WIDTH = 640;
/** Cabecera en tarjeta de listado de asociaciones (`h-40`). */
export const CSS_DIRECTORY_CARD_HEADER_WIDTH = 320;

/** Variante recomendada según ancho CSS aproximado (×2 retina). */
export function pickVariantForDisplay(cssWidth: number): UploadVariantWidth {
  const target = Math.ceil(cssWidth * 2);
  if (target <= 360) return 320;
  if (target <= 720) return 640;
  if (target <= 1400) return 1200;
  return 1920;
}

/** ¿URL de media propia optimizada con variantes? */
export function isManagedWebpMedia(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith("/media/") && u.endsWith(".webp")) return true;
  try {
    const parsed = new URL(u);
    return parsed.pathname.startsWith("/media/") && parsed.pathname.endsWith(".webp");
  } catch {
    return false;
  }
}

/**
 * Ruta/URL master → variante `-w320.webp`, etc.
 * Si no es media gestionada, devuelve la URL original.
 */
export function mediaUrlForVariant(url: string, variantWidth: UploadVariantWidth): string {
  if (!isManagedWebpMedia(url)) return url;
  if (variantWidth === 1920) return url;

  const suffix = `-w${variantWidth}.webp`;
  if (url.startsWith("/")) {
    return url.replace(/\.webp$/i, suffix);
  }
  try {
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname.replace(/\.webp$/i, suffix);
    return parsed.toString();
  } catch {
    return url;
  }
}

/** `2025/05/foo-w320.webp` → `2025/05/foo.webp` para fallback en el proxy. */
export function masterPathFromVariantPath(pathParts: string[]): string[] | null {
  const last = pathParts[pathParts.length - 1];
  if (!last) return null;
  const m = /^(.+)-w\d+\.webp$/i.exec(last);
  if (!m) return null;
  return [...pathParts.slice(0, -1), `${m[1]}.webp`];
}

export function variantRelativeKey(stemRelative: string, width: UploadVariantWidth): string {
  const base = stemRelative.replace(/\.webp$/i, "");
  return width === 1920 ? `${base}.webp` : `${base}-w${width}.webp`;
}
