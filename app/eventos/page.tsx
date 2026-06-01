import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { CtaLink } from "@/components/CtaLink";
import { SITE_NAME } from "@/lib/constants";
import {
  categoryLabel,
  formatDateKeyTz,
  inclusiveDayCountFromYmd,
  parseDetailsFromDb,
  type EventCategory,
  type FeriaDetails,
} from "@/lib/event-category";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { EventAdminControls } from "@/components/admin/EventAdminControls";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canonicalPath } from "@/lib/seo";
import { uiMediaUrl } from "@/lib/media-url";

const pageUrl = canonicalPath("/eventos");

export const metadata: Metadata = {
  title: "Eventos y agenda en San Antonio de Benagéber",
  description:
    "Agenda de eventos, cultura, deporte y fiestas en San Antonio de Benagéber, Camp de Túria. Consulta los próximos actos y entra al detalle de cada evento.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Eventos y cultura en San Antonio de Benagéber | ${SITE_NAME}`,
    description: "Consulta el calendario de actividades en San Antonio de Benagéber y entra al detalle de cada evento.",
    url: pageUrl,
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
  },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    categoria?: string;
  };
};
type EventListItem = {
  id: number;
  slug: string;
  title: string;
  titleVal: string | null;
  description: string;
  descriptionVal: string | null;
  eventDate: Date;
  imageUrl: string | null;
  linkUrl: string | null;
  category: EventCategory;
  details: Prisma.JsonValue | null;
};

function toDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function excerptText(input: string, maxLength = 140) {
  const plain = stripMarkdownToPlain(input);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}

function EventCard({
  eventItem,
  admin,
  isVal,
  locale,
}: Readonly<{
  eventItem: EventListItem;
  admin: boolean;
  isVal: boolean;
  locale: "es" | "val";
}>) {
  const feriaParsed =
    eventItem.category === "feria"
      ? (parseDetailsFromDb("feria", eventItem.details) as FeriaDetails)
      : null;
  const sk = formatDateKeyTz(eventItem.eventDate, "Europe/Madrid");
  const feriaDays = feriaParsed?.endDate && inclusiveDayCountFromYmd(sk, feriaParsed.endDate);
  const eventImage = uiMediaUrl(eventItem.imageUrl, { displayWidth: 200 });
  const eventTitle = localizedText(locale, eventItem.title, eventItem.titleVal);
  const eventDescription = localizedText(locale, eventItem.description, eventItem.descriptionVal);

  return (
    <li className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/eventos/${eventItem.slug}`} className="block">
        <div className="relative h-40 w-full bg-slate-100">
          {eventImage ? (
            <img src={eventImage} alt={eventTitle} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 text-sab-terracotta-dark">
              <span className="px-4 text-center text-sm font-semibold">{isVal ? "Pla a San Antonio de Benagéber" : "Plan en San Antonio de Benagéber"}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {eventItem.category === "generico" ? null : (
            <span className="inline-block rounded-full bg-sab-mist px-2 py-0.5 text-[11px] font-semibold text-sab-forest">
              {categoryLabel(locale === "val" ? "val" : "es", eventItem.category)}
            </span>
          )}
          {typeof feriaDays === "number" && feriaDays > 1 ? (
            <p className="text-xs text-slate-500">{isVal ? `${feriaDays} dies` : `${feriaDays} días`}</p>
          ) : null}
        </div>
        <Link
          href={`/eventos/${eventItem.slug}`}
          className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-sab-terracotta-dark group-hover:underline"
        >
          {eventTitle}
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{excerptText(eventDescription, 135)}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {admin ? <EventAdminControls eventId={eventItem.id} isVal={isVal} /> : null}
            <Link
              href={`/eventos/${eventItem.slug}`}
              className="text-xs font-semibold text-sab-terracotta hover:text-sab-terracotta-dark hover:underline"
            >
              {isVal ? "Detall" : "Detalle"} →
            </Link>
          </div>
          {eventItem.linkUrl ? (
            <a
              href={eventItem.linkUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:underline"
              aria-label={isVal ? "Web oficial de l'esdeveniment" : "Web oficial del evento"}
            >
              ↗
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default async function EventosPage({ searchParams }: Readonly<PageProps>) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const admin = await isAdminUser();
  const now = new Date();
  const todayKey = toDayKey(now);
  const allowedCategories: EventCategory[] = [
    "generico",
    "teatro",
    "feria",
  ];
  const selectedCategory =
    typeof searchParams?.categoria === "string" &&
    allowedCategories.includes(searchParams.categoria as EventCategory)
      ? (searchParams.categoria as EventCategory)
      : null;
  const eventsRaw: EventListItem[] = await prisma.event.findMany({
    where: {
      status: "active",
    },
    orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  const upcomingEvents = eventsRaw.filter((eventItem) => toDayKey(eventItem.eventDate) >= todayKey);
  const categoryStats: Array<{ category: EventCategory; count: number }> = allowedCategories.map((category) => ({
    category,
    count: upcomingEvents.filter((eventItem) => eventItem.category === category).length,
  }));
  const events = upcomingEvents
    .filter((eventItem) => (selectedCategory ? eventItem.category === selectedCategory : true))
    .slice(0, 60);
  const totalEvents = categoryStats.reduce((acc, item) => acc + item.count, 0);
  const sevenDaysDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
  const todayEvents = events.filter((eventItem) => toDayKey(eventItem.eventDate) === todayKey).length;
  const nextDaysEvents = events.filter(
    (eventItem) => eventItem.eventDate > now && eventItem.eventDate <= sevenDaysDate,
  ).length;
  const groupedByDate = events.reduce<Record<string, typeof events>>((acc, eventItem) => {
    const key = toDayKey(eventItem.eventDate);
    const list = acc[key] ?? [];
    list.push(eventItem);
    acc[key] = list;
    return acc;
  }, {});
  let resultsLabel = "eventos visibles ahora";
  if (isVal) resultsLabel = "esdeveniments visibles ara";
  if (selectedCategory && !isVal) resultsLabel = "resultados en esta categoría";
  if (selectedCategory && isVal) resultsLabel = "resultats en esta categoria";

  return (
    <div className="container-page max-w-5xl">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Agenda local</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          {isVal ? "Esdeveniments a San Antonio de Benagéber" : "Eventos en San Antonio de Benagéber"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {isVal
            ? "Si no saps què fer hui a San Antonio de Benagéber o els pròxims dies, ací tens plans de cultura, esport, festes i activitats per a gaudir del poble."
            : "Si no sabes qué hacer hoy en San Antonio de Benagéber o los próximos días, aquí tienes planes de cultura, deporte, fiestas y actividades para disfrutar del pueblo."}
        </p>
        <div className="mt-5 grid gap-2 text-xs text-slate-700 md:grid-cols-3">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="font-semibold text-slate-900">{todayEvents}</span>{" "}
            {isVal ? "plans per a hui" : "planes para hoy"}
          </p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="font-semibold text-slate-900">{nextDaysEvents}</span>{" "}
            {isVal ? "plans per als pròxims 7 dies" : "planes para los próximos 7 días"}
          </p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="font-semibold text-slate-900">{events.length}</span>{" "}
            {resultsLabel}
          </p>
        </div>
      </section>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/eventos"
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              selectedCategory === null
                ? "border-sab-terracotta/40 bg-sab-mist text-sab-forest"
                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            {isVal ? `Tots (${totalEvents})` : `Todos (${totalEvents})`}
          </Link>
          {categoryStats
            .filter((item) => item.count > 0)
            .map((item) => (
              <Link
                key={item.category}
                href={`/eventos?categoria=${item.category}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory === item.category
                    ? "border-sab-terracotta/40 bg-sab-mist text-sab-forest"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                {categoryLabel(locale === "val" ? "val" : "es", item.category)} ({item.count})
              </Link>
            ))}
        </div>
      </section>
      {events.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          {isVal ? "Ara mateix no hi ha esdeveniments pròxims. Torna prompte." : "Ahora mismo no hay eventos próximos. Vuelve pronto."}
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(groupedByDate).map(([dateKey, dateEvents]) => (
            <section key={dateKey}>
              <h2 className="sticky top-16 z-10 -mx-2 mb-3 rounded-xl border border-slate-200 bg-white/95 px-2 py-2 text-sm font-semibold uppercase tracking-wide text-slate-500 shadow-sm backdrop-blur">
                {new Intl.DateTimeFormat("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).format(dateEvents[0].eventDate)}
              </h2>
              <ul className="grid gap-4 lg:grid-cols-3">
                {dateEvents.map((eventItem) => (
                  <EventCard key={eventItem.id} eventItem={eventItem} admin={admin} isVal={isVal} locale={locale} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700 md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isVal ? "Què fer hui a San Antonio de Benagéber" : "Qué hacer hoy en San Antonio de Benagéber"}
        </h2>
        <p className="mt-2">
          {isVal
            ? "Esta agenda s'actualitza de manera contínua per a ajudar-te a trobar idees de què fer hui a San Antonio de Benagéber i també durant els pròxims dies: teatre, música, activitats familiars, esports, festes i propostes culturals."
            : "Esta agenda se actualiza de forma continua para ayudarte a encontrar ideas de qué hacer hoy en San Antonio de Benagéber y también durante los próximos días: teatro, música, actividades familiares, deporte, fiestas y propuestas culturales."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <CtaLink
            href="/denuncias/nueva"
            trackParams={{ cta_name: "events_send_report", cta_context: "events_page_bottom", destination: "/denuncias/nueva" }}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-sab-terracotta"
          >
            {isVal ? "Proposar incidència" : "Proponer incidencia"}
          </CtaLink>
          <CtaLink
            href="/noticias"
            trackParams={{ cta_name: "events_read_news", cta_context: "events_page_bottom", destination: "/noticias" }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            {isVal ? "Llegir notícies" : "Leer noticias"}
          </CtaLink>
        </div>
      </section>
    </div>
  );
}
