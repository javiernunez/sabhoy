import { CommerceSectionCatalog } from "@/components/CommerceSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ComerciosRestaurantesPage({ searchParams }: { searchParams?: SearchParams }) {
  return <CommerceSectionCatalog sectionSlug="restaurantes" searchParams={searchParams} />;
}
