import { CommerceSectionCatalog } from "@/components/CommerceSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ComerciosGimnasiosPage({ searchParams }: { searchParams?: SearchParams }) {
  return <CommerceSectionCatalog sectionSlug="gimnasios" searchParams={searchParams} />;
}
