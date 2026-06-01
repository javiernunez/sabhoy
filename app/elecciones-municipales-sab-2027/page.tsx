import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdBreadcrumbList } from "@/components/JsonLdBreadcrumb";
import { NewsCard } from "@/components/NewsCard";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { canonicalPath, truncateMetaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

function isDbUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("Can't reach database server") ||
    message.includes("PrismaClientInitializationError") ||
    message.includes("ECONNREFUSED")
  );
}

const SLUG = "elecciones-municipales-sab-2027";
const PAGE_PATH = `/${SLUG}`;

const descriptionEs =
  "Cobertura de las elecciones municipales 2027 en San Antonio de Benagéber (Valencia, Camp de Túria): partidos, programas, candidatos, entrevistas y resultados. Jornada electoral: domingo 23 de mayo de 2027.";
const descriptionVal =
  "Cobertura de les eleccions municipals 2027 a Sant Antoni de Benaixeve (València, Camp de Túria): partits, programes, candidats, entrevistes i resultats. Jornada electoral: diumenge 23 de maig de 2027.";

const descEsShort = truncateMetaDescription(descriptionEs, 160);
const descValShort = truncateMetaDescription(descriptionVal, 160);

const pageUrl = canonicalPath(PAGE_PATH);
/** Banner ancho: hero junto al título (<h1>) y OG/Twitter. */
const OG_BANNER = "/banner-elecciones-municipales-sab-2027-wide.png";
const ogImage = canonicalPath(OG_BANNER);

type UpcomingItem = { icon: string; title: string; body: string };

const COPY = {
  es: {
    webPageName: "Elecciones municipales San Antonio de Benagéber 2027",
    eventName: "Elecciones municipales en San Antonio de Benagéber 2027",
    shareTitle: "Elecciones municipales San Antonio de Benagéber 2027",
    sectionUpcoming: "Próximamente en esta sección",
    sectionUpcomingHint: "Estamos preparando contenido; conforme se acerque la campaña, iremos publicando.",
    moreContext: "Más contexto",
    breadcrumb: "Elecciones 2027",
    bannerHeadingAlt: `Especial Elecciones Municipales 2027. ${SITE_NAME}.`,
    sectionNews: "Últimas noticias del especial",
    sectionNewsEmpty:
      "Aún no hay noticias en la categoría Elecciones 2027. Cuando publiquemos piezas sobre el proceso electoral municipal, aparecerán aquí.",
    sectionNewsSeeAll: "Ver todas en Noticias",
    upcoming: [
      { icon: "🗳️", title: "Lista de partidos políticos que concurren", body: "Cuando se publiquen las candidaturas oficiales, recogeremos quién se presenta en San Antonio de Benagéber." },
      { icon: "⚖️", title: "Comparativa de propuestas de los programas electorales", body: "Resumen y comparación de ejes clave para decidir con criterio." },
      { icon: "🎙️", title: "Entrevistas a los principales candidatos a la alcaldía", body: "Propuestas y prioridades directamente de los cabezas de lista." },
      { icon: "📰", title: "Noticias sobre todo el proceso y resultados", body: "Campaña, debates, jornada del 23-M y análisis de lo que ocurre en el consistorio." },
    ] satisfies UpcomingItem[],
  },
  val: {
    webPageName: "Eleccions municipals Sant Antoni de Benaixeve 2027",
    eventName: "Eleccions municipals a Sant Antoni de Benaixeve 2027",
    shareTitle: "Eleccions municipals SAB 2027",
    sectionUpcoming: "Pròximament en aquesta secció",
    sectionUpcomingHint: "Estem preparant contingut; conforme s'acosti la campanya, anirem publicant.",
    moreContext: "Més context",
    breadcrumb: "Eleccions 2027",
    bannerHeadingAlt: `Especial Eleccions Municipals 2027. ${SITE_NAME}.`,
    sectionNews: "Últimes notícies de l'especial",
    sectionNewsEmpty:
      "Encara no hi ha notícies en la categoria Eleccions 2027. Quan publiquem peces sobre el procés electoral municipal, apareixeran ací.",
    sectionNewsSeeAll: "Veure totes a Notícies",
    upcoming: [
      { icon: "🗳️", title: "Llista de partits polítics que concorren", body: "Quan es publiquen les candidatures oficials, recollirem qui es presenta a Sant Antoni de Benaixeve." },
      { icon: "⚖️", title: "Comparativa de propostes dels programes electorals", body: "Resum i comparació de temes clau per a ajudar-te a decidir amb criteri." },
      { icon: "🎙️", title: "Entrevistes als principals candidats a l'alcaldia", body: "Propostes i prioritats directament dels caps de llista." },
      { icon: "📰", title: "Notícies sobre tot el procés i resultats", body: "Campanya, debats, jornada del 23-M i anàlisi del que passa al consistori." },
    ] satisfies UpcomingItem[],
  },
} as const;

export const metadata: Metadata = {
  title: "Elecciones municipales San Antonio de Benagéber 2027",
  description: descEsShort,
  keywords: [
    "elecciones municipales 2027",
    "San Antonio de Benagéber",
    "San Antonio de Benagéber",
    "Camp de Túria",
    "Valencia",
    "ayuntamiento San Antonio de Benagéber",
    "candidatos alcaldía",
    "programas electorales",
    "23 mayo 2027",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    title: `Elecciones municipales San Antonio de Benagéber 2027 | ${SITE_NAME}`,
    description: descEsShort,
    url: pageUrl,
    locale: "es_ES",
    siteName: SITE_NAME,
    images: [{ url: ogImage, width: 1024, height: 372, alt: "Especial Elecciones Municipales 2027 San Antonio de Benagéber" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Elecciones municipales San Antonio de Benagéber 2027 | ${SITE_NAME}`,
    description: descEsShort,
    images: [ogImage],
  },
};

export default async function EleccionesMunicipales2027Page() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const t = COPY[isVal ? "val" : "es"];
  const description = isVal ? descriptionVal : descriptionEs;
  const descPlain = isVal ? descValShort : descEsShort;
  const fullUrl = `${SITE_URL}${PAGE_PATH}`;

  let electionArticles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];
  try {
    electionArticles = await prisma.article.findMany({
      where: { category: "ELECCIONES_2027", status: "published" },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    if (!isDbUnavailable(error)) throw error;
  }

  const localizedNews = electionArticles.map((article) => ({
    ...article,
    title: localizedText(locale, article.title, article.titleVal),
    summary: localizedText(locale, article.summary, article.summaryVal) || null,
    content: localizedText(locale, article.content, article.contentVal),
  }));
  const [leadNews, ...restNews] = localizedNews;

  const webPageJson = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t.webPageName,
    description: descPlain,
    url: fullUrl,
    inLanguage: isVal ? "ca-ES" : "es-ES",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: ogImage,
    },
  };

  const electionEventJson = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: t.eventName,
    description: descPlain,
    startDate: "2027-05-23T09:00:00+02:00",
    endDate: "2027-05-23T20:00:00+02:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "San Antonio de Benagéber",
      address: {
        "@type": "PostalAddress",
        addressLocality: "San Antonio de Benagéber",
        addressRegion: "Valencia",
        addressCountry: "ES",
      },
    },
    url: fullUrl,
  };

  return (
    <article className="container-page max-w-3xl py-8 md:py-10">
      <JsonLdBreadcrumbList
        items={[
          { name: isVal ? "Inici" : "Inicio", path: "/" },
          { name: t.breadcrumb, path: PAGE_PATH },
        ]}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJson) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(electionEventJson) }}
      />

      <header className="border-b border-slate-200 pb-8">
        <h1 className="m-0 leading-none border-0 p-0 shadow-none outline-none">
          {/* eslint-disable-next-line @next/next/no-img-element -- hero local */}
          <img
            src={OG_BANNER}
            width={1024}
            height={372}
            alt={t.bannerHeadingAlt}
            className="h-auto w-full rounded-2xl border border-slate-200/80 shadow-sm"
            fetchPriority="high"
            decoding="async"
          />
        </h1>
        <p className="mt-6 text-base text-slate-600">
          <LeadParagraph isVal={isVal} />
        </p>
        <p className="mt-3 text-base leading-relaxed text-slate-700">{description}</p>
        <SharePlatformsRow url={fullUrl} title={t.shareTitle} isVal={isVal} className="mt-4" />
      </header>

      <section className="mt-10" aria-labelledby="elecciones-noticias-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <h2 id="elecciones-noticias-heading" className="text-xl font-bold text-slate-900">
            {t.sectionNews}
          </h2>
          <Link
            href="/noticias?categoria=ELECCIONES_2027"
            className="text-sm font-semibold text-blue-800 underline decoration-blue-300 underline-offset-2 hover:no-underline"
          >
            {t.sectionNewsSeeAll}
          </Link>
        </div>
        {localizedNews.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">{t.sectionNewsEmpty}</p>
        ) : (
          <div className="mt-6">
            {leadNews ? <NewsCard key={leadNews.id} article={leadNews} lead /> : null}
            <div className="divide-y divide-slate-200">
              {restNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">{t.sectionUpcoming}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.sectionUpcomingHint}</p>
        <ul className="mt-6 space-y-4">
          {t.upcoming.map((item) => (
            <li
              key={item.title}
              className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <span className="text-2xl leading-none" aria-hidden>
                {item.icon}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <MoreContext isVal={isVal} heading={t.moreContext} />
    </article>
  );
}

function LeadParagraph({ isVal }: { readonly isVal: boolean }) {
  if (isVal) {
    return (
      <>
        Les <strong>eleccions municipals</strong> estan convocades per al{" "}
        <time dateTime="2027-05-23">diumenge 23 de maig de 2027</time>. Esta pàgina servix de punt de partida: ací
        centralitzarem tot el seguiment de <strong>{SITE_NAME}</strong>.
      </>
    );
  }
  return (
    <>
      Las <strong>elecciones municipales</strong> están convocadas para el{" "}
      <time dateTime="2027-05-23">domingo 23 de mayo de 2027</time>. Esta página sirve como punto de partida: aquí
      centralizaremos todo el seguimiento de <strong>{SITE_NAME}</strong>.
    </>
  );
}

function MoreContext({ isVal, heading }: { readonly isVal: boolean; readonly heading: string }) {
  return (
    <section className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">{heading}</p>
      <p className="mt-2">
        {isVal ? (
          <>
            Pots seguir la política local al nostre apartat de{" "}
            <Link href="/politica" className="font-semibold text-blue-800 underline hover:no-underline">
              Política
            </Link>
            , les notícies d&apos;este especial a{" "}
            <Link href="/noticias?categoria=ELECCIONES_2027" className="font-semibold text-blue-800 underline hover:no-underline">
              Eleccions 2027
            </Link>{" "}
            i la política local general al{" "}
            <Link href="/noticias?categoria=POLITICA_LOCAL" className="font-semibold text-blue-800 underline hover:no-underline">
              butlletí
            </Link>
            .
          </>
        ) : (
          <>
            Puedes seguir la política local en nuestra sección de{" "}
            <Link href="/politica" className="font-semibold text-blue-800 underline hover:no-underline">
              Política
            </Link>
            , las noticias de este especial en{" "}
            <Link href="/noticias?categoria=ELECCIONES_2027" className="font-semibold text-blue-800 underline hover:no-underline">
              Elecciones 2027
            </Link>{" "}
            y el resto de política local en el{" "}
            <Link href="/noticias?categoria=POLITICA_LOCAL" className="font-semibold text-blue-800 underline hover:no-underline">
              boletín
            </Link>
            .
          </>
        )}
      </p>
    </section>
  );
}
