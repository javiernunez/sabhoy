import type { LocalDirectoryCategory } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssociationHeaderBackdrop } from "@/components/AssociationHeaderBackdrop";
import { CommerceFilterList, type CommerceFilterItem } from "@/components/CommerceFilterList";
import { SectionHeader } from "@/components/SectionHeader";
import { InlineDeleteEntryButton } from "@/components/admin/InlineDeleteEntryButton";
import { InlineReplaceImageButton } from "@/components/admin/InlineReplaceImageButton";
import { isAdminUser } from "@/lib/auth";
import { getAssociationSectionConfig, matchesAssociationSection, type AssociationSectionConfig } from "@/lib/asociaciones-sections";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { prisma } from "@/lib/prisma";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";

const PAGE_SIZE = 12;
type SearchParams = Record<string, string | string[] | undefined>;

function asString(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function buildHref(
  sectionSlug: AssociationSectionConfig["slug"],
  sp: { q: string; categoria: string; page: number },
  patch: Partial<{ q: string; categoria: string | null; page: number }>,
): string {
  const q = patch.q ?? sp.q;
  const categoria = patch.categoria ?? sp.categoria;
  const page = patch.page ?? sp.page;
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (categoria) p.set("categoria", categoria);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  const base = `/asociaciones/${sectionSlug}`;
  return s ? `${base}?${s}` : base;
}

function getSectionParent(categories: LocalDirectoryCategory[], sectionSlug: AssociationSectionConfig["slug"]) {
  const section = getAssociationSectionConfig(sectionSlug);
  if (!section) return null;
  return categories.find((c) => matchesAssociationSection(c.name, section));
}

export async function AssociationSectionCatalog({
  sectionSlug,
  searchParams,
}: Readonly<{
  sectionSlug: AssociationSectionConfig["slug"];
  searchParams?: SearchParams;
}>) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const admin = await isAdminUser();
  const q = asString(searchParams?.q).trim();
  const selectedCategory = asString(searchParams?.categoria).trim();
  const requestedPage = Number.parseInt(asString(searchParams?.page), 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const sectionConfig = getAssociationSectionConfig(sectionSlug);
  if (!sectionConfig) notFound();

  const parentCategories = await prisma.localDirectoryCategory.findMany({
    where: { kind: "ASSOCIATION", parentId: null },
    orderBy: { name: "asc" },
  });
  const sectionParent = getSectionParent(parentCategories, sectionSlug);
  if (!sectionParent) {
    return (
      <div className="container-page max-w-6xl space-y-6 py-8 md:py-10">
        <SectionHeader
          title={isVal ? sectionConfig.labelVal : sectionConfig.labelEs}
          subtitle={isVal ? "Subsecció d'associacions amb filtres propis." : "Subsección de asociaciones con filtros propios."}
        />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            {isVal
              ? "No s'ha trobat cap categoria arrel al directori que encaixe amb esta secció. El llistat pot estar buit; la URL segueix sent vàlida."
              : "No hay ninguna categoría raíz en el directorio que encaje con esta sección. El listado puede estar vacío; la URL sigue siendo válida."}
          </p>
          <Link href="/asociaciones" className="mt-3 inline-block font-semibold text-sab-terracotta-dark hover:underline">
            {isVal ? "← Tornar a associacions" : "← Volver a asociaciones"}
          </Link>
        </div>
      </div>
    );
  }

  const businesses = await prisma.localDirectoryEntry.findMany({
    where: {
      kind: "ASSOCIATION",
      isActive: true,
      categoryLinks: {
        some: {
          category: {
            OR: [{ id: sectionParent.id }, { parentId: sectionParent.id }],
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      nameVal: true,
      slug: true,
      description: true,
      descriptionVal: true,
      imageUrl: true,
      categoryLinks: {
        include: {
          category: {
            include: { parent: true },
          },
        },
      },
    },
  });

  const localizedBusinesses = businesses.map((business) => ({
    ...business,
    name: localizedText(locale, business.name, business.nameVal),
    description: localizedText(locale, business.description, business.descriptionVal),
    categoryLabels: business.categoryLinks
      .filter((link) => link.category.parentId === sectionParent.id || link.category.id === sectionParent.id)
      .map((link) => localizedText(locale, link.category.name, link.category.nameVal)),
    categoryIds: business.categoryLinks
      .filter((link) => link.category.parentId === sectionParent.id || link.category.id === sectionParent.id)
      .map((link) => link.category.id),
  }));

  const normalizedQuery = normalizeText(q);
  const afterSearch = localizedBusinesses.filter((business) => {
    if (!normalizedQuery) return true;
    const searchableText = normalizeText(`${business.name} ${business.categoryLabels.join(" ")} ${business.description}`);
    return searchableText.includes(normalizedQuery);
  });

  const categoryMap = new Map<string, { name: string; count: number }>();
  for (const business of afterSearch) {
    const seen = new Set<string>();
    for (const link of business.categoryLinks) {
      if (!(link.category.parentId === sectionParent.id || link.category.id === sectionParent.id)) continue;
      const key = `${link.category.id}`;
      if (seen.has(key)) continue;
      const label = localizedText(locale, link.category.name, link.category.nameVal);
      const current = categoryMap.get(key);
      categoryMap.set(key, { name: label, count: (current?.count ?? 0) + 1 });
      seen.add(key);
    }
  }
  const filterItems: CommerceFilterItem[] = Array.from(categoryMap.entries())
    .map(([value, meta]) => ({ value, name: meta.name, count: meta.count }))
    .sort((a, b) => a.name.localeCompare(b.name, isVal ? "ca" : "es"));

  const filteredBusinesses = afterSearch.filter((business) => {
    if (!selectedCategory) return true;
    const selectedCategoryId = Number(selectedCategory);
    if (!Number.isInteger(selectedCategoryId)) return false;
    return business.categoryIds.includes(selectedCategoryId);
  });

  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + PAGE_SIZE);
  const spState = { q, categoria: selectedCategory, page: safePage };
  const activeFilters = Boolean(q || selectedCategory);
  const clearFiltersHref = `/asociaciones/${sectionSlug}`;
  const prevHref = safePage > 1 ? buildHref(sectionSlug, spState, { page: safePage - 1 }) : null;
  const nextHref = safePage < totalPages ? buildHref(sectionSlug, spState, { page: safePage + 1 }) : null;

  return (
    <div className="container-page max-w-6xl space-y-8 py-8 md:py-10">
      <SectionHeader
        title={isVal ? sectionConfig.labelVal : sectionConfig.labelEs}
        subtitle={isVal ? "Subsecció d'associacions amb filtres propis." : "Subsección de asociaciones con filtros propios."}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <div className="p-3 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-4 lg:shadow-sm">
            <p className="mb-2 hidden text-xs font-bold uppercase tracking-wide text-slate-500 lg:block">
              {isVal ? "Categories" : "Categorías"}
            </p>
            <CommerceFilterList
              isVal={isVal}
              items={filterItems}
              buildHref={(patch) => buildHref(sectionSlug, { q, categoria: selectedCategory, page: 1 }, { ...patch, page: 1 })}
              activeCategoria={selectedCategory}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <form method="get" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end lg:grid-cols-[1fr_auto_auto]">
              <label className="block text-sm font-medium text-slate-700">
                {isVal ? "Buscar associació" : "Buscar asociación"}
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder={isVal ? "Nom, categoria o descripció" : "Nombre, categoría o descripción"}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 transition focus:ring"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 lg:hidden">
                {isVal ? "Categoria" : "Categoría"}
                <select
                  name="categoria"
                  defaultValue={selectedCategory}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-600 transition focus:ring"
                >
                  <option value="">{isVal ? "Totes" : "Todas"}</option>
                  {filterItems.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.name} ({c.count})
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Filtrar
                </button>
                {activeFilters ? (
                  <Link
                    href={clearFiltersHref}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {isVal ? "Netejar" : "Limpiar"}
                  </Link>
                ) : null}
              </div>
            </div>
          </form>

          <p className="text-sm text-slate-600">
            {isVal ? `${filteredBusinesses.length} associacions trobades.` : `${filteredBusinesses.length} asociaciones encontradas.`}
          </p>

          {paginatedBusinesses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
              {isVal ? "No hem trobat associacions amb aquests filtres." : "No hemos encontrado asociaciones con esos filtros."}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedBusinesses.map((business) => (
                <article key={business.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <AssociationHeaderBackdrop
                    imageUrl={business.imageUrl}
                    alt={`Foto de ${business.name}`}
                    heightClass="h-40 w-full"
                  >
                    {admin ? (
                      <div className="absolute right-2 top-2 z-20 flex items-start gap-1">
                        <Link
                          href={`/admin/directorio/${business.id}`}
                          title="Editar asociación"
                          aria-label="Editar asociación"
                          className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-700/90 text-sm text-white hover:bg-blue-800"
                        >
                          ✏️
                        </Link>
                        <InlineReplaceImageButton entryId={business.id} />
                        <InlineDeleteEntryButton entryId={business.id} />
                      </div>
                    ) : null}
                  </AssociationHeaderBackdrop>
                  <div className="p-4">
                    <p className="mt-1 text-xs font-medium text-slate-500">{business.categoryLabels.join(" · ")}</p>
                    <h4 className="mt-1 text-base font-semibold text-slate-900">
                      <Link href={`/asociaciones/${business.slug}`} className="hover:text-sab-terracotta-dark hover:underline">
                        {business.name}
                      </Link>
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {truncateWords(stripMarkdownToPlain(business.description), 24)}
                    </p>
                    <Link
                      href={`/asociaciones/${business.slug}`}
                      className="mt-2 inline-block text-sm font-semibold text-sab-terracotta hover:underline"
                    >
                      {isVal ? "Veure fitxa →" : "Ver ficha →"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <span className="text-slate-600">
                {isVal ? `Pàgina ${safePage} de ${totalPages}` : `Página ${safePage} de ${totalPages}`}
              </span>
              <div className="flex items-center gap-2">
                {prevHref ? (
                  <Link
                    href={prevHref}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Anterior
                  </Link>
                ) : null}
                {nextHref ? (
                  <Link
                    href={nextHref}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {isVal ? "Següent" : "Siguiente"}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
