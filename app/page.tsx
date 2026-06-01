import type { Metadata } from "next";
import Link from "next/link";
import { JsonLdWebSite } from "@/components/JsonLdWebSite";
import { CtaLink } from "@/components/CtaLink";
import { HomeHero } from "@/components/HomeHero";
import { HomeEventCalendar } from "@/components/HomeEventCalendar";
import { ui } from "@/lib/ui-classes";
import { HomeNewsletterCard } from "@/components/HomeNewsletterCard";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { canonicalPath } from "@/lib/seo";
import type { FeriaDetails } from "@/lib/event-category";
import {
  categoryLabel,
  expandEventCalendarDays,
  formatDateKeyTz,
  inclusiveDayCountFromYmd,
  madridWeekWindowYmd,
  eventTouchesMadridYmdRange,
  parseDetailsFromDb,
} from "@/lib/event-category";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { uiMediaUrl } from "@/lib/media-url";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
/** Cache HTML en CDN/origen; datos frescos cada 2 min (noticias locales). */
export const revalidate = 120;

export const metadata: Metadata = {
  description: `${SITE_NAME}: ${SITE_DESCRIPTION}`,
  alternates: { canonical: canonicalPath("/") },
  openGraph: {
    type: "website",
    title: `${SITE_NAME} | Noticias e información de San Antonio de Benagéber`,
    description: SITE_DESCRIPTION,
    url: canonicalPath("/"),
    locale: "es_ES",
    siteName: SITE_NAME,
  },
  twitter: {
    title: `${SITE_NAME} | San Antonio de Benagéber`,
    description: SITE_DESCRIPTION,
  },
};

function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function weekAgendaSubtitle(isVal: boolean, startYmd: string, endYmd: string): string {
  const loc = isVal ? "ca-ES" : "es-ES";
  const parse = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12));
  };
  const a = parse(startYmd);
  const b = parse(endYmd);
  const fmt = new Intl.DateTimeFormat(loc, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (startYmd === endYmd) {
    return `El ${fmt.format(a)}.`;
  }
  return `Del ${fmt.format(a)} al ${fmt.format(b)}.`;
}

export default async function HomePage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const session = await getServerSession(authOptions);
  const calendarEventsSince = new Date();
  calendarEventsSince.setMonth(calendarEventsSince.getMonth() - 3);
  calendarEventsSince.setHours(0, 0, 0, 0);
  const calendarEventsUntil = new Date();
  calendarEventsUntil.setMonth(calendarEventsUntil.getMonth() + 12);

  const [latestArticles, highlightedPages, sidebarEvents, latestReports] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: [{ portadaRank: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
    prisma.evergreenPage.findMany({
      where: { isHighlighted: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.event.findMany({
      where: {
        status: "active",
        eventDate: { gte: calendarEventsSince, lte: calendarEventsUntil },
      },
      orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        titleVal: true,
        slug: true,
        eventDate: true,
        category: true,
        details: true,
        imageUrl: true,
      },
    }),
    prisma.report.findMany({
      where: { status: "published" },
      orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        title: true,
        content: true,
        categories: true,
        likeCount: true,
        imageUrl: true,
      },
    }),
  ]);

  const localizedArticles = latestArticles.map((article) => ({
    ...article,
    title: localizedText(locale, article.title, article.titleVal),
    summary: localizedText(locale, article.summary, article.summaryVal) || null,
    content: localizedText(locale, article.content, article.contentVal),
  }));
  const [lead, ...restArticles] = localizedArticles;

  const weekWindow = madridWeekWindowYmd(new Date());
  const thisWeekEvents = sidebarEvents
    .filter((eventItem) =>
      eventTouchesMadridYmdRange(
        eventItem.eventDate,
        eventItem.category,
        eventItem.details,
        weekWindow.startYmd,
        weekWindow.endYmd,
      ),
    )
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  const dateLoc = isVal ? "ca-ES" : "es-ES";
  const lcpHref = lead?.imageUrl ? uiMediaUrl(lead.imageUrl, { displayWidth: 600 }) : null;

  return (
    <div>
      {lcpHref ? <link rel="preload" as="image" href={lcpHref} fetchPriority="high" /> : null}
      <JsonLdWebSite />
      <div className="container-page space-y-12 py-8 md:py-10">
        <HomeHero isVal={isVal} />
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div className="min-w-0 space-y-8 lg:col-span-2">
            <section>
              <SectionHeader
                title={isVal ? "L'últim a San Antonio de Benagéber" : "Lo último en San Antonio de Benagéber"}
                icon="📰"
                subtitle={
                  isVal
                    ? "Notícies per ordre de publicació. Filtra en la secció de notícies."
                    : "Noticias por orden de publicación. Filtra en la sección de noticias."
                }
                href="/noticias"
                trackContext="home_latest_news"
              />
              <div>
                {latestArticles.length === 0 ? (
                  <p className={`text-sm ${ui.muted}`}>{isVal ? "Encara no hi ha notícies. Torna prompte." : "Aún no hay noticias. Vuelve pronto."}</p>
                ) : (
                  <>
                    {lead ? <NewsCard key={lead.id} article={lead} lead /> : null}
                    <div className="mt-6 space-y-2 divide-y divide-sab-sand/80">
                      {restArticles.map((a) => (
                        <NewsCard key={a.id} article={a} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            <section>
              <SectionHeader
                title={isVal ? "Esta setmana a San Antonio de Benagéber…" : "Esta semana en San Antonio de Benagéber…"}
                icon="📅"
                subtitle={weekAgendaSubtitle(isVal, weekWindow.startYmd, weekWindow.endYmd)}
                href="/eventos"
                actionLabel={isVal ? "Tot l'agenda" : "Ver toda la agenda"}
                trackContext="home_week_events"
              />
                {thisWeekEvents.length === 0 ? (
                  <p className={`px-1 py-2.5 text-xs ${ui.muted}`}>
                    {isVal
                      ? "Aquesta setmana encara no hi ha esdeveniments llistats fins al diumenge."
                      : "Esta semana aún no hay eventos listados hasta el domingo."}
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {thisWeekEvents.slice(0, 4).map((eventItem) => {
                      const titleText = localizedText(locale, eventItem.title, eventItem.titleVal);
                      const feriaParsed =
                        eventItem.category === "feria"
                          ? (parseDetailsFromDb("feria", eventItem.details) as FeriaDetails)
                          : null;
                      const sk = formatDateKeyTz(eventItem.eventDate, "Europe/Madrid");
                      const feriaDays =
                        feriaParsed?.endDate && inclusiveDayCountFromYmd(sk, feriaParsed.endDate);

                      const thumb = uiMediaUrl(eventItem.imageUrl, { displayWidth: 200 });

                      return (
                        <article key={eventItem.id} className={ui.card}>
                          {thumb ? (
                            <Link href={`/eventos/${eventItem.slug}`} className="block overflow-hidden rounded-xl border border-sab-sand">
                              {/* eslint-disable-next-line @next/next/no-img-element -- URLs externas / media arbitrarias */}
                              <img
                                src={thumb}
                                alt={titleText}
                                width={400}
                                height={128}
                                loading="lazy"
                                decoding="async"
                                className="h-32 w-full object-cover"
                              />
                            </Link>
                          ) : null}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md border border-sab-sand bg-sab-mist px-2 py-0.5 text-[11px] font-semibold text-sab-forest">
                              <time dateTime={eventItem.eventDate.toISOString()}>
                                {new Intl.DateTimeFormat(dateLoc, {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                }).format(eventItem.eventDate)}
                              </time>
                            </span>
                            {eventItem.category === "generico" ? null : (
                              <span className="rounded-md border border-sab-sand bg-sab-mist px-2 py-0.5 text-[11px] font-semibold text-sab-forest">
                                {categoryLabel(locale === "val" ? "val" : "es", eventItem.category)}
                              </span>
                            )}
                            {typeof feriaDays === "number" && feriaDays > 1 ? (
                              <span className="rounded-md border border-sab-sand bg-sab-mist px-2 py-0.5 text-[11px] font-semibold text-sab-forest">
                                {`${feriaDays} d`}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-2 line-clamp-2 font-serif text-base font-semibold text-sab-ink">
                            <Link href={`/eventos/${eventItem.slug}`} className="hover:text-sab-terracotta">
                              {titleText}
                            </Link>
                          </h3>
                          <div className="mt-3 flex items-center justify-between">
                            <Link href={`/eventos/${eventItem.slug}`} className={`text-sm ${ui.link}`}>
                              {isVal ? "Entrar →" : "Ver más →"}
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              <div className="mt-3">
                <CtaLink
                  href="/eventos"
                  trackParams={{ cta_name: "home_events_footer", cta_context: "home_week_events", destination: "/eventos" }}
                  className={`inline-block text-sm ${ui.link}`}
                >
                  {isVal ? "Veure tota l'agenda" : "Ver toda la agenda"}
                </CtaLink>
              </div>
            </section>

            <section>
              <SectionHeader
                title={isVal ? "Denúncies" : "Denuncias"}
                icon="📣"
                subtitle={
                  isVal
                    ? "Incidències revisades per l'equip. Pots veure-les per temes i participar."
                    : "Incidencias revisadas por el equipo. Puedes verlas por temas y participar."
                }
                href="/denuncias"
                actionLabel={isVal ? "Veure totes" : "Ver todas"}
                trackContext="home_reports"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {latestReports.length === 0 ? (
                  <p className={`${ui.card} text-sm ${ui.muted} sm:col-span-2`}>
                    {isVal ? "Encara no hi ha incidències publicades." : "Aún no hay incidencias publicadas."}
                  </p>
                ) : (
                  latestReports.map((report) => (
                    <article key={report.id} className={ui.card}>
                      {report.imageUrl ? (
                        <div className="mb-3 overflow-hidden rounded-xl border border-sab-sand">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={uiMediaUrl(report.imageUrl, { displayWidth: 200 }) ?? report.imageUrl}
                            alt={report.title}
                            width={400}
                            height={128}
                            className="h-32 w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {report.categories.slice(0, 3).map((tag) => (
                          <Link
                            key={`${report.id}-${tag}`}
                            href={`/denuncias?tag=${encodeURIComponent(tag)}`}
                            className="rounded-md border border-sab-sand bg-sab-mist px-2 py-0.5 text-[11px] font-semibold text-sab-forest hover:bg-sab-sand/50"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                      <h3 className="mt-2 line-clamp-2 font-serif text-base font-semibold text-sab-ink">{report.title}</h3>
                      <p className="mt-1 line-clamp-3 text-sm text-sab-ink/75">{truncateWords(stripMarkdownToPlain(report.content), 24)}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-xs ${ui.muted}`}>{report.likeCount} {isVal ? "vots" : "votos"}</span>
                        <CtaLink
                          href="/denuncias"
                          trackParams={{ cta_name: "home_report_card", cta_context: "home_reports", destination: "/denuncias" }}
                          className={`text-sm ${ui.link}`}
                        >
                          {isVal ? "Entrar →" : "Ver más →"}
                        </CtaLink>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

          </div>

          <aside className="space-y-8 lg:col-span-1">
            <HomeEventCalendar
              isVal={isVal}
              events={sidebarEvents.map((eventItem) => ({
                id: eventItem.id,
                title: localizedText(locale, eventItem.title, eventItem.titleVal),
                slug: eventItem.slug,
                eventDate: eventItem.eventDate.toISOString(),
                calendarDayKeys: expandEventCalendarDays(eventItem.eventDate, eventItem.category, eventItem.details),
              }))}
            />
            <HomeNewsletterCard locale={locale} defaultEmail={session?.user?.email} />
            <div className={`${ui.card} !p-3`}>
              <CtaLink
                href="/elecciones-municipales-sab-2027"
                trackParams={{
                  cta_name: "home_elecciones_2027_sidebar",
                  cta_context: "home_sidebar",
                  destination: "/elecciones-municipales-sab-2027",
                }}
                className="block overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sab-terracotta focus-visible:ring-offset-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático local */}
                <img
                  src="/banner-elecciones-municipales-sab-2027.png"
                  width={346}
                  height={250}
                  alt={
                    isVal
                      ? "Especial Eleccions Municipals 2027 a San Antonio de Benagéber – anar a la informació"
                      : "Especial Elecciones Municipales 2027 en San Antonio de Benagéber – ir a la información"
                  }
                  className="h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
              </CtaLink>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-sab-terracotta/40 bg-sab-forest/5 p-4 text-sm text-sab-forest">
              <p className="font-bold">{isVal ? "Tens alguna cosa que contar o denunciar?" : "¿Algo que contar o denunciar?"}</p>
              <p className="mt-1 text-sab-ink/75">{isVal ? "Passa per denúncies: ho revisem abans de publicar." : "Pasa por denuncias: lo revisamos antes de publicar."}</p>
              <CtaLink
                href="/denuncias/nueva"
                trackParams={{ cta_name: "home_send_report", cta_context: "home_reports_box", destination: "/denuncias/nueva" }}
                className={`mt-2 inline-block ${ui.link}`}
              >
                {isVal ? "Enviar incidència →" : "Enviar incidencia →"}
              </CtaLink>
            </div>
          </aside>
        </div>

        <section>
          <SectionHeader
            title={isVal ? "Informació que sempre fa falta" : "Información que siempre hace falta"}
            icon="🧭"
            href="/informacion-util"
            subtitle={isVal ? "Telèfons, salut, trànsit i més. Contingut viu des del panell d'administració." : "Teléfonos, salud, tránsito y más. Contenido vivo desde el panel de administración."}
            trackContext="home_useful_info"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlightedPages.map((item) => (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className={`group block p-4 transition ${ui.cardHover}`}
              >
                <span className="font-semibold text-sab-ink group-hover:text-sab-terracotta">
                  {localizedText(locale, item.title, item.titleVal)}
                </span>
                <span className={`mt-1 block text-xs ${ui.muted}`}>
                  {isVal ? "Guia pràctica a San Antonio de Benagéber" : "Guía práctica en San Antonio de Benagéber"}
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
