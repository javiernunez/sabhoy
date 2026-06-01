import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryForPage, INFO_CATEGORIES } from "@/lib/info-categories";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/informacion-util");

export const metadata: Metadata = {
  title: "Información útil para vecinos de San Antonio de Benagéber",
  description:
    "Guías prácticas: colegios, salud, trámites, transporte y recursos esenciales para vivir en San Antonio de Benagéber, Camp de Túria, Valencia.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Información útil y guías en San Antonio de Benagéber | ${SITE_NAME}`,
    description: `Recursos y guías prácticas para vecinos, actualizables desde ${SITE_NAME}.`,
    url: pageUrl,
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
  },
};

function getGuidesLabel(count: number, isVal: boolean): string {
  if (count === 1) return isVal ? "guia" : "guía";
  return isVal ? "guies" : "guías";
}

export default async function UsefulInfoPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  const pages = await prisma.evergreenPage.findMany({
    orderBy: [{ isHighlighted: "desc" }, { title: "asc" }],
  });

  const localizedPages = pages.map((page) => ({
    ...page,
    title: localizedText(locale, page.title, page.titleVal),
  }));

  const categoryCounts = INFO_CATEGORIES.map((cat) => {
    const count = localizedPages.filter((p) => {
      const pageCat = getCategoryForPage({ title: p.title, slug: p.slug });
      return pageCat?.slug === cat.slug;
    }).length;
    return { ...cat, count };
  });

  const uncategorized = localizedPages.filter((p) => {
    const slug = p.slug;
    const isCategoryIndex = INFO_CATEGORIES.some((c) => c.evergreenSlug === slug);
    if (isCategoryIndex) return false;
    return !getCategoryForPage({ title: p.title, slug });
  });

  const highlighted = localizedPages.filter((p) => p.isHighlighted).slice(0, 4);

  return (
    <div className="container-page">
      {/* Hero */}
      <div className="mb-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg md:p-10">
        <h1 className="text-2xl font-bold md:text-3xl">
          {isVal ? "Informació útil" : "Información útil"}
        </h1>
        <p className="mt-2 max-w-2xl text-blue-100 md:text-lg">
          {isVal
            ? "Tot el que necessites saber per viure a San Antonio de Benagéber: col·legis, salut, tràmits i transport, organitzats perquè ho trobes ràpid."
            : "Todo lo que necesitas saber para vivir en San Antonio de Benagéber: colegios, salud, trámites y transporte, organizados para que lo encuentres rápido."}
        </p>
      </div>

      {/* Category cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {categoryCounts.map((cat) => (
          <Link
            key={cat.slug}
            href={`/informacion-util/${cat.slug}`}
            className={`group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${cat.colorBorder}`}
          >
            <div className="flex items-start gap-4">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${cat.colorLight}`}>
                {cat.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className={`text-lg font-bold ${cat.color}`}>
                  {isVal ? cat.titleVal : cat.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600 leading-snug">
                  {isVal ? cat.descriptionVal : cat.description}
                </p>
                {cat.count > 0 ? (
                  <span className="mt-2 inline-block text-xs font-medium text-slate-400">
                    {cat.count} {getGuidesLabel(cat.count, isVal)}
                  </span>
                ) : null}
              </div>
              <span className="mt-1 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Highlighted pages */}
      {highlighted.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-1 text-lg font-bold text-slate-900">
            {isVal ? "Guies destacades" : "Guías destacadas"}
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            {isVal
              ? "Les guies més consultades pel veïnat."
              : "Las guías más consultadas por los vecinos."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlighted.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sab-mist text-xs">⭐</span>
                  <h3 className="font-semibold text-slate-900 group-hover:text-sab-terracotta line-clamp-2 text-sm">
                    {page.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Uncategorized pages */}
      {uncategorized.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-1 text-lg font-bold text-slate-900">
            {isVal ? "Altres recursos" : "Otros recursos"}
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            {isVal
              ? "Guies i continguts útils per al dia a dia."
              : "Guías y contenidos útiles para el día a día."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {uncategorized.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-sab-terracotta text-sm">
                  {page.title}
                </h3>
                {page.isHighlighted ? (
                  <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sab-terracotta">
                    {isVal ? "Destacat" : "Destacado"}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
