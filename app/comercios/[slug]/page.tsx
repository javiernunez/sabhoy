import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { InlineReplaceImageButton } from "@/components/admin/InlineReplaceImageButton";
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

type Params = { params: { slug: string } };

function FacebookIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.5V3.8c-.3 0-1.1-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V10H8v3h2.7v8h2.8z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8a2.7 2.7 0 0 0-2.7 2.7v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9zm9.45 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.8A2.2 2.2 0 1 0 12 14.2 2.2 2.2 0 0 0 12 9.8z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.1a15.3 15.3 0 0 0-1.4-5 8.1 8.1 0 0 1 4.5 5zM12 4.2c.9 1.2 2.1 3.4 2.7 6.8H9.3c.6-3.4 1.8-5.6 2.7-6.8zM8.6 6a15.3 15.3 0 0 0-1.4 5H4.1a8.1 8.1 0 0 1 4.5-5zM4.1 13h3.1a15.3 15.3 0 0 0 1.4 5 8.1 8.1 0 0 1-4.5-5zm7.9 6.8c-.9-1.2-2.1-3.4-2.7-6.8h5.4c-.6 3.4-1.8 5.6-2.7 6.8zm3.4-1.8a15.3 15.3 0 0 0 1.4-5h3.1a8.1 8.1 0 0 1-4.5 5z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M6.6 10.8a15.8 15.8 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.2.4 2.4.6 3.7.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.8 22.2 1.8 13.2 1.8 2.7 1.8 2 2.3 1.5 3 1.5h4.5c.7 0 1.2.5 1.2 1.2 0 1.3.2 2.5.6 3.7.1.4 0 .9-.3 1.2l-2.4 2.2z" />
    </svg>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
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

export default async function ComercioDetailPage({ params }: Params) {
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

  const mapsUrl = item.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}` : null;
  const phoneHref = item.phone ? `tel:${item.phone.replaceAll(/\s+/g, "")}` : null;

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
            {item.websiteUrl ? (
              <a href={item.websiteUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-sab-terracotta hover:underline">
                {isVal ? "Web oficial →" : "Web oficial →"}
              </a>
            ) : item.href ? (
              <a href={item.href} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-sab-terracotta hover:underline">
                {isVal ? "Enllaç extern →" : "Enlace externo →"}
              </a>
            ) : null}
            {item.websiteUrl || item.instagramUrl || item.facebookUrl || mapsUrl || phoneHref ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LocationIcon />
                    <span>{isVal ? "Adreça" : "Dirección"}</span>
                  </a>
                ) : null}
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <PhoneIcon />
                    <span>{isVal ? "Telèfon" : "Teléfono"}</span>
                  </a>
                ) : null}
                {item.websiteUrl ? (
                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <WebIcon />
                    <span>Web</span>
                  </a>
                ) : null}
                {item.facebookUrl ? (
                  <a
                    href={item.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FacebookIcon />
                    <span>Facebook</span>
                  </a>
                ) : null}
                {item.instagramUrl ? (
                  <a
                    href={item.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <InstagramIcon />
                    <span>Instagram</span>
                  </a>
                ) : null}
              </div>
            ) : null}
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
