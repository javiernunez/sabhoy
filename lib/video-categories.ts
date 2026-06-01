import type { VideoCategory } from "@prisma/client";

export const VIDEO_CATEGORIES: VideoCategory[] = ["GENERAL", "POLITICA"];

export const videoCategoryLabel: Record<VideoCategory, string> = {
  GENERAL: "General",
  POLITICA: "Política",
};

export function isVideoCategory(value: string | null | undefined): value is VideoCategory {
  return value != null && value !== "" && (VIDEO_CATEGORIES as string[]).includes(value);
}
