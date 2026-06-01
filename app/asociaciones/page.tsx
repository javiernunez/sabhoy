import type { Metadata } from "next";
import Link from "next/link";
import { AssociationHeaderBackdrop } from "@/components/AssociationHeaderBackdrop";
import { CSS_DIRECTORY_CARD_HEADER_WIDTH } from "@/lib/image-variants";
import { SectionHeader } from "@/components/SectionHeader";
import { InlineDeleteEntryButton } from "@/components/admin/InlineDeleteEntryButton";
import { InlineReplaceImageButton } from "@/components/admin/InlineReplaceImageButton";
import { ASSOCIATION_SECTIONS } from "@/lib/asociaciones-sections";
import { isAdminUser } from "@/lib/auth";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { canonicalPath } from "@/lib/seo";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

export const metadata: Metadata = {
  title: "Asociaciones",
  description: "Tejido asociativo de San Antonio de Benagéber: casales, clubes deportivos, AMPAs, asociaciones vecinales y ONGs.",
  alternates: { canonical: canonicalPath("/asociaciones") },
};

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export default async function AsociacionesPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const admin = await isAdminUser();
  const entries = await prisma.localDirectoryEntry.findMany({
    where: { kind: "ASSOCIATION", isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 12,
    select: {
      id: true,
      name: true,
      nameVal: true,
      slug: true,
      description: true,
      descriptionVal: true,
      imageUrl: true,
      categoryLinks: { include: { category: { include: { parent: true } } } },
    },
  });

  return (
    <div className="container-page max-w-6xl space-y-8 py-8 md:py-10">
      <SectionHeader
        title={isVal ? "Associacions" : "Asociaciones"}
        subtitle={isVal ? "Entitats i teixit social de San Antonio de Benagéber." : "Entidades y tejido social de San Antonio de Benagéber."}
      />

      <section className="border-t border-b border-slate-200 bg-white py-3">
        <nav className="flex flex-wrap items-center gap-2" aria-label={isVal ? "Submenú d'associacions" : "Submenú de asociaciones"}>
          {ASSOCIATION_SECTIONS.map((section) => (
            <Link
              key={section.slug}
              href={`/asociaciones/${section.slug}`}
              className="group flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-white hover:text-sab-terracotta-dark hover:shadow-sm"
            >
              <span className="shrink-0" aria-hidden>{section.icon}</span>
              {isVal ? section.labelVal : section.labelEs}
            </Link>
          ))}
        </nav>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900">{isVal ? "12 destacades" : "12 destacadas"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => {
            const name = localizedText(locale, entry.name, entry.nameVal);
            const description = localizedText(locale, entry.description, entry.descriptionVal);
            const labels = entry.categoryLinks.map((link) =>
              link.category.parent
                ? `${localizedText(locale, link.category.parent.name, link.category.parent.nameVal)} / ${localizedText(locale, link.category.name, link.category.nameVal)}`
                : localizedText(locale, link.category.name, link.category.nameVal),
            );
            return (
              <article key={entry.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <AssociationHeaderBackdrop
                  imageUrl={entry.imageUrl}
                  alt={`Foto de ${name}`}
                  heightClass="h-40 w-full"
                  displayWidth={CSS_DIRECTORY_CARD_HEADER_WIDTH}
                >
                  {admin ? (
                    <div className="absolute right-2 top-2 z-20 flex items-start gap-1">
                      <Link href={`/admin/directorio/${entry.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-700/90 text-sm text-white hover:bg-blue-800">✏️</Link>
                      <InlineReplaceImageButton entryId={entry.id} />
                      <InlineDeleteEntryButton entryId={entry.id} />
                    </div>
                  ) : null}
                </AssociationHeaderBackdrop>
                <div className="p-4">
                  <p className="mt-1 text-xs font-medium text-slate-500">{labels.join(" · ")}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    <Link href={`/asociaciones/${entry.slug}`} className="hover:text-sab-terracotta-dark hover:underline">
                      {name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{truncateWords(stripMarkdownToPlain(description), 22)}</p>
                  <Link href={`/asociaciones/${entry.slug}`} className="mt-2 inline-block text-sm font-semibold text-sab-terracotta hover:underline">
                    {isVal ? "Veure fitxa →" : "Ver ficha →"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
