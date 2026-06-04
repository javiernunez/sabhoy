import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLdNewsArticle } from "@/components/JsonLdNewsArticle";
import { CategoryChip } from "@/components/CategoryChip";
import { ArticleCommentsSection } from "@/components/ArticleCommentsSection";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { articleCategoryLabel } from "@/lib/article-categories";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { CSS_ARTICLE_HERO_WIDTH } from "@/lib/image-variants";
import { absoluteMediaUrl, uiMediaUrl } from "@/lib/media-url";
import { renderMarkdown } from "@/lib/render-markdown";
import { prisma } from "@/lib/prisma";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { canonicalPath, truncateMetaDescription } from "@/lib/seo";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { getArticlePublishedAt } from "@/lib/article-dates";

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
};

function formatDate(date: Date, locale: "es" | "val") {
  return new Intl.DateTimeFormat(locale === "val" ? "ca-ES" : "es-ES", { dateStyle: "long" }).format(date);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article || article.status !== "published") {
    return {
      title: "Noticia no encontrada",
      robots: { index: false, follow: true },
    };
  }

  const rawDesc = article.summary || article.content;
  const desc = truncateMetaDescription(stripMarkdownToPlain(rawDesc), 160);
  const og = absoluteMediaUrl(article.imageUrl);
  const pageUrl = canonicalPath(`/noticias/${article.slug}`);
  const publishedAt = getArticlePublishedAt(article);

  return {
    title: article.title,
    description: desc,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: article.title,
      description: desc,
      type: "article",
      url: pageUrl,
      locale: "es_ES",
      siteName: SITE_NAME,
      publishedTime: publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: og ? [{ url: og, width: 1200, height: 630, alt: article.title }] : undefined,
    },
    twitter: {
      card: og ? "summary_large_image" : "summary",
      title: article.title,
      description: desc,
      images: og ? [og] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article || article.status !== "published") {
    notFound();
  }

  const localizedTitle = localizedText(locale, article.title, article.titleVal);
  const localizedSummary = localizedText(locale, article.summary, article.summaryVal) || null;
  const localizedContent = localizedText(locale, article.content, article.contentVal);

  const url = `${SITE_URL}/noticias/${article.slug}`;
  const description = truncateMetaDescription(localizedSummary || localizedContent, 160);
  const mainImage = uiMediaUrl(article.imageUrl, { displayWidth: CSS_ARTICLE_HERO_WIDTH }) || "";
  const isRemoteImage = /^https?:\/\//i.test(mainImage);
  const sectionLabel = articleCategoryLabel[article.category];
  const publishedAt = getArticlePublishedAt(article);
  const [relatedArticles, articleComments] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "published",
        NOT: { id: article.id },
        OR: [{ category: article.category }, { isHero: true }],
      },
      orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }],
      take: 3,
      select: {
        slug: true,
        title: true,
        titleVal: true,
        summary: true,
        summaryVal: true,
        imageUrl: true,
      },
    }),
    prisma.articleComment.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: { id: true, author: true, content: true, createdAt: true },
    }),
  ]);

  const initialArticleComments = articleComments.map((c) => ({
    id: c.id,
    author: c.author,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <>
      {mainImage && !isRemoteImage ? (
        <link rel="preload" as="image" href={mainImage} fetchPriority="high" />
      ) : null}
      <JsonLdBreadcrumbList
        items={[
          { name: isVal ? "Inici" : "Inicio", path: "/" },
          { name: isVal ? "Notícies" : "Noticias", path: "/noticias" },
          { name: localizedTitle, path: `/noticias/${article.slug}` },
        ]}
      />
      <JsonLdNewsArticle
        title={localizedTitle}
        description={description}
        datePublished={publishedAt.toISOString()}
        dateModified={article.updatedAt.toISOString()}
        url={url}
        imageUrl={article.imageUrl}
        articleSection={sectionLabel}
      />
      <article className="container-page max-w-3xl">
        <header className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <CategoryChip category={article.category} />
            <time dateTime={publishedAt.toISOString()} className="tabular-nums">
              {formatDate(publishedAt, locale)}
            </time>
          </div>
          <SharePlatformsRow url={url} title={localizedTitle} isVal={isVal} className="min-w-0 shrink-0 sm:max-w-[min(28rem,100%)]" />
        </header>
        <h1 className="mt-4 max-w-4xl font-serif text-3xl font-bold leading-[1.12] tracking-tight text-slate-900 md:text-4xl lg:text-[2.4rem]">
          {localizedTitle}
        </h1>
        {localizedSummary ? (
          <div className="prose-article mt-5 max-w-3xl border-l-[3px] border-slate-800 pl-4 font-serif text-lg font-medium leading-snug text-slate-700 md:text-xl [&_p]:!mb-4 [&_p:last-child]:!mb-0">
            {renderMarkdown(localizedSummary.trim())}
          </div>
        ) : null}
        {mainImage ? (
          <div className="mt-8 max-w-4xl">
            {isRemoteImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={localizedTitle} className="w-full object-cover" loading="eager" />
            ) : (
              <Image
                src={mainImage}
                alt={localizedTitle}
                width={1200}
                height={675}
                className="w-full object-cover"
                priority
                sizes="(max-width: 48rem) 100vw, 48rem"
              />
            )}
          </div>
        ) : null}
        <div className="prose-article mt-8 max-w-2xl font-serif text-lg leading-[1.75] text-slate-800">
          {renderMarkdown(localizedContent)}
        </div>
        <ArticleCommentsSection slug={article.slug} locale={locale} initialComments={initialArticleComments} />
        <RelatedLinksSection
          title={isVal ? "Altres notícies" : "Otras noticias"}
          subtitle={isVal ? "Continua llegint continguts relacionats." : "Sigue leyendo contenidos relacionados."}
          items={relatedArticles.map((item) => ({
            href: `/noticias/${item.slug}`,
            title: localizedText(locale, item.title, item.titleVal),
            description: localizedText(locale, item.summary, item.summaryVal) || undefined,
            imageUrl: item.imageUrl || null,
          }))}
        />
      </article>
    </>
  );
}
