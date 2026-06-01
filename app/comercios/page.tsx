import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { InlineDeleteEntryButton } from "@/components/admin/InlineDeleteEntryButton";
import { InlineReplaceImageButton } from "@/components/admin/InlineReplaceImageButton";
import { isAdminUser } from "@/lib/auth";
import { COMMERCE_SECTIONS } from "@/lib/comercios-sections";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { uiMediaUrl } from "@/lib/media-url";
import { canonicalPath } from "@/lib/seo";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

export const metadata: Metadata = {
  title: "Comercios locales",
  description: "Explora secciones de comercios de San Antonio de Benagéber y descubre 12 negocios destacados.",
  alternates: { canonical: canonicalPath("/comercios") },
};

export const dynamic = "force-dynamic";

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export default async function ComerciosPage() {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const admin = await isAdminUser();
  const businesses = await prisma.localDirectoryEntry.findMany({
    where: { kind: "COMMERCE", isActive: true },
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
      websiteUrl: true,
      href: true,
      categoryLinks: {
        include: {
          category: {
            include: { parent: true },
          },
        },
      },
    },
  });

  return (
    <div className="container-page max-w-6xl space-y-8 py-8 md:py-10">
      <section>
        <SectionHeader
          title={isVal ? "Comerços i negocis locals" : "Comercios y negocios locales"}
          subtitle={
            isVal
              ? "Tria una secció i navega per fitxes amb filtres específics."
              : "Elige una sección y navega por fichas con filtros específicos."
          }
        />
        <aside className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">{isVal ? "La teva opinió compta" : "Tu opinión cuenta"}</p>
          <p className="mt-1 text-blue-800/95">
            {isVal
              ? "Obri qualsevol fitxa i envia una valoració d’1 a 5 estrelles amb un comentari opcional. Ajudes veïnes i veïns a triar millor."
              : "Abre cualquier ficha y envía una valoración de 1 a 5 estrellas con un comentario opcional. Ayudas a vecinos y vecinas a elegir mejor."}
          </p>
        </aside>
      </section>

      <section className="border-t border-b border-slate-200 bg-white py-3">
        <nav className="flex flex-wrap items-center gap-2" aria-label={isVal ? "Submenú de comerços" : "Submenú de comercios"}>
          {COMMERCE_SECTIONS.map((section) => (
            <Link
              key={section.slug}
              href={`/comercios/${section.slug}`}
              className="group flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-white hover:text-blue-800 hover:shadow-sm"
            >
              <span className="shrink-0" aria-hidden>
                {section.icon}
              </span>
              {isVal ? section.labelVal : section.labelEs}
            </Link>
          ))}
        </nav>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900">{isVal ? "12 destacats" : "12 destacados"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => {
            const localizedName = localizedText(locale, business.name, business.nameVal);
            const localizedDescription = localizedText(locale, business.description, business.descriptionVal);
            const labels = business.categoryLinks.map((link) =>
              link.category.parent
                ? `${localizedText(locale, link.category.parent.name, link.category.parent.nameVal)} / ${localizedText(locale, link.category.name, link.category.nameVal)}`
                : localizedText(locale, link.category.name, link.category.nameVal),
            );
            return (
              <article key={business.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="relative h-40 w-full">
                  {admin ? (
                    <div className="absolute right-2 top-2 z-20 flex items-start gap-1">
                      <Link
                        href={`/admin/directorio/${business.id}`}
                        title="Editar comercio"
                        aria-label="Editar comercio"
                        className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-700/90 text-sm text-white hover:bg-blue-800"
                      >
                        ✏️
                      </Link>
                      <InlineReplaceImageButton entryId={business.id} />
                      <InlineDeleteEntryButton entryId={business.id} />
                    </div>
                  ) : null}
                  <Image
                    src={
                      uiMediaUrl(business.imageUrl, { displayWidth: 160 }) ||
                      "/images/comercios/catalogo-local-placeholder.svg"
                    }
                    alt={`Foto de ${localizedName}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="mt-1 text-xs font-medium text-slate-500">{labels.join(" · ")}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    <Link href={`/comercios/${business.slug}`} className="hover:text-blue-800 hover:underline">
                      {localizedName}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {truncateWords(stripMarkdownToPlain(localizedDescription), 22)}
                  </p>
                  <Link
                    href={`/comercios/${business.slug}`}
                    className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
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
