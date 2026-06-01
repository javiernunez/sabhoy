import type { Metadata } from "next";
import Link from "next/link";
import { CtaLink } from "@/components/CtaLink";
import { NewsCard } from "@/components/NewsCard";
import { SITE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { canonicalFromPathnameSearch, canonicalPath } from "@/lib/seo";
import { ARTICLE_CATEGORIES, articleCategoryLabel, isArticleCategory } from "@/lib/article-categories";
import type { ArticleCategory } from "@prisma/client";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";

type Props = {
  searchParams: { categoria?: string };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = searchParams.categoria;
  const hasCat = isArticleCategory(raw);
  const label = hasCat && raw ? articleCategoryLabel[raw] : null;
  const pageUrl = hasCat && raw
    ? canonicalFromPathnameSearch("/noticias", { categoria: raw })
    : canonicalPath("/noticias");
  const description = label
    ? `Noticias de San Antonio de Benagéber: categoría ${label}. Actualidad y sucesos locales, Camp de Túria, Valencia.`
    : "Qué pasa en San Antonio de Benagéber: actualidad, política local, sucesos, cultura y deporte. Noticias de la Camp de Túria, Comunitat Valenciana.";

  return {
    title: label ? `Noticias: ${label}` : "Noticias de San Antonio de Benagéber",
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      title: label ? `Noticias: ${label} | ${SITE_NAME}` : `Noticias de San Antonio de Benagéber | ${SITE_NAME}`,
      description,
      url: pageUrl,
      locale: "es_ES",
      siteName: SITE_NAME,
    },
  };
}

export default async function NewsPage({ searchParams }: Readonly<Props>) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const raw = searchParams.categoria;
  const filterCategory: ArticleCategory | undefined = isArticleCategory(raw) ? raw : undefined;

  const articles = await prisma.article.findMany({
    where: { ...(filterCategory ? { category: filterCategory } : {}), status: "published" },
    orderBy: { createdAt: "desc" },
  });

  const localizedArticles = articles.map((article) => ({
    ...article,
    title: localizedText(locale, article.title, article.titleVal),
    summary: localizedText(locale, article.summary, article.summaryVal) || null,
    content: localizedText(locale, article.content, article.contentVal),
  }));
  const [lead, ...rest] = localizedArticles;

  return (
    <div className="container-page max-w-3xl">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Noticias</h1>
        <p className="mt-2 max-w-2xl font-serif text-base text-slate-600">
          {isVal
            ? "Actualitat i successos a San Antonio de Benagéber, Camp de Túria. Filtra per temàtica o recorre la cronologia."
            : "Actualidad y sucesos en L&apos;Eliana, Camp de Túria. Filtra por temática o recorre la cronología."}
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterLink href="/noticias" active={!filterCategory} label={isVal ? "Totes" : "Todas"} />
        {ARTICLE_CATEGORIES.map((c) => (
          <FilterLink
            key={c}
            href={`/noticias?categoria=${c}`}
            active={filterCategory === c}
            label={articleCategoryLabel[c]}
          />
        ))}
      </div>

      <div className="mt-8">
        {articles.length === 0 ? (
          <p className="text-sm text-slate-600">{isVal ? "No hi ha notícies en esta categoria encara." : "No hay noticias en esta categoría todavía."}</p>
        ) : (
          <>
            {lead ? <NewsCard key={lead.id} article={lead} lead /> : null}
            <div className="divide-y divide-slate-200">
              {rest.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </div>

      <section className="mt-10 grid gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-blue-900">{isVal ? "Has vist alguna incidència al teu barri?" : "¿Has visto alguna incidencia en tu barrio?"}</p>
          <p className="mt-1 text-sm text-blue-800/90">
            {isVal ? "Envia-la i la revisem abans de publicar-la." : "Envíala y la revisamos antes de publicarla."}
          </p>
        </div>
        <div className="flex items-center justify-start gap-3 md:justify-end">
          <CtaLink
            href="/denuncias/nueva"
            trackParams={{ cta_name: "news_send_report", cta_context: "news_page_bottom", destination: "/denuncias/nueva" }}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            {isVal ? "Enviar denúncia" : "Enviar incidencia"}
          </CtaLink>
          <CtaLink
            href="/eventos"
            trackParams={{ cta_name: "news_view_events", cta_context: "news_page_bottom", destination: "/eventos" }}
            className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
          >
            {isVal ? "Veure agenda" : "Ver agenda"}
          </CtaLink>
        </div>
      </section>
    </div>
  );
}

function FilterLink({ href, active, label }: Readonly<{ href: string; active: boolean; label: string }>) {
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
