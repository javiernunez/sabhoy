import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AssociationHeaderBackdrop } from "@/components/AssociationHeaderBackdrop";
import { InlineReplaceImageButton } from "@/components/admin/InlineReplaceImageButton";
import { DirectoryEntryLinksSection } from "@/components/local-directory/DirectoryEntryLinksSection";
import { DirectoryEntryReviewsSection } from "@/components/local-directory/DirectoryEntryReviewsSection";
import { RelatedLinksSection } from "@/components/RelatedLinksSection";
import { getSessionOrNull, isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { absoluteMediaUrl, uiMediaUrl } from "@/lib/media-url";
import { canonicalPath, DEFAULT_SITE_KEYWORDS, stripSnippetEmojis, truncateMetaDescription } from "@/lib/seo";
import { SITE_NAME } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { renderMarkdown } from "@/lib/render-markdown";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { findActiveDirectoryEntryByPublicSlug } from "@/lib/local-directory-slug";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolved = await findActiveDirectoryEntryByPublicSlug(params.slug);
  if (!resolved) return { title: "Asociación no encontrada" };

  const item = await prisma.localDirectoryEntry.findFirst({
    where: { id: resolved.id, isActive: true },
    select: { name: true, description: true, slug: true, kind: true, imageUrl: true },
  });
  if (!item) return { title: "Asociación no encontrada" };

  const pageUrl =
    item.kind === "COMMERCE"
      ? canonicalPath(`/comercios/${item.slug}`)
      : item.kind === "POLITICS"
        ? canonicalPath("/politica")
        : canonicalPath(`/asociaciones/${item.slug}`);
  const plain = stripSnippetEmojis(stripMarkdownToPlain(item.description));
  const metaDesc = truncateMetaDescription(plain, 160);
  const ogImage = absoluteMediaUrl(item.imageUrl);
  const ogTitle = `${item.name} | ${SITE_NAME}`;
  const pageTitle = `${item.name} · San Antonio de Benagéber`;

  return {
    title: pageTitle,
    description: metaDesc,
    keywords: [...DEFAULT_SITE_KEYWORDS, item.name, "asociación San Antonio de Benagéber", "asociaciones San Antonio de Benagéber", "voluntariado San Antonio de Benagéber"],
    category: "nonprofit",
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

export default async function AsociacionDetailPage({ params }: Params) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const [admin, session] = await Promise.all([isAdminUser(), getSessionOrNull()]);
  const resolved = await findActiveDirectoryEntryByPublicSlug(params.slug);
  if (!resolved) notFound();
  if (resolved.kind === "COMMERCE") {
    redirect(`/comercios/${resolved.slug}`);
  }
  if (resolved.kind === "POLITICS") {
    redirect("/politica");
  }
  if (resolved.slug !== params.slug) {
    redirect(`/asociaciones/${resolved.slug}`);
  }

  const item = await prisma.localDirectoryEntry.findFirst({
    where: { id: resolved.id, kind: { in: ["ASSOCIATION", "SPORT"] }, isActive: true },
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

  const relatedAssociations = await prisma.localDirectoryEntry.findMany({
    where: {
      kind: "ASSOCIATION",
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
  const filteredRelated = relatedAssociations.slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: localizedName,
    description: stripMarkdownToPlain(localizedDescription),
    image: absoluteMediaUrl(item.imageUrl) ? [absoluteMediaUrl(item.imageUrl)] : undefined,
    url: canonicalPath(`/asociaciones/${item.slug}`),
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
        <Link href="/asociaciones" className="text-sm font-semibold text-sab-terracotta hover:underline">
          {isVal ? "← Tornar a associacions" : "← Volver a asociaciones"}
        </Link>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <AssociationHeaderBackdrop
            imageUrl={item.imageUrl}
            alt={`Foto de ${localizedName}`}
            heightClass="h-56 w-full md:h-60"
          >
            {admin ? (
              <div className="pointer-events-none absolute right-2 top-2 z-30 flex items-start gap-1">
                <Link
                  href={`/admin/directorio/${item.id}`}
                  title={isVal ? "Editar associació" : "Editar asociación"}
                  aria-label={isVal ? "Editar associació" : "Editar asociación"}
                  className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded bg-blue-700/90 text-sm text-white shadow-sm hover:bg-blue-800"
                >
                  ✏️
                </Link>
                <div className="pointer-events-auto">
                  <InlineReplaceImageButton entryId={item.id} />
                </div>
              </div>
            ) : null}
          </AssociationHeaderBackdrop>
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
        callbackPath={`/asociaciones/${item.slug}`}
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
        title={isVal ? "Associacions relacionades" : "Asociaciones relacionadas"}
        subtitle={isVal ? "Altres entitats afins a San Antonio de Benagéber." : "Otras entidades afines en San Antonio de Benagéber."}
        items={filteredRelated.map((related) => ({
          href: `/asociaciones/${related.slug}`,
          title: localizedText(locale, related.name, related.nameVal),
          description: stripMarkdownToPlain(localizedText(locale, related.description, related.descriptionVal)),
          imageUrl: related.imageUrl || null,
        }))}
      />
    </div>
  );
}
