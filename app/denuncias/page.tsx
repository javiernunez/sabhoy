import type { Metadata } from "next";
import Link from "next/link";
import { ReportInteractions } from "@/components/ReportInteractions";
import { REPORT_CATEGORIES, SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { uiMediaUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/render-markdown";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/denuncias");

export const metadata: Metadata = {
  title: "Denuncias ciudadanas de San Antonio de Benagéber",
  description: `Incidencias vecinales publicadas en San Antonio de Benagéber: ruido, tráfico, limpieza y más. Voz de barrio y seguimiento en ${SITE_NAME}, Camp de Túria.`,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Denuncias vecinales en San Antonio de Benagéber | ${SITE_NAME}`,
    description: "Incidencias revisadas y publicadas por el equipo editorial.",
    url: pageUrl,
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
  },
};

function formatDate(date: Date, locale: "es" | "val") {
  return new Intl.DateTimeFormat(locale === "val" ? "ca-ES" : "es-ES", { dateStyle: "medium" }).format(date);
}

type ReportsPageProps = {
  searchParams?: { tag?: string };
};

export default async function ReportsPage({ searchParams }: Readonly<ReportsPageProps>) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const tag = String(searchParams?.tag || "").trim().toLowerCase();
  const activeTag = tag && REPORT_CATEGORIES.includes(tag as (typeof REPORT_CATEGORIES)[number]) ? tag : null;
  const reports = await prisma.report.findMany({
    where: { status: "published", ...(activeTag ? { categories: { has: activeTag } } : {}) },
    orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  return (
    <div className="container-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{isVal ? "Denúncies ciutadanes" : "Denuncias ciudadanas"}</h1>
          <p className="mt-2 text-slate-600">{isVal ? "Incidències publicades després de la seua revisió." : "Incidencias publicadas tras su revisión."}</p>
        </div>
        <Link href="/denuncias/nueva" className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          {isVal ? "Nova denúncia" : "Nueva denuncia"}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/denuncias"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${activeTag ? "border-slate-300 text-slate-700" : "border-blue-600 bg-blue-600 text-white"}`}
        >
          {isVal ? "Totes" : "Todas"}
        </Link>
        {REPORT_CATEGORIES.map((category) => {
          const isActive = activeTag === category;
          return (
            <Link
              key={category}
              href={`/denuncias?tag=${encodeURIComponent(category)}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${isActive ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-700"}`}
            >
              #{category}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {reports.map((report) => (
          <article key={report.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {report.imageUrl ? (
              <div className="mb-3 overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uiMediaUrl(report.imageUrl, { displayWidth: 400 }) ?? report.imageUrl}
                  alt={report.title}
                  width={800}
                  height={208}
                  className="h-52 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              {report.categories.map((category) => (
                <Link key={`${report.id}-${category}`} href={`/denuncias?tag=${encodeURIComponent(category)}`} className="rounded-full border border-slate-300 px-2 py-0.5 normal-case tracking-normal text-slate-700 hover:bg-slate-100">
                  #{category}
                </Link>
              ))}
              <span>{formatDate(report.createdAt, locale)}</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold">{report.title}</h2>
            <div className="prose-article mt-2 max-w-2xl text-sm text-slate-700">
              {renderMarkdown(report.content || "")}
            </div>
            <ReportInteractions
              reportId={report.id}
              initialLikeCount={report.likeCount}
              initialCommentCount={report._count.comments}
              locale={locale}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
