import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import type { SchoolType } from "@/lib/schools";
import { SCHOOLS, SCHOOL_TYPES } from "@/lib/schools";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/colegios");

export const metadata: Metadata = {
  title: "Colegios en San Antonio de Benagéber — públicos, concertados y privados",
  description:
    "Todos los colegios de San Antonio de Benagéber: CEIP El Garbí, Virgen del Carmen, L'Olivera, Montealegre, Novaschool, Entrenaranjos, Helios e IALE. Información, teléfonos y webs.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Colegios en San Antonio de Benagéber | ${SITE_NAME}`,
    description: "Directorio completo de centros educativos de San Antonio de Benagéber.",
    url: pageUrl,
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
  },
};

const TYPE_ORDER: SchoolType[] = ["publico", "concertado", "privado"];

export default function ColegiosPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    meta: SCHOOL_TYPES[type],
    schools: SCHOOLS.filter((s) => s.type === type),
  }));

  return (
    <div className="container-page">
      <JsonLdBreadcrumbList
        items={[
          { name: isVal ? "Inici" : "Inicio", path: "/" },
          { name: isVal ? "Informació útil" : "Información útil", path: "/informacion-util" },
          { name: isVal ? "Col·legis" : "Colegios", path: "/colegios" },
        ]}
      />

      <div className="mb-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-lg md:p-10">
        <h1 className="text-2xl font-bold md:text-3xl">
          {isVal ? "Col·legis a San Antonio de Benagéber" : "Colegios en San Antonio de Benagéber"}
        </h1>
        <p className="mt-2 max-w-2xl text-blue-100 md:text-lg">
          {isVal
            ? "Tots els centres educatius del municipi: públics, concertats i privats."
            : "Todos los centros educativos del municipio: públicos, concertados y privados."}
        </p>
      </div>

      <div className="space-y-10">
        {grouped.map((group) => (
          <section key={group.type}>
            <div className="mb-4 flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${group.meta.colorLight} ${group.meta.color}`}>
                {isVal ? group.meta.labelVal : group.meta.label}
              </span>
              <span className="text-sm text-slate-400">
                {group.schools.length} {group.schools.length === 1 ? "centro" : "centros"}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.schools.map((school) => (
                <Link
                  key={school.slug}
                  href={`/colegios/${school.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sab-terracotta">
                    {school.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-snug line-clamp-2">
                    {isVal ? school.descriptionVal : school.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {school.address ? (
                      <span className="flex items-center gap-1">
                        <span aria-hidden>📍</span> {school.address}
                      </span>
                    ) : null}
                    {school.phone ? (
                      <span className="flex items-center gap-1">
                        <span aria-hidden>📞</span> {school.phone}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Links */}
      <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-6">
        <Link
          href="/informacion-util/colegios"
          className="inline-flex items-center gap-1 text-sm font-medium text-sab-terracotta transition-colors hover:text-sab-terracotta-dark hover:underline"
        >
          ← {isVal ? "Educació i col·legis" : "Educación y colegios"}
        </Link>
        <Link
          href="/informacion-util"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-sab-terracotta hover:underline"
        >
          {isVal ? "Informació útil" : "Información útil"}
        </Link>
      </div>
    </div>
  );
}
