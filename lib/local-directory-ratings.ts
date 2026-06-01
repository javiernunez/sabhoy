import { prisma } from "@/lib/prisma";

export async function refreshDirectoryEntryRating(entryId: number) {
  const stats = await prisma.localDirectoryReview.aggregate({
    where: { entryId },
    _avg: { score: true },
    _count: { _all: true },
  });

  const ratingAverage = stats._avg.score ?? 0;
  const ratingCount = stats._count._all;

  await prisma.localDirectoryEntry.update({
    where: { id: entryId },
    data: { ratingAverage, ratingCount },
  });
}
