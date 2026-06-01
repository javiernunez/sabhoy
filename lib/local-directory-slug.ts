import type { DirectoryKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Prefijos históricos de `slugify(\`\${kind}-\${name}\`)` en el directorio. */
const DIRECTORY_KIND_SLUG_PREFIXES = ["commerce", "association", "sport", "politics"] as const;

/**
 * Variantes de slug a probar cuando la URL pública omite el prefijo de tipo
 * (p. ej. Google indexó `/comercios/sport-club-…` y en BD está `commerce-sport-club-…`).
 */
export function localDirectorySlugCandidates(raw: string): string[] {
  const s = raw.trim();
  if (!s) return [];
  const out: string[] = [];
  const add = (x: string) => {
    const t = x.trim();
    if (t && !out.includes(t)) out.push(t);
  };
  add(s);
  for (const p of DIRECTORY_KIND_SLUG_PREFIXES) {
    if (!s.startsWith(`${p}-`)) add(`${p}-${s}`);
  }
  return out;
}

type ResolvedPick = { id: number; slug: string; kind: DirectoryKind };

export async function findActiveDirectoryEntryByPublicSlug(slugParam: string): Promise<ResolvedPick | null> {
  for (const candidate of localDirectorySlugCandidates(slugParam)) {
    const row = await prisma.localDirectoryEntry.findFirst({
      where: { slug: candidate, isActive: true },
      select: { id: true, slug: true, kind: true },
    });
    if (row) return row;
  }
  return null;
}
