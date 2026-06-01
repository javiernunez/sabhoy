import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { canonicalFromPathnameSearch, canonicalPath } from "@/lib/seo";
import { renderMarkdown } from "@/lib/render-markdown";
import { getYouTubeEmbedUrl } from "@/lib/video";
import { VIDEO_CATEGORIES, videoCategoryLabel, isVideoCategory } from "@/lib/video-categories";
import type { VideoCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: { categoria?: string } };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const raw = searchParams.categoria;
  const hasCat = isVideoCategory(raw);
  const label = hasCat && raw ? videoCategoryLabel[raw] : null;
  const pageUrl = hasCat && raw
    ? canonicalFromPathnameSearch("/videos", { categoria: raw })
    : canonicalPath("/videos");
  const description = label
    ? `Vídeos de San Antonio de Benagéber, categoría ${label}.`
    : "Videos de San Antonio de Benagéber: entrevistas, reportajes y contenido local.";

  return {
    title: label ? `Videos: ${label}` : "Videos",
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      title: label ? `Videos: ${label} | ${SITE_NAME}` : `Videos de San Antonio de Benagéber | ${SITE_NAME}`,
      description,
      url: pageUrl,
      locale: "es_ES",
      siteName: SITE_NAME,
    },
  };
}

export default async function VideosPage({ searchParams }: PageProps) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const raw = searchParams.categoria;
  const filterCategory: VideoCategory | undefined = isVideoCategory(raw) ? raw : undefined;
  const videos = await prisma.video.findMany({
    where: filterCategory ? { category: filterCategory } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page max-w-4xl">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{isVal ? "Vídeos" : "Videos"}</h1>
        <p className="mt-2 max-w-2xl font-serif text-base text-slate-600">
          {isVal
            ? "Llistat de vídeos publicats. Filtra per categoria o recorre el conjunt complet."
            : "Listado de videos publicados. Filtra por categoría o recorre el conjunto completo."}
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterLink
          href="/videos"
          active={!filterCategory}
          label={isVal ? "Tots" : "Todos"}
        />
        {VIDEO_CATEGORIES.map((c) => (
          <FilterLink
            key={c}
            href={`/videos?categoria=${c}`}
            active={filterCategory === c}
            label={videoCategoryLabel[c]}
          />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {videos.length === 0 ? (
          <p className="text-sm text-slate-600">{isVal ? "Encara no hi ha vídeos publicats." : "Todavía no hay videos publicados."}</p>
        ) : (
          videos.map((video) => {
            const embedUrl = getYouTubeEmbedUrl(video.url);
            return (
              <article key={video.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {new Intl.DateTimeFormat("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(video.createdAt)}
                </p>
                <div className="prose-article mt-1 max-w-2xl text-sm text-slate-700">
                  {renderMarkdown(localizedText(locale, video.description, video.descriptionVal) || "")}
                </div>
                {embedUrl ? (
                  <div className="relative mt-3 w-full overflow-hidden rounded-xl pt-[56.25%]">
                    <iframe
                      src={embedUrl}
                      title={video.description}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : null}
                <Link
                  href={video.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  {isVal ? "Veure vídeo →" : "Ver video →"}
                </Link>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "inline-flex items-center rounded-full border-2 border-blue-600 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-900"
          : "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300"
      }
    >
      {label}
    </Link>
  );
}
