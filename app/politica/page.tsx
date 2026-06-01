import type { Metadata } from "next";
import Link from "next/link";
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { canonicalPath } from "@/lib/seo";
import { renderMarkdown } from "@/lib/render-markdown";
import { getYouTubeEmbedUrl } from "@/lib/video";
import { SITE_NAME } from "@/lib/constants";
import type { ArticleCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Política",
  description:
    "Noticias de política local en San Antonio de Benagéber, partidos con presencia o actividad en el municipio y vídeos de actualidad política.",
  alternates: { canonical: canonicalPath("/politica") },
  openGraph: {
    type: "website",
    title: `Política en San Antonio de Benagéber | ${SITE_NAME}`,
    description:
      "Noticias de política local, partidos y vídeos de actualidad en San Antonio de Benagéber, Camp de Túria, Valencia.",
    url: canonicalPath("/politica"),
    locale: "es_ES",
    siteName: SITE_NAME,
  },
};

const POLITICS_NEWS: ArticleCategory = "POLITICA_LOCAL";

export default async function PoliticaPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";

  const [articles, parties, politicaVideos] = await Promise.all([
    prisma.article.findMany({
      where: { category: POLITICS_NEWS, status: "published" },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.localDirectoryEntry.findMany({
      where: { kind: "POLITICS", isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        nameVal: true,
        category: true,
        categoryVal: true,
        icon: true,
        description: true,
        descriptionVal: true,
        href: true,
      },
    }),
    prisma.video.findMany({
      where: { category: "POLITICA" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const localizedArticles = articles.map((article) => ({
    ...article,
    title: localizedText(locale, article.title, article.titleVal),
    summary: localizedText(locale, article.summary, article.summaryVal) || null,
    content: localizedText(locale, article.content, article.contentVal),
  }));
  const [newsLead, ...newsRest] = localizedArticles;

  return (
    <div className="container-page max-w-6xl space-y-12 py-8 md:py-10">
      <header className="max-w-3xl border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Política</h1>
        <p className="mt-2 font-serif text-base text-slate-600">
          {isVal
            ? "Notícies de política local, formacions amb presència a San Antonio de Benagéber i vídeos d'actualitat."
            : "Noticias de política local, partidos con presencia en San Antonio de Benagéber y vídeos de actualidad."}
        </p>
      </header>

      <section>
        <SectionHeader
          title={isVal ? "Notícies" : "Noticias"}
          subtitle={
            isVal
              ? "Classificades com a política local al nostre butlletí."
              : "Clasificadas como política local en nuestro boletín."
          }
          href="/noticias?categoria=POLITICA_LOCAL"
          actionLabel={isVal ? "Totes en política" : "Todas en política"}
        />
        {articles.length === 0 ? (
          <p className="text-sm text-slate-600">
            {isVal ? "Encara no hi ha notícies d'esta categoria." : "Todavía no hay noticias en esta categoría."}
          </p>
        ) : (
          <div className="max-w-3xl">
            {newsLead ? <NewsCard key={newsLead.id} article={newsLead} lead /> : null}
            <div className="divide-y divide-slate-200">
              {newsRest.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title={isVal ? "Partits polítics" : "Partidos políticos"}
          subtitle={
            isVal
              ? "Llistat orientatiu: webs o perfils oficials quan n'hi ha. Es pot ampliar des de l'administració (directori)."
              : "Listado orientativo: webs o perfiles oficiales cuando existen. Se puede ampliar desde la administración (directorio)."
          }
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parties.length === 0 ? (
            <p className="text-sm text-slate-600 md:col-span-2 lg:col-span-3">
              {isVal
                ? "Encara no hi ha partits al directori. Es poden afegir al panell d'administració (Directori → Política)."
                : "Todavía no hay partidos en el directorio. Se pueden añadir en el panel de administración (Directorio → Política)."}
            </p>
          ) : (
            parties.map((party) =>
              party.href ? (
                <a
                  key={party.id}
                  href={party.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    {localizedText(locale, party.category, party.categoryVal)}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-indigo-800">
                    {localizedText(locale, party.name, party.nameVal)}
                  </h2>
                  <p className="mt-1 text-2xl leading-none" aria-hidden>
                    {party.icon || "🏛️"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {localizedText(locale, party.description, party.descriptionVal)}
                  </p>
                  <span className="mt-3 inline-block text-sm font-semibold text-indigo-700 group-hover:underline">
                    {isVal ? "Obrir enllaç →" : "Abrir enlace →"}
                  </span>
                </a>
              ) : (
                <article key={party.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                    {localizedText(locale, party.category, party.categoryVal)}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">
                    {localizedText(locale, party.name, party.nameVal)}
                  </h2>
                  <p className="mt-1 text-2xl leading-none" aria-hidden>
                    {party.icon || "🏛️"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {localizedText(locale, party.description, party.descriptionVal)}
                  </p>
                  <span className="mt-3 inline-block text-sm font-semibold text-slate-500">
                    {isVal ? "Sense enllaç oficial" : "Sin enlace oficial"}
                  </span>
                </article>
              ),
            )
          )}
        </div>
      </section>

      <section>
        <SectionHeader
          title={isVal ? "Vídeos" : "Videos"}
          subtitle={isVal ? "Contingut enregistrat sota categoria Política." : "Contenido etiquetado como Política."}
          href="/videos?categoria=POLITICA"
          actionLabel={isVal ? "Filtre en vídeos" : "Filtro en vídeos"}
        />
        {politicaVideos.length === 0 ? (
          <p className="text-sm text-slate-600">
            {isVal ? "Encara no hi ha vídeos de política publicats." : "Todavía no hay vídeos de política publicados."}
          </p>
        ) : (
          <div className="max-w-4xl space-y-4">
            {politicaVideos.map((video) => {
              const embedUrl = getYouTubeEmbedUrl(video.url);
              return (
                <article key={video.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {new Intl.DateTimeFormat("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).format(video.createdAt)}
                  </p>
                  <div className="prose-article mt-1 max-w-2xl text-sm text-slate-700">
                    {renderMarkdown(localizedText(locale, video.description, video.descriptionVal) || "")}
                  </div>
                  {embedUrl ? (
                    <div className="relative mt-3 w-full overflow-hidden rounded-xl pt-[56.25%]">
                      <iframe
                        src={embedUrl}
                        title={video.description}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                  <Link
                    href={video.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    {isVal ? "Veure vídeo →" : "Ver vídeo →"}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
