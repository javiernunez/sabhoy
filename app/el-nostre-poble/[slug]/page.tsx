import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { pobleCategoryLabel } from "@/lib/poble-categories";
import { buildNostrePoblePageJsonLd } from "@/lib/poble-jsonld";
import { CSS_ARTICLE_HERO_WIDTH } from "@/lib/image-variants";
import { absoluteMediaUrl, uiMediaUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/render-markdown";
import { splitContentSections } from "@/lib/split-content-sections";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { canonicalPath, truncateMetaDescription } from "@/lib/seo";

type Props = { params: { slug: string } };

const BASE = "/el-nostre-poble";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.nostrePoblePage.findFirst({
    where: { slug: params.slug, isPublished: true },
  });
  if (!page) {
    return { title: "Pàgina no trobada", robots: { index: false, follow: true } };
  }
  const rawDesc = page.summary || page.content;
  const desc = truncateMetaDescription(stripMarkdownToPlain(rawDesc), 160);
  const pageUrl = canonicalPath(`${BASE}/${page.slug}`);
  const og = absoluteMediaUrl(page.imageUrl);

  return {
    title: page.title,
    description: desc,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: page.title,
      description: desc,
      type: "article",
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "es_ES",
      publishedTime: page.createdAt.toISOString(),
      modifiedTime: page.updatedAt.toISOString(),
      images: og ? [{ url: og, width: 1200, height: 630, alt: page.title }] : undefined,
    },
    twitter: {
      card: og ? "summary_large_image" : "summary",
      title: page.title,
      description: desc,
    },
  };
}

export default async function NostrePobleDetailPage({ params }: Props) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const page = await prisma.nostrePoblePage.findFirst({
    where: { slug: params.slug, isPublished: true },
  });
  if (!page) notFound();

  const localizedTitle = localizedText(locale, page.title, page.titleVal);
  const localizedContent = localizedText(locale, page.content, page.contentVal);
  const summaryForMeta = stripMarkdownToPlain(
    localizedText(locale, page.summary || page.content, page.summaryVal || page.contentVal),
  );
  const desc = truncateMetaDescription(summaryForMeta, 200);
  const pagePath = `${BASE}/${page.slug}`;
  const pageUrl = `${SITE_URL}${pagePath}`;
  const sectionLabel = pobleCategoryLabel(page.category, isVal);
  const jsonLd = buildNostrePoblePageJsonLd({
    category: page.category,
    title: localizedTitle,
    description: desc,
    path: pagePath,
    imageUrl: page.imageUrl,
  });

  const related = await prisma.nostrePoblePage.findMany({
    where: { isPublished: true, id: { not: page.id } },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    take: 4,
    select: { slug: true, title: true, titleVal: true },
  });

  const sections = splitContentSections(localizedContent);
  const mainImage = page.imageUrl ? uiMediaUrl(page.imageUrl, { displayWidth: CSS_ARTICLE_HERO_WIDTH }) : null;
  const isRemoteImage = mainImage && /^https?:\/\//i.test(mainImage);

  return (
    <article className="container-page max-w-3xl">
      <JsonLdBreadcrumbList
        items={[
          { name: isVal ? "Inici" : "Inicio", path: "/" },
          { name: isVal ? "El Nostre Poble" : "El Nostre Poble", path: BASE },
          { name: localizedTitle, path: pagePath },
        ]}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-sm font-medium text-sab-terracotta-dark">{sectionLabel}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{localizedTitle}</h1>
      <SharePlatformsRow url={pageUrl} title={localizedTitle} isVal={isVal} className="mt-2" />
      {page.summary || page.summaryVal ? (
        <div className="prose-article mt-2 text-lg text-slate-600">
          {renderMarkdown((localizedText(locale, page.summary || "", page.summaryVal) || "").trim())}
        </div>
      ) : null}
      {mainImage ? (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100">
          {isRemoteImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImage} alt={localizedTitle} className="h-full w-full object-cover" />
          ) : (
            <Image
              src={mainImage}
              alt={localizedTitle}
              fill
              className="object-cover"
              sizes="(max-width: 48rem) 100vw, 48rem"
            />
          )}
        </div>
      ) : null}
      <div className="prose-poble mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        {sections.map((section, index) => {
          const lines = section.split("\n");
          const first = lines[0] || "";
          if (first.startsWith("## ")) {
            const h2 = first.replace("## ", "");
            const body = lines.slice(1).join("\n").trim();
            return (
              <section key={index}>
                <h2 className="text-xl font-semibold text-slate-900">{h2}</h2>
                {body ? <div className="mt-2 text-slate-800 [&_p]:mb-4 [&_p]:last:mb-0">{renderMarkdown(body)}</div> : null}
              </section>
            );
          }
          return (
            <section key={index} className="text-slate-800">
              {renderMarkdown(section)}
            </section>
          );
        })}
      </div>
      {related.length > 0 ? (
        <RelatedLinksSection
          title={isVal ? "Més del Nostre Poble" : "Más de El Nostre Poble"}
          subtitle={isVal ? "Continguts similars o del mateix apartat." : "Contenidos similares o de la misma sección."}
          items={related.map((r) => ({
            href: `${BASE}/${r.slug}`,
            title: localizedText(locale, r.title, r.titleVal),
          }))}
        />
      ) : null}
    </article>
  );
}
