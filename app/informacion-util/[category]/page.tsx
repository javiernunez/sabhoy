import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { SchoolsDirectoryGrid } from "@/components/SchoolsDirectoryGrid";
import type { InfoCategory } from "@/lib/info-categories";
import { getCategoryBySlug, getCategoryForPage, INFO_CATEGORIES } from "@/lib/info-categories";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/render-markdown";
import { hrefForEvergreenSlug, isSchoolEvergreenSlug } from "@/lib/schools";
import { canonicalPath, metaFromEvergreenContent, truncateMetaDescription } from "@/lib/seo";

type Props = Readonly<{
  params: { category: string };
}>;

type LocalizedPage = {
  id: number;
  slug: string;
  title: string;
  isHighlighted: boolean;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return INFO_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategoryBySlug(params.category);
  if (!cat) return { title: "No encontrado" };

  const page = await prisma.evergreenPage.findUnique({ where: { slug: cat.evergreenSlug } });
  const desc = page ? metaFromEvergreenContent(page.content) : cat.description;
  const pageUrl = canonicalPath(`/informacion-util/${cat.slug}`);

  return {
    title: `${cat.title} en San Antonio de Benagéber`,
    description: desc,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      title: `${cat.title} | ${SITE_NAME}`,
      description: truncateMetaDescription(desc, 200),
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "es_ES",
    },
  };
}

function RelatedPagesGrid({ pages, cat, isVal }: Readonly<{ pages: LocalizedPage[]; cat: InfoCategory; isVal: boolean }>) {
  if (pages.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-lg font-bold text-slate-900">
        {isVal ? "Guies relacionades" : "Guías relacionadas"}
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        {isVal
          ? "Més recursos sobre este tema per al veïnat de San Antonio de Benagéber."
          : "Más recursos sobre este tema para vecinos de San Antonio de Benagéber."}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={hrefForEvergreenSlug(page.slug)}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow"
          >
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${cat.colorLight}`}>
              {cat.icon}
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-sab-terracotta">
                {page.title}
              </h3>
              {page.isHighlighted ? (
                <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sab-terracotta">
                  {isVal ? "Destacat" : "Destacado"}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function InfoCategoryPage({ params }: Props) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  const [mainPage, allPages] = await Promise.all([
    prisma.evergreenPage.findUnique({ where: { slug: cat.evergreenSlug } }),
    prisma.evergreenPage.findMany({ orderBy: [{ isHighlighted: "desc" }, { title: "asc" }] }),
  ]);

  const relatedPages: LocalizedPage[] = allPages
    .filter((p) => p.slug !== cat.evergreenSlug && getCategoryForPage(p)?.slug === cat.slug)
    .filter((p) => cat.slug !== "colegios" || !isSchoolEvergreenSlug(p.slug))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: localizedText(locale, p.title, p.titleVal),
      isHighlighted: p.isHighlighted,
    }));

  const localizedTitle = isVal ? cat.titleVal : cat.title;
  const localizedDesc = isVal ? cat.descriptionVal : cat.description;
  const localizedContent = mainPage ? localizedText(locale, mainPage.content, mainPage.contentVal) : "";
  const pageUrl = `${SITE_URL}/informacion-util/${cat.slug}`;
  const backLabel = isVal ? "Informació útil" : "Información útil";

  return (
    <div className="container-page">
      <JsonLdBreadcrumbList
        items={[
          { name: isVal ? "Inici" : "Inicio", path: "/" },
          { name: backLabel, path: "/informacion-util" },
          { name: localizedTitle, path: `/informacion-util/${cat.slug}` },
        ]}
      />

      <div className="mb-8">
        <Link
          href="/informacion-util"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-sab-terracotta"
        >
          ← {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${cat.colorLight}`}>
            {cat.icon}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{localizedTitle}</h1>
            <p className="mt-0.5 text-slate-600">{localizedDesc}</p>
          </div>
        </div>
        <SharePlatformsRow url={pageUrl} title={localizedTitle} isVal={isVal} className="mt-3" />
      </div>

      {localizedContent.trim() ? (
        <div className="prose-article rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-slate-800 md:p-8 [&_p]:mb-4 [&_p]:last:mb-0 [&_h2]:mt-6 [&_h2]:text-xl">
          {renderMarkdown(localizedContent.trim())}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          {isVal
            ? "El contingut d'esta secció s'està preparant. Torna prompte."
            : "El contenido de esta sección se está preparando. Vuelve pronto."}
        </div>
      )}

      {cat.slug === "colegios" ? (
        <div className="mt-10">
          <SchoolsDirectoryGrid isVal={isVal} />
        </div>
      ) : null}

      <RelatedPagesGrid pages={relatedPages} cat={cat} isVal={isVal} />

      <div className="mt-10 border-t border-slate-200 pt-6">
        <Link
          href="/informacion-util"
          className="inline-flex items-center gap-1 text-sm font-medium text-sab-terracotta transition-colors hover:text-sab-terracotta-dark hover:underline"
        >
          ← {isVal ? "Tornar a informació útil" : "Volver a información útil"}
        </Link>
      </div>
    </div>
  );
}
