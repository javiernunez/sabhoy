import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/render-markdown";
import { canonicalPath, metaFromEvergreenContent, truncateMetaDescription } from "@/lib/seo";

type Props = {
  params: { slug: string };
};

export const dynamic = "force-dynamic";

function isDbUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("Can't reach database server") ||
    message.includes("PrismaClientInitializationError") ||
    message.includes("ECONNREFUSED")
  );
}

export async function generateStaticParams() {
  try {
    const pages = await prisma.evergreenPage.findMany({
      select: { slug: true },
    });
    return pages.map((page) => ({ slug: page.slug }));
  } catch (error) {
    // CI/build sin DB: deja la ruta dinámica y evita romper el build.
    console.warn("generateStaticParams([slug]) skipped: database not available", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let page: Awaited<ReturnType<typeof prisma.evergreenPage.findUnique>> = null;
  try {
    page = await prisma.evergreenPage.findUnique({
      where: { slug: params.slug },
    });
  } catch (error) {
    if (!isDbUnavailable(error)) throw error;
    return { title: "Contenido no disponible temporalmente", robots: { index: false, follow: false } };
  }

  if (!page) {
    return { title: "Contenido no encontrado", robots: { index: false, follow: true } };
  }

  const desc = metaFromEvergreenContent(page.content);
  const pageUrl = canonicalPath(`/${page.slug}`);

  return {
    title: page.title,
    description: desc,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      title: page.title,
      description: truncateMetaDescription(desc, 200),
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: desc,
    },
  };
}

export default async function EvergreenDetailPage({ params }: Props) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  try {
    const page = await prisma.evergreenPage.findUnique({
      where: { slug: params.slug },
    });

    if (!page) {
      notFound();
    }

    const localizedTitle = localizedText(locale, page.title, page.titleVal);
    const localizedContent = localizedText(locale, page.content, page.contentVal);
    let relatedEvergreen: Array<{ slug: string; title: string; titleVal: string | null }> = [];
    let relatedNews: Array<{
      slug: string;
      title: string;
      titleVal: string | null;
      summary: string | null;
      summaryVal: string | null;
      imageUrl: string | null;
    }> = [];
    try {
      [relatedEvergreen, relatedNews] = await Promise.all([
        prisma.evergreenPage.findMany({
          where: { NOT: { id: page.id } },
          orderBy: [{ isHighlighted: "desc" }, { updatedAt: "desc" }],
          take: 3,
          select: { slug: true, title: true, titleVal: true },
        }),
        prisma.article.findMany({
          where: { status: "published" },
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: { slug: true, title: true, titleVal: true, summary: true, summaryVal: true, imageUrl: true },
        }),
      ]);
    } catch (error) {
      if (!isDbUnavailable(error)) throw error;
    }
    const pageUrl = `${SITE_URL}/${page.slug}`;
    const desc = metaFromEvergreenContent(localizedContent);
    const webPageJson = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: localizedTitle,
      description: desc,
      url: pageUrl,
      inLanguage: "es-ES",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    };

    return (
      <article className="container-page max-w-3xl">
        <JsonLdBreadcrumbList
          items={[
            { name: isVal ? "Inici" : "Inicio", path: "/" },
            { name: "Info", path: "/informacion-util" },
            { name: localizedTitle, path: `/${page.slug}` },
          ]}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJson) }}
        />
        <h1 className="text-3xl font-bold">{localizedTitle}</h1>
        <SharePlatformsRow url={pageUrl} title={localizedTitle} isVal={isVal} className="mt-2" />
        <div className="prose-article mt-6 rounded-xl bg-white p-6 shadow-sm text-slate-800 [&_p]:mb-4 [&_p]:last:mb-0 [&_h2]:mt-6 [&_h2]:text-xl">
          {localizedContent.trim() ? renderMarkdown(localizedContent.trim()) : null}
        </div>
        <RelatedLinksSection
          title={isVal ? "Informació relacionada" : "Información relacionada"}
          subtitle={isVal ? "Guies pràctiques connectades amb este contingut." : "Guías prácticas conectadas con este contenido."}
          items={relatedEvergreen.map((item) => ({
            href: `/${item.slug}`,
            title: localizedText(locale, item.title, item.titleVal),
          }))}
        />
        <RelatedLinksSection
          title={isVal ? "Notícies relacionades" : "Noticias relacionadas"}
          subtitle={isVal ? "Actualitat local que et pot interessar." : "Actualidad local que puede interesarte."}
          items={relatedNews.map((item) => ({
            href: `/noticias/${item.slug}`,
            title: localizedText(locale, item.title, item.titleVal),
            description: localizedText(locale, item.summary, item.summaryVal) || undefined,
            imageUrl: item.imageUrl || null,
          }))}
        />
      </article>
    );
  } catch (error) {
    if (isDbUnavailable(error)) notFound();
    throw error;
  }
}
