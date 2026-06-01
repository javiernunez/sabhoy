import { AssociationSectionCatalog } from "@/components/AssociationSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AsociacionesCasalesPage({ searchParams }: { searchParams?: SearchParams }) {
  return <AssociationSectionCatalog sectionSlug="casales" searchParams={searchParams} />;
}
