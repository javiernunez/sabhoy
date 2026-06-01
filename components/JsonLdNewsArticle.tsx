import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { absoluteMediaUrl } from "@/lib/media-url";

type Props = {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  url: string;
  imageUrl?: string | null;
  articleSection: string;
};

export function JsonLdNewsArticle({ title, description, datePublished, dateModified, url, imageUrl, articleSection }: Props) {
  const imageAbs = absoluteMediaUrl(imageUrl);
  const json = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    datePublished,
    dateModified,
    inLanguage: "es-ES",
    articleSection,
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(imageAbs ? { image: [imageAbs] } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
