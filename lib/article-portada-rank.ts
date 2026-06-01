import { prisma } from "@/lib/prisma";

/** Siguiente valor de `portadaRank` para una noticia recién publicada (mayor = más arriba en portada). */
export async function nextPortadaRankForPublished(): Promise<number> {
  const agg = await prisma.article.aggregate({
    where: { status: "published" },
    _max: { portadaRank: true },
  });
  return (agg._max.portadaRank ?? 0) + 1;
}
