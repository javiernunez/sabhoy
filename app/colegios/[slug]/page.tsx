import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/render-markdown";
import { SCHOOLS, SCHOOL_TYPES, getSchoolBySlug } from "@/lib/schools";
import { canonicalPath, truncateMetaDescription } from "@/lib/seo";

type Props = Readonly<{
  params: { slug: string };
}>;

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return SCHOOLS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = getSchoolBySlug(params.slug);
  if (!school) return { title: "No encontrado" };

  const pageUrl = canonicalPath(`/colegios/${school.slug}`);
  const typeLabel = SCHOOL_TYPES[school.type].label;

  return {
    title: `${school.name} — Colegio ${typeLabel} en San Antonio de Benagéber`,
    description: truncateMetaDescription(school.description, 200),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "article",
      title: `${school.name} | ${SITE_NAME}`,
      description: truncateMetaDescription(school.description, 200),
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "es_ES",
    },
  };
}

function SchoolInfoCard({ school, isVal }: Readonly<{ school: (typeof SCHOOLS)[number]; isVal: boolean }>) {
  const type = SCHOOL_TYPES[school.type];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${type.colorLight} ${type.color}`}>
          {isVal ? type.labelVal : type.label}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {school.address ? (
          <div className="flex items-start gap-3 text-slate-700">
            <span className="mt-0.5 text-lg" aria-hidden>📍</span>
            <span>{school.address}</span>
          </div>
        ) : null}
        {school.phone ? (
          <div className="flex items-start gap-3 text-slate-700">
            <span className="mt-0.5 text-lg" aria-hidden>📞</span>
            <a href={`tel:${school.phone.replace(/\s/g, "")}`} className="font-semibold text-sab-terracotta hover:underline">
              {school.phone}
            </a>
          </div>
        ) : null}
        {school.website ? (
          <div className="flex items-start gap-3 text-slate-700">
            <span className="mt-0.5 text-lg" aria-hidden>🌐</span>
            <a href={school.website} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-sab-terracotta underline decoration-blue-400/80 underline-offset-2 hover:text-sab-forest">
              {school.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
            </a>
          </div>
        ) : null}
      </div>

      <p className="mt-5 text-slate-600 leading-relaxed">
        {isVal ? school.descriptionVal : school.description}
      </p>
    </div>
  );
}

export default async function SchoolDetailPage({ params }: Props) {
  const school = getSchoolBySlug(params.slug);
  if (!school) notFound();

  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  let evergreenContent = "";
  try {
    const page = await prisma.evergreenPage.findUnique({
      where: { slug: school.evergreenSlug },
    });
    if (page) {
      evergreenContent = localizedText(locale, page.content, page.contentVal);
    }
  } catch {
    // DB unavailable — render without extra content
  }

  const pageUrl = `${SITE_URL}/colegios/${school.slug}`;
  const otherSchools = SCHOOLS.filter((s) => s.slug !== school.slug);

  return (
    <div className="container-page max-w-3xl">
      <JsonLdBreadcrumbList
        items={[
          { name: isVal ? "Inici" : "Inicio", path: "/" },
          { name: isVal ? "Col·legis" : "Colegios", path: "/colegios" },
          { name: school.name, path: `/colegios/${school.slug}` },
        ]}
      />

      <div className="mb-6">
        <Link
          href="/colegios"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-sab-terracotta"
        >
          ← {isVal ? "Tots els col·legis" : "Todos los colegios"}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{school.name}</h1>
        <SharePlatformsRow url={pageUrl} title={school.name} isVal={isVal} className="mt-2" />
      </div>

      <SchoolInfoCard school={school} isVal={isVal} />

      {evergreenContent.trim() ? (
        <div className="prose-article mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-slate-800 md:p-8 [&_p]:mb-4 [&_p]:last:mb-0 [&_h2]:mt-6 [&_h2]:text-xl">
          {renderMarkdown(evergreenContent.trim())}
        </div>
      ) : null}

      {/* Other schools */}
      <section className="mt-10">
        <h2 className="mb-1 text-lg font-bold text-slate-900">
          {isVal ? "Altres col·legis a San Antonio de Benagéber" : "Otros colegios en San Antonio de Benagéber"}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {otherSchools.map((s) => {
            const t = SCHOOL_TYPES[s.type];
            return (
              <Link
                key={s.slug}
                href={`/colegios/${s.slug}`}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow"
              >
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${t.colorLight} ${t.color}`}>
                  {isVal ? t.labelVal.charAt(0) : t.label.charAt(0)}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sab-terracotta">{s.name}</h3>
                  <span className={`text-xs ${t.color}`}>{isVal ? t.labelVal : t.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <Link
          href="/informacion-util/colegios"
          className="inline-flex items-center gap-1 text-sm font-medium text-sab-terracotta transition-colors hover:text-sab-terracotta-dark hover:underline"
        >
          ← {isVal ? "Educació i col·legis" : "Educación y colegios"}
        </Link>
      </div>
    </div>
  );
}
