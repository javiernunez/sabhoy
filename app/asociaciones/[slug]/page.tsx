import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AssociationHeaderBackdrop } from "@/components/AssociationHeaderBackdrop";
import { InlineReplaceImageButton } from "@/components/admin/InlineReplaceImageButton";
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

function FacebookIcon({ className = "h-5 w-5 fill-current" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.5V3.8c-.3 0-1.1-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V10H8v3h2.7v8h2.8z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5 fill-current" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8a2.7 2.7 0 0 0-2.7 2.7v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9zm9.45 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.8A2.2 2.2 0 1 0 12 14.2 2.2 2.2 0 0 0 12 9.8z" />
    </svg>
  );
}

function WebIcon({ className = "h-5 w-5 fill-current" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.1a15.3 15.3 0 0 0-1.4-5 8.1 8.1 0 0 1 4.5 5zM12 4.2c.9 1.2 2.1 3.4 2.7 6.8H9.3c.6-3.4 1.8-5.6 2.7-6.8zM8.6 6a15.3 15.3 0 0 0-1.4 5H4.1a8.1 8.1 0 0 1 4.5-5zM4.1 13h3.1a15.3 15.3 0 0 0 1.4 5 8.1 8.1 0 0 1-4.5-5zm7.9 6.8c-.9-1.2-2.1-3.4-2.7-6.8h5.4c-.6 3.4-1.8 5.6-2.7 6.8zm3.4-1.8a15.3 15.3 0 0 0 1.4-5h3.1a8.1 8.1 0 0 1-4.5 5z" />
    </svg>
  );
}

function LocationIcon({ className = "h-5 w-5 fill-current" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5 fill-current" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M6.6 10.8a15.8 15.8 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.2.4 2.4.6 3.7.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.8 22.2 1.8 13.2 1.8 2.7 1.8 2 2.3 1.5 3 1.5h4.5c.7 0 1.2.5 1.2 1.2 0 1.3.2 2.5.6 3.7.1.4 0 .9-.3 1.2l-2.4 2.2z" />
    </svg>
  );
}

function TikTokIcon({ className = "h-5 w-5 fill-current" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

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

  const mapsUrl = item.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}` : null;
  const phoneHref = item.phone ? `tel:${item.phone.replaceAll(/\s+/g, "")}` : null;
  const websiteTrim = item.websiteUrl?.trim() ?? "";
  const hrefTrim = item.href?.trim() ?? "";
  const secondaryWebHref = hrefTrim && hrefTrim !== websiteTrim ? hrefTrim : null;
  const hasEnlaces =
    Boolean(websiteTrim) ||
    Boolean(secondaryWebHref) ||
    Boolean(phoneHref) ||
    Boolean(mapsUrl) ||
    Boolean(item.facebookUrl) ||
    Boolean(item.instagramUrl) ||
    Boolean(item.tiktokUrl);

  let secondaryWebLinkLabel: string | null = null;
  if (secondaryWebHref) {
    secondaryWebLinkLabel = websiteTrim ? (isVal ? "Altre web" : "Otro sitio web") : "Web";
  }

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
            {hasEnlaces ? (
              <section className="mt-8 border-t border-slate-200 pt-6" aria-labelledby="asoc-enlaces-heading">
                <h2 id="asoc-enlaces-heading" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {isVal ? "Enllaços" : "Enlaces"}
                </h2>
                <ul className="mt-4 divide-y divide-slate-100">
                  {websiteTrim ? (
                    <li>
                      <a
                        href={websiteTrim}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 py-3 text-slate-900 first:pt-0"
                      >
                        <span className="text-blue-600" aria-hidden>
                          <WebIcon />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-sab-terracotta-dark underline-offset-2 group-hover:underline">
                          Web oficial
                        </span>
                        <span className="shrink-0 text-slate-400" aria-hidden>
                          →
                        </span>
                      </a>
                    </li>
                  ) : null}
                  {phoneHref ? (
                    <li>
                      <a href={phoneHref} className="group flex items-center gap-3 py-3 text-slate-900">
                        <span className="text-blue-600" aria-hidden>
                          <PhoneIcon />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-sab-terracotta-dark underline-offset-2 group-hover:underline">
                          {isVal ? "Telèfon" : "Teléfono"}
                        </span>
                        <span className="truncate text-right text-xs text-slate-500">{item.phone}</span>
                      </a>
                    </li>
                  ) : null}
                  {secondaryWebHref ? (
                    <li>
                      <a
                        href={secondaryWebHref}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 py-3 text-slate-900"
                      >
                        <span className="text-sky-600" aria-hidden>
                          <WebIcon />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-sab-terracotta-dark underline-offset-2 group-hover:underline">
                          {secondaryWebLinkLabel}
                        </span>
                        <span className="shrink-0 text-slate-400" aria-hidden>
                          →
                        </span>
                      </a>
                    </li>
                  ) : null}
                  {item.instagramUrl ? (
                    <li>
                      <a
                        href={item.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 py-3 text-slate-900"
                      >
                        <span className="text-[#E4405F]" aria-hidden>
                          <InstagramIcon />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-sab-terracotta-dark underline-offset-2 group-hover:underline">Instagram</span>
                        <span className="shrink-0 text-slate-400" aria-hidden>
                          →
                        </span>
                      </a>
                    </li>
                  ) : null}
                  {item.facebookUrl ? (
                    <li>
                      <a
                        href={item.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 py-3 text-slate-900"
                      >
                        <span className="text-[#1877f2]" aria-hidden>
                          <FacebookIcon />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-sab-terracotta-dark underline-offset-2 group-hover:underline">Facebook</span>
                        <span className="shrink-0 text-slate-400" aria-hidden>
                          →
                        </span>
                      </a>
                    </li>
                  ) : null}
                  {item.tiktokUrl ? (
                    <li>
                      <a
                        href={item.tiktokUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 py-3 text-slate-900"
                      >
                        <span className="text-[#010101]" aria-hidden>
                          <TikTokIcon />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-sab-terracotta-dark underline-offset-2 group-hover:underline">TikTok</span>
                        <span className="shrink-0 text-slate-400" aria-hidden>
                          →
                        </span>
                      </a>
                    </li>
                  ) : null}
                  {mapsUrl ? (
                    <li>
                      <a href={mapsUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-3 py-3 text-slate-900">
                        <span className="text-[#EA4335]" aria-hidden>
                          <LocationIcon />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-sab-terracotta-dark underline-offset-2 group-hover:underline">
                          {isVal ? "Adreça a Google Maps" : "Dirección en Google Maps"}
                        </span>
                        <span className="shrink-0 text-slate-400" aria-hidden>
                          →
                        </span>
                      </a>
                    </li>
                  ) : null}
                </ul>
              </section>
            ) : null}
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
