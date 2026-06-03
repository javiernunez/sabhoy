import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

export function videoSlugBaseFromDescription(description: string): string {
  const plain = stripMarkdownToPlain(description);
  const short = plain.slice(0, 80).trim();
  return slugify(short) || "video";
}

export async function resolveUniqueVideoSlug(base: string, excludeId?: number): Promise<string> {
  const root = (base || "video").slice(0, 120);
  for (let n = 0; n < 1000; n++) {
    const candidate = n === 0 ? root : `${root}-${n}`;
    const existing = await prisma.video.findFirst({
      where: {
        slug: candidate,
        ...(excludeId != null ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export function videoPublicPath(slug: string): string {
  const trimmed = slug?.trim();
  return `/videos/${trimmed || "video-0"}`;
}

export function videoPlainTitle(description: string, maxLen = 140): string {
  const plain = stripMarkdownToPlain(description).trim();
  if (!plain) return "Vídeo";
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1).trimEnd()}…`;
}

export async function findVideoByPublicSlug(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const idMatch = /^video-(\d+)$/.exec(trimmed);
  if (idMatch) {
    const id = Number(idMatch[1]);
    if (!Number.isNaN(id)) {
      return prisma.video.findUnique({ where: { id } });
    }
  }

  try {
    return await prisma.video.findUnique({ where: { slug: trimmed } });
  } catch {
    return null;
  }
}

export async function assignVideoSlug(videoId: number, description: string): Promise<string> {
  const base = videoSlugBaseFromDescription(description);
  const slug = await resolveUniqueVideoSlug(base, videoId);
  await prisma.video.update({ where: { id: videoId }, data: { slug } });
  return slug;
}
