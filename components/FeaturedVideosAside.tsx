import Link from "next/link";
import type { Video } from "@prisma/client";
import { LazyYouTubeEmbed } from "@/components/LazyYouTubeEmbed";
import { SectionHeader } from "@/components/SectionHeader";
import { localizedText } from "@/lib/localized";
import { getYouTubeEmbedUrl } from "@/lib/video";
import { videoPlainTitle, videoPublicPath } from "@/lib/video-slug";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

export type FeaturedVideoItem = Pick<
  Video,
  "id" | "slug" | "url" | "description" | "descriptionVal" | "createdAt"
>;

type Props = {
  videos: FeaturedVideoItem[];
  locale: "es" | "val";
  linkClassName?: string;
  trackContext?: string;
};

function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function FeaturedVideosAside({
  videos,
  locale,
  linkClassName = "text-sab-terracotta hover:text-sab-forest",
  trackContext = "featured_videos",
}: Props) {
  const isVal = locale === "val";

  return (
    <section>
      <SectionHeader
        title={isVal ? "Vídeos destacats" : "Videos destacados"}
        icon="🎥"
        subtitle={
          isVal
            ? "Els dos vídeos més recents publicats en la web."
            : "Los dos videos más recientes publicados en la web."
        }
        href="/videos"
        actionLabel={isVal ? "Veure més vídeos" : "Ver más videos"}
        trackContext={trackContext}
      />
      <div className="space-y-3">
        {videos.length === 0 ? (
          <p className="text-sm text-slate-600">
            {isVal ? "Encara no hi ha vídeos publicats." : "Todavía no hay videos publicados."}
          </p>
        ) : (
          videos.map((video) => {
            const embedUrl = getYouTubeEmbedUrl(video.url);
            const localizedDescription =
              localizedText(locale, video.description, video.descriptionVal) || "";
            const title = videoPlainTitle(localizedDescription);
            const excerpt = truncateWords(stripMarkdownToPlain(localizedDescription), 30);

            return (
              <article
                key={video.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:border-sab-terracotta/30"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {new Intl.DateTimeFormat(isVal ? "ca-ES" : "es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(video.createdAt)}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                  <Link href={videoPublicPath(video.slug)} className="hover:underline">
                    {title}
                  </Link>
                </h3>
                {excerpt ? <p className="mt-1 line-clamp-3 text-sm text-slate-600">{excerpt}</p> : null}
                {embedUrl ? <LazyYouTubeEmbed embedUrl={embedUrl} title={title} /> : null}
                <Link
                  href={videoPublicPath(video.slug)}
                  className={`mt-2 inline-block text-sm font-semibold hover:underline ${linkClassName}`}
                >
                  {isVal ? "Veure vídeo →" : "Ver vídeo →"}
                </Link>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
