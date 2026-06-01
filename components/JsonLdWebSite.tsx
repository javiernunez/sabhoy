import { SITE_INSTAGRAM_URL, SITE_NAME, SITE_URL } from "@/lib/constants";

/** WebSite + organización; colocado en la portada. */
export function JsonLdWebSite() {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsMediaOrganization",
        "@id": orgId,
        name: SITE_NAME,
        url: SITE_URL,
        sameAs: [SITE_INSTAGRAM_URL],
        inLanguage: "es-ES",
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "es-ES",
        publisher: { "@id": orgId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
