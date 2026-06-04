import Link from "next/link";
import type { Article } from "@prisma/client";
import { CategoryChip } from "@/components/CategoryChip";
import { uiMediaUrl } from "@/lib/media-url";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { getArticlePublishedAt } from "@/lib/article-dates";

type Props = {
  article: Pick<Article, "slug" | "title" | "content" | "summary" | "imageUrl" | "category" | "publishedAt"> & {
    createdAt?: Date;
  };
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Antetítulo / entradilla: prioriza resumen editorial. */
function standfirst(article: Props["article"]) {
  if (article.summary?.trim()) return stripMarkdownToPlain(article.summary);
  const fromContent = stripMarkdownToPlain(article.content);
  return fromContent.slice(0, 220) + (fromContent.length > 220 ? "…" : "");
}

export function HeroArticle({ article }: Props) {
  const img = uiMediaUrl(article.imageUrl, { displayWidth: 400 });
  const deck = standfirst(article);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {img ? (
        <div className="md:grid md:grid-cols-2 md:gap-0">
          <div className="relative aspect-[16/10] bg-slate-100 md:aspect-auto md:min-h-[260px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <ArticleBlock article={article} deck={deck} formatDate={formatDate} />
          </div>
        </div>
      ) : (
        <div className="p-6 md:p-8">
          <ArticleBlock article={article} deck={deck} formatDate={formatDate} />
        </div>
      )}
    </section>
  );
}

function ArticleBlock({
  article,
  deck,
  formatDate,
}: {
  article: Props["article"];
  deck: string;
  formatDate: (d: Date) => string;
}) {
  const publishedAt = getArticlePublishedAt(article);
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryChip category={article.category} />
        <time className="text-xs text-slate-500" dateTime={publishedAt.toISOString()}>
          {formatDate(publishedAt)}
        </time>
      </div>
      <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
        <Link href={`/noticias/${article.slug}`} className="hover:text-sab-terracotta-dark">
          {article.title}
        </Link>
      </h2>
      <p className="mt-3 text-base font-medium leading-relaxed text-slate-600 md:text-lg">{deck}</p>
      <span className="mt-5 inline-flex">
        <Link
          href={`/noticias/${article.slug}`}
          className="inline-flex w-fit items-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Leer noticia
        </Link>
      </span>
    </>
  );
}
