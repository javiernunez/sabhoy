import { prisma } from "@/lib/prisma";

/**
 * Resuelve un evento por slug tolerando:
 * - URLs antiguas con sufijo `-<timestamp>` tras colisión de slug al crear/editar.
 */
export async function findActiveEventByPublicSlug(slugParam: string) {
  const slug = slugParam.trim();
  if (!slug) return null;

  const direct = await prisma.event.findUnique({ where: { slug } });
  if (direct) {
    return direct.status === "active" ? direct : null;
  }

  const suffix = slug.match(/^(.*)-(\d{10,15})$/);
  if (suffix) {
    const base = suffix[1];
    if (base && base !== slug) {
      const byBase = await prisma.event.findUnique({ where: { slug: base } });
      if (byBase && byBase.status === "active") return byBase;
    }
  }

  return null;
}
