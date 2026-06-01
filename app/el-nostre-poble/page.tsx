import type { Metadata } from "next";
import Link from "next/link";
import { POBLE_CATEGORY_ORDER, pobleCategoryLabel, pobleCategorySeoText } from "@/lib/poble-categories";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { canonicalPath } from "@/lib/seo";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import type { NostrePoblePage, PoblePageCategory } from "@prisma/client";

const pagePath = "/el-nostre-poble";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "El Nostre Poble | Patrimoni, tradicions i història a San Antonio de Benagéber",
  description:
    "Monuments, tradicions, història, alcaldes i curiositats de San Antonio de Benagéber (Camp de Túria, València). Una guia per conèixer el poble a peu de carrer.",
  alternates: { canonical: canonicalPath(pagePath) },
  openGraph: {
    type: "website",
    title: `El Nostre Poble | ${SITE_NAME}`,
    description: "Patrimoni, festes, història local i molt més sobre San Antonio de Benagéber.",
    url: canonicalPath(pagePath),
    siteName: SITE_NAME,
    locale: "es_ES",
  },
};

function groupByCategory(
  pages: NostrePoblePage[],
): Map<PoblePageCategory, NostrePoblePage[]> {
  const m = new Map<PoblePageCategory, NostrePoblePage[]>();
  for (const c of POBLE_CATEGORY_ORDER) m.set(c, []);
  for (const p of pages) {
    const list = m.get(p.category) ?? [];
    list.push(p);
    m.set(p.category, list);
  }
  return m;
}

export default async function NostrePobleIndexPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const rows = await prisma.nostrePoblePage.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  const grouped = groupByCategory(rows);

  return (
    <div className="container-page max-w-4xl space-y-10 py-8 md:py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">El Nostre Poble</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
          {isVal
            ? "Aquesta secció recull monuments, tradicions, història, moments polítics locals i curiositats. Cada tema té la seua pàgina perquè pugues compartir i posicionar bé a cercadors (SEO)."
            : "Esta sección reúne monumentos, tradiciones, historia, momentos políticos locales y curiosidades. Cada tema tiene su página para compartir y posicionar bien en buscadores (SEO)."}
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="text-slate-600">
          {isVal ? "Encara no hi ha continguts en esta secció." : "Aún no hay contenidos en esta sección."}
        </p>
      ) : (
        <div className="space-y-12">
          {POBLE_CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={cat} className="scroll-mt-6" id={cat.toLowerCase()}>
                <h2 className="text-xl font-semibold text-slate-900">{pobleCategoryLabel(cat, isVal)}</h2>
                <p className="mt-1 text-sm text-slate-500">{pobleCategorySeoText(cat, isVal)}</p>
                <ul className="mt-4 space-y-2">
                  {list.map((p) => {
                    const title = localizedText(locale, p.title, p.titleVal);
                    return (
                      <li key={p.id}>
                        <Link
                          href={`${pagePath}/${p.slug}`}
                          className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-900"
                        >
                          <span className="font-medium">{title}</span>
                          {p.summary || p.summaryVal ? (
                            <span className="mt-0.5 block text-sm text-slate-500 line-clamp-2">
                              {stripMarkdownToPlain(localizedText(locale, p.summary || "", p.summaryVal))}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
