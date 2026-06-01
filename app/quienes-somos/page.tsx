import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { canonicalPath } from "@/lib/seo";

const pageUrl = canonicalPath("/quienes-somos");

export const metadata: Metadata = {
  title: "Quiénes somos",
  description: `Conoce ${SITE_NAME}: un proyecto vecinal independiente, sin vinculación política, centrado en la pluralidad, la objetividad y el servicio a San Antonio de Benagéber.`,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Quiénes somos | ${SITE_NAME}`,
    description:
      "Portal vecinal de San Antonio de Benagéber, independiente y sin vinculación política, con vocación de pluralidad, objetividad y mejora del municipio.",
    url: pageUrl,
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
  },
};

export default function QuienesSomosPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  return (
    <div className="container-page max-w-3xl py-8 md:py-10">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {isVal ? "Qui som" : "Quiénes somos"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          {isVal
            ? "Som veïns i veïnes de San Antonio de Benagéber que hem creat este portal per a informar i ajudar el nostre poble."
            : "Somos vecinos y vecinas de San Antonio de Benagéber que hemos creado este portal para informar y ayudar a nuestro municipio."}
        </p>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          {isVal
            ? "No tenim cap vinculació política ni partidista. Este és un espai independent, amb vocació de pluralitat i objectivitat."
            : "No tenemos ninguna vinculación política ni partidista. Este es un espacio independiente, con vocación de pluralidad y objetividad."}
        </p>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          {isVal
            ? "Volem ser un altaveu per al veïnat: donar visibilitat al que passa al carrer, compartir informació útil i contribuir, entre tots, a millorar San Antonio de Benagéber."
            : "Queremos ser un altavoz para los vecinos: dar visibilidad a lo que pasa en la calle, compartir información útil y contribuir, entre todos, a mejorar San Antonio de Benagéber."}
        </p>
      </article>
    </div>
  );
}
