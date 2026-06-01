import { CommerceSectionCatalog } from "@/components/CommerceSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ComerciosTiendasPage({ searchParams }: { searchParams?: SearchParams }) {
  return <CommerceSectionCatalog sectionSlug="tiendas" searchParams={searchParams} />;
}
