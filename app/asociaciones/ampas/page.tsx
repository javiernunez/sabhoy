import { AssociationSectionCatalog } from "@/components/AssociationSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AsociacionesAmpasPage({ searchParams }: { searchParams?: SearchParams }) {
  return <AssociationSectionCatalog sectionSlug="ampas" searchParams={searchParams} />;
}
