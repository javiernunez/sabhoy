import { prisma } from "@/lib/prisma";

/** Garantiza como mucho un artículo con isHero en true. */
export async function clearHeroExcept(keepId: number) {
  await prisma.article.updateMany({
    where: { NOT: { id: keepId } },
    data: { isHero: false },
  });
}
