import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedVideosAside } from "@/components/FeaturedVideosAside";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { LazyYouTubeEmbed } from "@/components/LazyYouTubeEmbed";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/render-markdown";
import { canonicalPath } from "@/lib/seo";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { getYouTubeEmbedUrl } from "@/lib/video";
import { videoCategoryLabel } from "@/lib/video-categories";
import {
  findVideoByPublicSlug,
  videoPlainTitle,
  videoPublicPath,
} from "@/lib/video-slug";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await findVideoByPublicSlug(params.slug);
  if (!video) {
    return {
      title: "Vídeo no encontrado",
      robots: { index: false, follow: true },
    };
  }

  const plain = stripMarkdownToPlain(video.description);
  const title = videoPlainTitle(plain);
  const pageUrl = canonicalPath(videoPublicPath(video.slug));

  return {
    title,
    description: plain.slice(0, 160),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "video.other",
      title: `${title} | ${SITE_NAME}`,
      description: plain.slice(0, 200),
      url: pageUrl,
      locale: "es_ES",
      siteName: SITE_NAME,
    },
  };
}

export default async function VideoDetailPage({ params }: Props) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const video = await findVideoByPublicSlug(params.slug);
  if (!video) {
    notFound();
  }

  const localizedDescription = localizedText(locale, video.description, video.descriptionVal) || "";
  const title = videoPlainTitle(localizedDescription);
  const embedUrl = getYouTubeEmbedUrl(video.url);
  const pageUrl = `${SITE_URL}${videoPublicPath(video.slug)}`;

  const sidebarVideos = await prisma.video.findMany({
    where: { NOT: { id: video.id } },
    orderBy: { createdAt: "desc" },
    take: 2,
    select: {
      id: true,
      slug: true,
      url: true,
      description: true,
      descriptionVal: true,
      createdAt: true,
    },
  });

  return (
    <div className="container-page max-w-6xl">
      <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
        <article className="min-w-0 lg:col-span-2">
          <Link href="/videos" className="inline-block text-sm font-semibold text-sab-terracotta hover:underline">
            {isVal ? "← Tornar a vídeos" : "← Volver a videos"}
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {videoCategoryLabel[video.category]}
            <span className="mx-2 text-slate-300">·</span>
            <time dateTime={video.createdAt.toISOString()}>
              {new Intl.DateTimeFormat(isVal ? "ca-ES" : "es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(video.createdAt)}
            </time>
          </p>
          <SharePlatformsRow url={pageUrl} title={title} isVal={isVal} className="mt-3" />
          <h1 className="mt-3 font-serif text-2xl font-bold leading-tight text-slate-900 md:text-3xl">{title}</h1>
          {embedUrl ? (
            <div className="mt-6 max-w-3xl">
              <LazyYouTubeEmbed embedUrl={embedUrl} title={title} />
            </div>
          ) : null}
          {localizedDescription.trim() ? (
            <div className="prose-article mt-6 max-w-2xl text-slate-700">
              {renderMarkdown(localizedDescription.trim())}
            </div>
          ) : null}
          <p className="mt-6">
            <a
              href={video.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-semibold text-sab-terracotta hover:text-sab-forest hover:underline"
            >
              {isVal ? "Obrir en YouTube ↗" : "Abrir en YouTube ↗"}
            </a>
          </p>
        </article>

        <aside className="lg:col-span-1">
          <FeaturedVideosAside
            videos={sidebarVideos}
            locale={locale}
            trackContext="video_detail_sidebar"
          />
        </aside>
      </div>
    </div>
  );
}
