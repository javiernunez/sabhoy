import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

/** Ruta bajo el dominio canónico (p. ej. `/noticias`), sin query. */
export function canonicalPath(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** URL canónica con query ordenada (para listados filtrados). */
export function canonicalFromPathnameSearch(pathname: string, searchParams: Record<string, string | string[] | undefined>) {
  const base = SITE_URL.replace(/\/$/, "");
  const u = new URL(pathname, base);
  const keys = Object.keys(searchParams).filter((k) => searchParams[k] != null && searchParams[k] !== "").sort();
  for (const k of keys) {
    const v = searchParams[k];
    if (Array.isArray(v)) v.forEach((x) => u.searchParams.append(k, x));
    else if (v != null) u.searchParams.set(k, v);
  }
  return u.toString();
}

export function truncateMetaDescription(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").replace(/^[\s#]+/g, "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const safe = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim();
  return `${safe}…`;
}

/** Quita pictogramas Unicode (emojis) para metadescripciones más limpias en resultados de búsqueda y redes. */
export function stripSnippetEmojis(text: string): string {
  return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
}

/** Texto plano breve a partir de contenido de página evergreen (markdown). */
export function metaFromEvergreenContent(content: string): string {
  return truncateMetaDescription(stripMarkdownToPlain(content), 160);
}

export const SEO_NOINDEX: NonNullable<Metadata["robots"]> = { index: false, follow: true };

export const DEFAULT_SITE_KEYWORDS = [
  "San Antonio de Benagéber",
  "SAB",
  "Sant Antoni de Benaixeve",
  "Camp de Túria",
  "Comunitat Valenciana",
  "Valencia",
  "noticias SAB",
  "noticias San Antonio de Benagéber",
  "actualidad SAB",
  "El Nostre Poble SAB",
  "Montesano",
  "Colinas de San Antonio",
] as const;
