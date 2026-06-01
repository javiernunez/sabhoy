import Link from "next/link";
import type { Article } from "@prisma/client";
import { CategoryChip } from "@/components/CategoryChip";
import { UiImage } from "@/components/UiImage";
import { uiMediaUrl } from "@/lib/media-url";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

type Props = {
  article: Pick<Article, "slug" | "title" | "content" | "summary" | "category" | "createdAt" | "imageUrl">;
  compact?: boolean;
  /** Primera noticia del listado: titular grande y entradilla clara (estilo cabecera de sección). */
  lead?: boolean;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function standfirst(article: Props["article"]) {
  if (article.summary?.trim()) return stripMarkdownToPlain(article.summary);
  const fromContent = stripMarkdownToPlain(article.content);
  return fromContent.slice(0, 180) + (fromContent.length > 180 ? "…" : "");
}

export function NewsCard({ article, compact = false, lead = false }: Props) {
  const img = uiMediaUrl(article.imageUrl, { displayWidth: lead ? 600 : 160 });
  const deck = standfirst(article);

  if (lead) {
    return (
      <article className="border-b border-slate-200 pb-8 pt-2">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <CategoryChip category={article.category} />
          <time dateTime={article.createdAt.toISOString()}>{formatDate(article.createdAt)}</time>
        </div>
        {img ? (
          <Link href={`/noticias/${article.slug}`} className="mb-5 block overflow-hidden rounded-sm">
            <UiImage
              src={article.imageUrl}
              alt={article.title}
              priority
              displayWidth={600}
              width={1200}
              height={514}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="aspect-[21/9] h-auto w-full object-cover md:aspect-[2.4/1]"
            />
          </Link>
        ) : null}
        <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl lg:text-[2rem]">
          <Link href={`/noticias/${article.slug}`} className="hover:text-slate-700">
            {article.title}
          </Link>
        </h2>
        <p className="mt-3 font-serif text-lg font-medium leading-snug text-slate-600 md:text-xl">{deck}</p>
        <Link
          href={`/noticias/${article.slug}`}
          className="mt-4 inline-block text-sm font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
        >
          Seguir leyendo
        </Link>
      </article>
    );
  }

  return (
    <article
      className={`group min-w-0 py-5 ${
        compact ? "flex flex-col sm:flex-row sm:gap-4" : "flex flex-col gap-4 sm:flex-row sm:items-start"
      }`}
    >
      {img && !compact ? (
        <Link
          href={`/noticias/${article.slug}`}
          className="relative block h-28 w-full shrink-0 overflow-hidden rounded-sm sm:h-24 sm:w-40"
        >
          <UiImage
            src={article.imageUrl}
            alt={article.title}
            displayWidth={160}
            width={320}
            height={192}
            sizes="160px"
            className="h-full w-full object-cover transition group-hover:opacity-95"
          />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <CategoryChip category={article.category} />
          <time dateTime={article.createdAt.toISOString()}>{formatDate(article.createdAt)}</time>
        </div>
        <h3 className="font-serif text-lg font-semibold leading-snug text-slate-900 md:text-xl">
          <Link href={`/noticias/${article.slug}`} className="hover:text-slate-700">
            {article.title}
          </Link>
        </h3>
        <p
          className={`mt-2 font-serif text-sm font-medium leading-relaxed text-slate-600 md:text-base ${
            compact ? "line-clamp-2" : "line-clamp-2 md:line-clamp-3"
          }`}
        >
          {deck}
        </p>
      </div>
    </article>
  );
}
