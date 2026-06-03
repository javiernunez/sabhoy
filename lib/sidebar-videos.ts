import type { Video, VideoCategory } from "@prisma/client";
import type { FeaturedVideoItem } from "@/components/FeaturedVideosAside";
import { prisma } from "@/lib/prisma";

const VIDEO_SIDEBAR_SELECT_BASE = {
  id: true,
  url: true,
  description: true,
  descriptionVal: true,
  createdAt: true,
} as const;

function toFeaturedItem(video: {
  id: number;
  url: string;
  description: string;
  descriptionVal: string | null;
  createdAt: Date;
  slug?: string | null;
}): FeaturedVideoItem {
  return {
    id: video.id,
    url: video.url,
    description: video.description,
    descriptionVal: video.descriptionVal,
    createdAt: video.createdAt,
    slug: video.slug?.trim() || `video-${video.id}`,
  };
}

/** Vídeos del lateral/portada; no debe tumbar la página si falta migración o hay error de BD. */
export async function fetchSidebarVideos(take = 2): Promise<FeaturedVideoItem[]> {
  try {
    const rows = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: { ...VIDEO_SIDEBAR_SELECT_BASE, slug: true },
    });
    return rows.map(toFeaturedItem);
  } catch {
    try {
      const rows = await prisma.video.findMany({
        orderBy: { createdAt: "desc" },
        take,
        select: VIDEO_SIDEBAR_SELECT_BASE,
      });
      return rows.map(toFeaturedItem);
    } catch (error) {
      console.error("fetchSidebarVideos:", error);
      return [];
    }
  }
}

type PublicVideoRow = Pick<
  Video,
  "id" | "slug" | "url" | "description" | "descriptionVal" | "category" | "createdAt"
>;

function withFallbackSlug(video: Omit<PublicVideoRow, "slug"> & { slug?: string | null }): PublicVideoRow {
  return { ...video, slug: video.slug?.trim() || `video-${video.id}` };
}

/** Listado público de vídeos; tolerante si la columna slug aún no está migrada. */
export async function fetchPublicVideos(filterCategory?: VideoCategory): Promise<PublicVideoRow[]> {
  const where = filterCategory ? { category: filterCategory } : {};
  try {
    const rows = await prisma.video.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(withFallbackSlug);
  } catch {
    try {
      const rows = await prisma.video.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          description: true,
          descriptionVal: true,
          category: true,
          createdAt: true,
        },
      });
      return rows.map(withFallbackSlug);
    } catch (error) {
      console.error("fetchPublicVideos:", error);
      return [];
    }
  }
}
