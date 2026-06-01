import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventAdminControls } from "@/components/admin/EventAdminControls";
import { SharePlatformsRow } from "@/components/SharePlatformsRow";
import { EventDetailMeta } from "@/components/EventDetailMeta";
import { EventHeroImage } from "@/components/EventHeroImage";
import { renderMarkdown } from "@/lib/render-markdown";
import { stripMarkdownToPlain } from "@/lib/strip-markdown";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { localizedText } from "@/lib/localized";
import { isAdminUser } from "@/lib/auth";
import { absoluteMediaUrl, uiMediaUrl } from "@/lib/media-url";
import { findActiveEventByPublicSlug } from "@/lib/event-slug-resolve";
import { SITE_URL } from "@/lib/constants";
import { canonicalPath } from "@/lib/seo";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const eventItem = await findActiveEventByPublicSlug(params.slug);
  if (!eventItem) return {};

  const plainDesc = stripMarkdownToPlain(eventItem.description);
  const ogImagePath = uiMediaUrl(eventItem.imageUrl);
  const ogImageAbs = ogImagePath ? absoluteMediaUrl(ogImagePath) : null;
  return {
    title: `${eventItem.title} | Eventos`,
    description: plainDesc.slice(0, 160),
    alternates: { canonical: canonicalPath(`/eventos/${eventItem.slug}`) },
    openGraph: {
      title: eventItem.title,
      description: plainDesc.slice(0, 200),
      url: canonicalPath(`/eventos/${eventItem.slug}`),
      type: "article",
      images: ogImageAbs ? [{ url: ogImageAbs }] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const locale = getLocaleFromCookie();
  const isVal = locale === "val";
  const admin = await isAdminUser();
  const eventItem = await findActiveEventByPublicSlug(params.slug);
  if (!eventItem) {
    notFound();
  }
  if (eventItem.slug !== params.slug) {
    redirect(`/eventos/${eventItem.slug}`);
  }

  const titleText = localizedText(locale, eventItem.title, eventItem.titleVal);
  const descRaw = localizedText(locale, eventItem.description, eventItem.descriptionVal);
  const shareUrl = `${SITE_URL}/eventos/${eventItem.slug}`;

  return (
    <article className="container-page max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/eventos" className="inline-block text-sm font-semibold text-sab-terracotta hover:underline">
          {isVal ? "← Tornar a esdeveniments" : "← Volver a eventos"}
        </Link>
        {admin ? (
          <EventAdminControls
            eventId={eventItem.id}
            isVal={isVal}
            afterDeleteNavigateTo="/eventos"
          />
        ) : null}
      </div>
      <EventDetailMeta
        locale={locale}
        category={eventItem.category}
        details={eventItem.details}
        eventDate={eventItem.eventDate}
      />
      <SharePlatformsRow url={shareUrl} title={titleText} isVal={isVal} />
      <h1 className="text-3xl font-bold text-slate-900">{titleText}</h1>
      {eventItem.imageUrl ? <EventHeroImage imageUrl={eventItem.imageUrl} alt={titleText} /> : null}
      {descRaw.trim() ? (
        <div className="prose-article max-w-none text-slate-700 [&_img]:rounded-lg">
          {renderMarkdown(descRaw)}
        </div>
      ) : null}
      {eventItem.linkUrl ? (
        <p>
          <a href={eventItem.linkUrl} target="_blank" rel="noreferrer noopener" className="font-semibold text-sab-terracotta hover:underline">
            Ir a la web oficial del evento ↗
          </a>
        </p>
      ) : null}
    </article>
  );
}
