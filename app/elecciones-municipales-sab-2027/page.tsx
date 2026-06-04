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
  "Contexto, memoria electoral y claves de las elecciones 2027 en San Antonio de Benagéber: dos alcaldías en un mandato, moción de 2025 y escenarios abiertos. Jornada: 23 de mayo de 2027.";
const descriptionVal =
  "Context, memòria electoral i claus de les eleccions 2027 a Sant Antoni de Benaixeve: dues alcaldies en un mandat, moció de 2025 i escenaris oberts. Jornada: 23 de maig de 2027.";

const descEsShort = truncateMetaDescription(descriptionEs, 160);
const descValShort = truncateMetaDescription(descriptionVal, 160);

const pageUrl = canonicalPath(PAGE_PATH);
/** Banner ancho: hero junto al título (<h1>) y OG/Twitter. */
const OG_BANNER = "/banner-elecciones-municipales-sab-2027-wide.png";
const ogImage = canonicalPath(OG_BANNER);

type UpcomingItem = { icon: string; title: string; body: string };
type HistoryItem = { year: string; text: string };
type WatchItem = { title: string; body: string };

const COPY = {
  es: {
    webPageName: "Elecciones municipales San Antonio de Benagéber 2027",
    eventName: "Elecciones municipales en San Antonio de Benagéber 2027",
    shareTitle: "Elecciones municipales San Antonio de Benagéber 2027",
    sectionContext: "Contexto de estas elecciones",
    contextBody:
      "San Antonio de Benagéber elige 13 concejales. Las municipales de 2023 dejaron a AISAB como lista más votada (5 escaños, 34,5 %), pero la alcaldía recayó en Eva Tejedor (UCIN, 1 concejal) con apoyo de PP, Vox y Guanyem SAB. En septiembre de 2025 una moción de censura (7–6) devolvió la alcaldía a Enrique Santafosta. La legislatura llega al 2027 con dos cambios de alcaldía y un debate público sobre estabilidad y pactos. Participación 2023: 74,2 %.",
    sectionHistory: "Perspectiva histórica",
    history: [
      {
        year: "1995–2015",
        text: "Eugenio Cañizares (PP) encadenó alcaldías tras la segregación de Pobla de Vallbona (1997). Referencia del municipio «tradicionalmente» gobernado desde la derecha hasta el giro municipalista.",
      },
      {
        year: "2015–2023",
        text: "Enrique Santafosta y AISAB gobernaron dos mandatos con narrativa de continuidad municipalista frente al PP provincial.",
      },
      {
        year: "2023",
        text: "AISAB 5 · PP 3 · Guanyem SAB 2 · Vox 2 · UCIN 1. Investidura atípica: alcaldesa de la lista menos representada, con PP y Vox en el acuerdo y Guanyem apoyando sin entrar en el ejecutivo.",
      },
      {
        year: "2025",
        text: "Moción de censura aprobada con apoyos de ex-AISAB, no adscritos y un voto de ex-Vox; Tejedor, PP, Vox y Guanyem votaron en contra. Santafosta vuelve a la alcaldía a mitad de mandato.",
      },
      {
        year: "2027",
        text: "Comicio previsto el 23-M; candidaturas y alianzas aún por oficializar (junio 2026).",
      },
    ] satisfies HistoryItem[],
    sectionWatch: "Qué tener en cuenta en 2027",
    watchIntro:
      "Hipótesis de trabajo para seguir el proceso — no predicciones. Contrastaremos cada punto con candidaturas y declaraciones públicas.",
    watch: [
      {
        title: "AISAB, Santafosta y el PP",
        body: "Posible reorganización de la candidatura municipalista frente a Santafosta (hoy alcalde, vinculado al PP en hemeroteca) y al bloque que apoyó la censura.",
      },
      {
        title: "Bloque progresista (Guanyem / Compromís local)",
        body: "En 2023 no hubo unidad de izquierdas; conviene vigilar si buscan confluencia o listas paralelas. PSPV, Compromís estatal o Sumar no tuvieron representación en el pleno actual.",
      },
      {
        title: "Vox y UCIN",
        body: "Vox tras la expulsión de Esteve y su voto en la moción; UCIN sin Tejedor (se desvinculó en 2025) o con nueva cabeza de lista.",
      },
      {
        title: "Narrativa estabilidad vs. transfuguismo",
        body: "El episodio de 2023–2025 (alcaldesa con un solo concejal, cambio de sillones) puede marcar campañas; los medios lo han enmarcado así — son marcos periodísticos, no conclusiones jurídicas.",
      },
      {
        title: "Agenda municipal",
        body: "Consultorio de Nieva, movilidad (CV-35), urbanizaciones y servicios: ejes donde comparar programas cuando se publiquen.",
      },
    ] satisfies WatchItem[],
    disclaimer:
      "No publicamos encuestas ni pactos no anunciados. Actualizaremos listas y programas con fuentes verificables.",
    sectionUpcoming: "Próximamente en esta sección",
    sectionUpcomingHint: "Estamos preparando contenido; conforme se acerque la campaña, iremos publicando.",
    moreContext: "Más contexto",
    breadcrumb: "Elecciones 2027",
    bannerHeadingAlt: `Especial Elecciones Municipales 2027. ${SITE_NAME}.`,
    pageHeading: "Elecciones municipales 2027",
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
    sectionContext: "Context d'estes eleccions",
    contextBody:
      "Sant Antoni de Benaixeve elegeix 13 regidors. Les municipals de 2023 van deixar AISAB com a llista més votada (5 escons, 34,5 %), però l'alcaldia va recaure en Eva Tejedor (UCIN, 1 regidor) amb suport del PP, Vox i Guanyem SAB. El setembre de 2025 una moció de censura (7–6) va tornar l'alcaldia a Enrique Santafosta. La legislatura arriba al 2027 amb dos canvis d'alcaldia i un debat públic sobre estabilitat i pactes. Participació 2023: 74,2 %.",
    sectionHistory: "Perspectiva històrica",
    history: [
      {
        year: "1995–2015",
        text: "Eugenio Cañizares (PP) va encadenar alcaldies després de la segregació de Pobla de Vallbona (1997). Referència del municipi governat des de la dreta fins al gir municipalista.",
      },
      {
        year: "2015–2023",
        text: "Enrique Santafosta i AISAB van governar dos mandats amb narrativa de continuïtat municipalista davant del PP provincial.",
      },
      {
        year: "2023",
        text: "AISAB 5 · PP 3 · Guanyem SAB 2 · Vox 2 · UCIN 1. Investidura atípica: alcaldessa de la llista menys representada, amb PP i Vox en l'acord i Guanyem donant suport sense entrar en l'executiu.",
      },
      {
        year: "2025",
        text: "Moció de censura aprovada amb suports d'ex-AISAB, no adscrits i un vot d'ex-Vox; Tejedor, PP, Vox i Guanyem van votar en contra. Santafosta torna a l'alcaldia a mitjan mandat.",
      },
      {
        year: "2027",
        text: "Comici previst el 23-M; candidatures i aliances encara per oficialitzar (juny 2026).",
      },
    ] satisfies HistoryItem[],
    sectionWatch: "Què tenir en compte el 2027",
    watchIntro:
      "Hipòtesis de treball per a seguir el procés — no prediccions. Contrastarem cada punt amb candidatures i declaracions públiques.",
    watch: [
      {
        title: "AISAB, Santafosta i el PP",
        body: "Possible reorganització de la candidatura municipalista davant de Santafosta (avui alcalde, vinculat al PP en hemeroteca) i del bloc que va donar suport a la censura.",
      },
      {
        title: "Bloc progressista (Guanyem / Compromís local)",
        body: "El 2023 no hi hagué unitat d'esquerres; cal vigilar si busquen confluència o llistes paral·leles. PSPV, Compromís estatal o Sumar no van tenir representació al ple actual.",
      },
      {
        title: "Vox i UCIN",
        body: "Vox després de l'expulsió d'Esteve i el seu vot en la moció; UCIN sense Tejedor (es va desvincular el 2025) o amb nova cap de llista.",
      },
      {
        title: "Narrativa estabilitat vs. transfuguisme",
        body: "L'episodi 2023–2025 (alcaldessa amb un sol regidor, canvi de cadires) pot marcar campanyes; els mitjans ho han emmarcat així — són marcs periodístics, no conclusions jurídiques.",
      },
      {
        title: "Agenda municipal",
        body: "Consultori de Nieva, mobilitat (CV-35), urbanitzacions i serveis: eixos on comparar programes quan es publiquen.",
      },
    ] satisfies WatchItem[],
    disclaimer:
      "No publiquem enquestes ni pactes no anunciats. Actualitzarem llistes i programes amb fonts verificables.",
    sectionUpcoming: "Pròximament en aquesta secció",
    sectionUpcomingHint: "Estem preparant contingut; conforme s'acosti la campanya, anirem publicant.",
    moreContext: "Més context",
    breadcrumb: "Eleccions 2027",
    bannerHeadingAlt: `Especial Eleccions Municipals 2027. ${SITE_NAME}.`,
    pageHeading: "Eleccions municipals 2027",
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
  const descPlain = isVal ? descValShort : descEsShort;
  const fullUrl = `${SITE_URL}${PAGE_PATH}`;

  let electionArticles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];
  try {
    electionArticles = await prisma.article.findMany({
      where: { category: "ELECCIONES_2027", status: "published" },
      orderBy: { publishedAt: "desc" },
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
        <SharePlatformsRow url={fullUrl} title={t.shareTitle} isVal={isVal} className="mt-4" />
      </header>

      <ElectionContextSections t={t} />

      <section className="mt-10" aria-labelledby="elecciones-noticias-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <h2 id="elecciones-noticias-heading" className="text-xl font-bold text-slate-900">
            {t.sectionNews}
          </h2>
          <Link
            href="/noticias?categoria=ELECCIONES_2027"
            className="text-sm font-semibold text-sab-terracotta-dark underline decoration-blue-300 underline-offset-2 hover:no-underline"
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
        Les <strong>eleccions municipals</strong> estan previstes per al{" "}
        <time dateTime="2027-05-23">diumenge 23 de maig de 2027</time> (calendari electoral estatal). Ací reunim
        context, memòria del cicle 2023–2027 i el seguiment editorial de <strong>{SITE_NAME}</strong>.
      </>
    );
  }
  return (
    <>
      Las <strong>elecciones municipales</strong> están previstas para el{" "}
      <time dateTime="2027-05-23">domingo 23 de mayo de 2027</time> (calendario electoral estatal). Aquí reunimos
      contexto, memoria del ciclo 2023–2027 y el seguimiento editorial de <strong>{SITE_NAME}</strong>.
    </>
  );
}

type ElectionCopy = (typeof COPY)["es"] | (typeof COPY)["val"];

function ElectionContextSections({ t }: { readonly t: ElectionCopy }) {
  return (
    <>
      <section className="mt-8" aria-labelledby="elecciones-contexto-heading">
        <h2 id="elecciones-contexto-heading" className="text-xl font-bold text-slate-900">
          {t.sectionContext}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-700">{t.contextBody}</p>
      </section>

      <section className="mt-10" aria-labelledby="elecciones-historia-heading">
        <h2 id="elecciones-historia-heading" className="text-xl font-bold text-slate-900">
          {t.sectionHistory}
        </h2>
        <ol className="mt-4 space-y-3 border-l-2 border-sab-terracotta/40 pl-4">
          {t.history.map((item) => (
            <li key={item.year} className="relative">
              <span
                className="absolute -left-[calc(1rem+5px)] top-1.5 h-2 w-2 rounded-full bg-sab-terracotta"
                aria-hidden
              />
              <p className="text-sm font-semibold text-slate-900">{item.year}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="elecciones-claves-heading">
        <h2 id="elecciones-claves-heading" className="text-xl font-bold text-slate-900">
          {t.sectionWatch}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{t.watchIntro}</p>
        <ul className="mt-4 space-y-3">
          {t.watch.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">{t.disclaimer}</p>
      </section>
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
            <Link href="/politica" className="font-semibold text-sab-terracotta-dark underline hover:no-underline">
              Política
            </Link>
            , les notícies d&apos;este especial a{" "}
            <Link href="/noticias?categoria=ELECCIONES_2027" className="font-semibold text-sab-terracotta-dark underline hover:no-underline">
              Eleccions 2027
            </Link>{" "}
            i la política local general al{" "}
            <Link href="/noticias?categoria=POLITICA_LOCAL" className="font-semibold text-sab-terracotta-dark underline hover:no-underline">
              butlletí
            </Link>
            .
          </>
        ) : (
          <>
            Puedes seguir la política local en nuestra sección de{" "}
            <Link href="/politica" className="font-semibold text-sab-terracotta-dark underline hover:no-underline">
              Política
            </Link>
            , las noticias de este especial en{" "}
            <Link href="/noticias?categoria=ELECCIONES_2027" className="font-semibold text-sab-terracotta-dark underline hover:no-underline">
              Elecciones 2027
            </Link>{" "}
            y el resto de política local en el{" "}
            <Link href="/noticias?categoria=POLITICA_LOCAL" className="font-semibold text-sab-terracotta-dark underline hover:no-underline">
              boletín
            </Link>
            .
          </>
        )}
      </p>
    </section>
  );
}
