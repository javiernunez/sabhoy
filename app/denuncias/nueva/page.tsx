import type { Metadata } from "next";
import { ReportForm } from "@/components/ReportForm";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/denuncias/nueva");

export const metadata: Metadata = {
  title: "Nueva denuncia ciudadana",
  description: "Envia una incidencia para su revision y posible publicacion en San Antonio de Benagéber, con opcion de denuncia anonima.",
  alternates: { canonical: pageUrl },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Nueva denuncia | San Antonio de Benagéber",
    description: "Formulario de incidencia vecinal con opcion de envio anonimo.",
    url: pageUrl,
  },
};

export default function NewReportPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  return (
    <div className="container-page max-w-3xl">
      <h1 className="text-3xl font-bold">{isVal ? "Enviar denúncia" : "Enviar denuncia"}</h1>
      <p className="mt-2 text-slate-600">
        {isVal
          ? "Descriu la incidència de forma clara per a facilitar la seua validació per l'equip editorial. Pots enviar-la sense compte i, si vols, de forma anònima."
          : "Describe la incidencia de forma clara para facilitar su validacion por el equipo editorial. Puedes enviarla sin cuenta y, si quieres, de forma anonima."}
      </p>

      <div className="mt-6">
        <ReportForm locale={locale} />
      </div>
    </div>
  );
}
