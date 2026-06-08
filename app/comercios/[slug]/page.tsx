import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { CommerceSectionCatalog } from "@/components/CommerceSectionCatalog";
import { InlineReplaceImageButton } from "@/components/admin/InlineReplaceImageButton";
import { DirectoryEntryLinksSection } from "@/components/local-directory/DirectoryEntryLinksSection";
import { DirectoryEntryReviewsSection } from "@/components/local-directory/DirectoryEntryReviewsSection";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { getSessionOrNull, isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CSS_DIRECTORY_HERO_WIDTH } from "@/lib/image-variants";
import { absoluteMediaUrl, uiMediaUrl } from "@/lib/media-url";
import { canonicalPath, DEFAULT_SITE_KEYWORDS, stripSnippetEmojis, truncateMetaDescription } from "@/lib/seo";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { renderMarkdown } from "@/lib/render-markdown";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { findActiveDirectoryEntryByPublicSlug } from "@/lib/local-directory-slug";
import { getCommerceSectionConfig, isCommerceSectionSlug } from "@/lib/comercios-sections";

type Params = { params: { slug: string } };
type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (isCommerceSectionSlug(params.slug)) {
    const section = getCommerceSectionConfig(params.slug)!;
    const locale = getLocaleFromCookie();
    const isVal = locale === "val";
    return {
      title: isVal ? `${section.labelVal} · Comerços` : `${section.labelEs} · Comercios`,
      description: isVal ? section.descriptionVal : section.descriptionEs,
      alternates: { canonical: canonicalPath(`/comercios/${section.slug}`) },
    };
  }

  const resolved = await findActiveDirectoryEntryByPublicSlug(params.slug);
  if (!resolved) return { title: "Comercio no encontrado" };

  const item = await prisma.localDirectoryEntry.findFirst({
    where: { id: resolved.id, isActive: true },
    select: { name: true, description: true, slug: true, kind: true, imageUrl: true },
  });
  if (!item) return { title: "Comercio no encontrado" };

  const basePath =
    item.kind === "COMMERCE" ? "/comercios" : item.kind === "POLITICS" ? "/politica" : "/asociaciones";
  const pageUrl =
    item.kind === "POLITICS" ? canonicalPath("/politica") : canonicalPath(`${basePath}/${item.slug}`);
  const plain = stripSnippetEmojis(stripMarkdownToPlain(item.description));
  const metaDesc = truncateMetaDescription(plain, 160);
  const ogImage = absoluteMediaUrl(item.imageUrl);
  const ogTitle = `${item.name} | ${SITE_NAME}`;
  const pageTitle = `${item.name} · San Antonio de Benagéber`;
  const localKw =
    item.kind === "ASSOCIATION" || item.kind === "SPORT"
      ? (["asociación San Antonio de Benagéber", "asociaciones San Antonio de Benagéber", "voluntariado San Antonio de Benagéber"] as const)
      : item.kind === "POLITICS"
        ? (["política San Antonio de Benagéber", "partidos San Antonio de Benagéber"] as const)
        : (["comercio San Antonio de Benagéber", "comercios San Antonio de Benagéber", "negocios San Antonio de Benagéber"] as const);

  const categoryMeta =
    item.kind === "ASSOCIATION" || item.kind === "SPORT"
      ? "nonprofit"
      : item.kind === "POLITICS"
        ? "politics"
        : "local business";

  return {
    title: pageTitle,
    description: metaDesc,
    keywords: [...DEFAULT_SITE_KEYWORDS, item.name, ...localKw],
    category: categoryMeta,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: ogTitle,
      description: metaDesc,
      type: "website",
      url: pageUrl,
      siteName: SITE_NAME,
      locale: "es_ES",
      images: ogImage ? [{ url: ogImage, alt: item.name }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      description: metaDesc,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ComercioDetailPage({
  params,
  searchParams,
}: {
  params: Params["params"];
  searchParams?: SearchParams;
}) {
  if (isCommerceSectionSlug(params.slug)) {
    return <CommerceSectionCatalog sectionSlug={params.slug} searchParams={searchParams} />;
  }

  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const [admin, session] = await Promise.all([isAdminUser(), getSessionOrNull()]);
  const resolved = await findActiveDirectoryEntryByPublicSlug(params.slug);
  if (!resolved) notFound();
  if (resolved.kind === "ASSOCIATION" || resolved.kind === "SPORT") {
    redirect(`/asociaciones/${resolved.slug}`);
  }
  if (resolved.kind === "POLITICS") {
    redirect("/politica");
  }
  if (resolved.slug !== params.slug) {
    redirect(`/comercios/${resolved.slug}`);
  }

  const item = await prisma.localDirectoryEntry.findFirst({
    where: { id: resolved.id, kind: "COMMERCE", isActive: true },
    include: {
      categoryLinks: { include: { category: { include: { parent: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!item) notFound();
  const localizedName = localizedText(locale, item.name, item.nameVal);
  const localizedDescription = localizedText(locale, item.description, item.descriptionVal);
  const localizedCategories = item.categoryLinks.map((link) =>
    link.category.parent
      ? `${localizedText(locale, link.category.parent.name, link.category.parent.nameVal)} / ${localizedText(locale, link.category.name, link.category.nameVal)}`
      : localizedText(locale, link.category.name, link.category.nameVal),
  );
  const ownCategoryIds = item.categoryLinks.map((link) => link.categoryId);

  const relatedCommerces = await prisma.localDirectoryEntry.findMany({
    where: {
      kind: "COMMERCE",
      isActive: true,
      NOT: { id: item.id },
      ...(ownCategoryIds.length > 0
        ? { categoryLinks: { some: { categoryId: { in: ownCategoryIds } } } }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: 20,
    select: {
      slug: true,
      name: true,
      nameVal: true,
      description: true,
      descriptionVal: true,
      imageUrl: true,
    },
  });
  const filteredRelated = relatedCommerces.slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: localizedName,
    description: stripMarkdownToPlain(localizedDescription),
    image: absoluteMediaUrl(item.imageUrl) ? [absoluteMediaUrl(item.imageUrl)] : undefined,
    url: canonicalPath(`/comercios/${item.slug}`),
    address: item.address ?? undefined,
    telephone: item.phone ?? undefined,
    sameAs: [item.websiteUrl, item.href, item.facebookUrl, item.instagramUrl, item.tiktokUrl].filter(
      (value): value is string => Boolean(value),
    ),
  };

  return (
    <div className="container-page max-w-5xl space-y-8 py-8 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="space-y-4">
        <Link href="/comercios" className="text-sm font-semibold text-sab-terracotta hover:underline">
          {isVal ? "← Tornar a comerços" : "← Volver a comercios"}
        </Link>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-56 w-full">
            {admin ? <InlineReplaceImageButton entryId={item.id} /> : null}
            <Image
              src={
                uiMediaUrl(item.imageUrl, { displayWidth: CSS_DIRECTORY_HERO_WIDTH }) ||
                "/images/comercios/catalogo-local-placeholder.svg"
              }
              alt={`Foto de ${localizedName}`}
              fill
              sizes="(max-width: 64rem) 100vw, 64rem"
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <p className="mt-1 text-xs font-medium text-slate-500">{localizedCategories.join(" · ")}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{localizedName}</h1>
            <div className="prose-article mt-3 max-w-2xl text-slate-700 [&_.mb-6]:mb-3">{renderMarkdown(localizedDescription)}</div>
            <DirectoryEntryLinksSection
              isVal={isVal}
              websiteUrl={item.websiteUrl}
              href={item.href}
              phone={item.phone}
              address={item.address}
              facebookUrl={item.facebookUrl}
              instagramUrl={item.instagramUrl}
              tiktokUrl={item.tiktokUrl}
            />
          </div>
        </div>
      </section>

      <DirectoryEntryReviewsSection
        entryId={item.id}
        isVal={isVal}
        callbackPath={`/comercios/${item.slug}`}
        initialReviews={item.reviews.map((r) => ({
          id: r.id,
          score: r.score,
          comment: r.comment,
          author: r.author,
          createdAt: r.createdAt.toISOString(),
        }))}
        ratingAverage={item.ratingAverage}
        ratingCount={item.ratingCount}
        isAuthenticated={!!session?.user}
      />

      <RelatedLinksSection
        title={isVal ? "Comerços relacionats" : "Comercios relacionados"}
        subtitle={isVal ? "Altres negocis del mateix tipus a San Antonio de Benagéber." : "Otros negocios del mismo tipo en San Antonio de Benagéber."}
        items={filteredRelated.map((related) => ({
          href: `/comercios/${related.slug}`,
          title: localizedText(locale, related.name, related.nameVal),
          description: stripMarkdownToPlain(localizedText(locale, related.description, related.descriptionVal)),
          imageUrl: related.imageUrl || null,
        }))}
      />
    </div>
  );
}
