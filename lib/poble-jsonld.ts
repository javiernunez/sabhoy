import type { PoblePageCategory } from "@prisma/client";
import { canonicalPath } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const PLACE = {
  "@type": "Place" as const,
  name: "San Antonio de Benagéber",
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Antonio de Benagéber",
    addressRegion: "Comunitat Valenciana",
    addressCountry: "ES",
  },
};

export function buildNostrePoblePageJsonLd(params: {
  category: PoblePageCategory;
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
}): object {
  const { category, title, description, path, imageUrl } = params;
  const url = canonicalPath(path);

  if (category === "MONUMENTS") {
    return {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: title,
      description,
      url,
      ...(imageUrl ? { image: [imageUrl.startsWith("http") ? imageUrl : `${SITE_URL.replace(/\/$/, "")}${imageUrl}`] } : {}),
      isPartOf: PLACE,
    };
  }
  if (category === "MAYORS") {
    return {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: title,
      description,
      url,
      mainEntity: { "@type": "Person", name: title, jobTitle: "Alcalde" },
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    name: title,
    description,
    url,
    inLanguage: "es-ES",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}
