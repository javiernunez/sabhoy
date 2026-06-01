import { SITE_URL } from "@/lib/constants";
import {
  isManagedWebpMedia,
  mediaUrlForVariant,
  pickVariantForDisplay,
  type UploadVariantWidth,
} from "@/lib/image-variants";

/** Resuelve rutas /media/... a URL absoluta (OG, JSON-LD, metadatos). */
export function absoluteMediaUrl(url: string | null | undefined): string | null {
  if (url == null || url === "") return null;
  const u = String(url).trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) {
    const base = SITE_URL.replace(/\/$/, "");
    return `${base}${u}`;
  }
  return u;
}

/** `/api/media/...` → `/media/...` para resolver variantes; la salida sigue pasando por `toApiMediaPath`. */
function pathForVariantLookup(u: string): string {
  if (u.startsWith("/api/media/")) {
    return `/media/${u.slice("/api/media/".length)}`;
  }
  return u;
}

function toApiMediaPath(u: string): string | null {
  if (u.startsWith("/media/")) {
    return `/api/media/${u.slice("/media/".length)}`;
  }
  if (u.startsWith("http://") || u.startsWith("https://")) {
    try {
      const parsed = new URL(u);
      if (parsed.pathname.startsWith("/media/")) {
        return `/api/media/${parsed.pathname.slice("/media/".length)}`;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export type UiMediaOptions = {
  /** Ancho CSS aproximado del hueco; elige variante `-w320`, `-w640`, etc. */
  displayWidth?: number;
  /** Ancho de variante explícito (prioridad sobre displayWidth). */
  variant?: UploadVariantWidth;
};

/**
 * Sirve /media/... vía /api/media/... (misma origen) para evitar desajustes en despliegue.
 * Con `displayWidth` o `variant` usa el WebP precortado (p. ej. listado 160px → `-w320.webp`).
 */
export function uiMediaUrl(url: string | null | undefined, options?: UiMediaOptions): string | null {
  if (url == null || url === "") return null;
  let u = String(url).trim();
  if (!u) return null;

  const variant =
    options?.variant ??
    (options?.displayWidth != null ? pickVariantForDisplay(options.displayWidth) : undefined);

  const variantPath = pathForVariantLookup(u);
  if (variant && isManagedWebpMedia(variantPath)) {
    u = mediaUrlForVariant(variantPath, variant);
  }

  const api = toApiMediaPath(u);
  if (api) return api;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return u;
}
