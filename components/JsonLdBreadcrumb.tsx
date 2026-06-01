import { canonicalPath } from "@/lib/seo";

type Crumb = { name: string; path: string };

type Props = { items: Crumb[] };

export function JsonLdBreadcrumbList({ items }: Props) {
  const list = items.map((item, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    name: item.name,
    item: canonicalPath(item.path),
  }));

  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
