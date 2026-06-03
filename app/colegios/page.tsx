import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { SchoolsDirectoryGrid } from "@/components/SchoolsDirectoryGrid";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/colegios");

export const metadata: Metadata = {
  title: "Colegios en San Antonio de Benagéber — públicos, concertados y privados",
  description:
    "Todos los colegios de San Antonio de Benagéber: CEIP San Antonio, CEIP Montesano, IES San Antonio de Benagéber e IES Fundación San Vicente Ferrer.",
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

export default function ColegiosPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

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

      <SchoolsDirectoryGrid isVal={isVal} showHeading={false} />

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
