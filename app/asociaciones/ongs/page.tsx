import { AssociationSectionCatalog } from "@/components/AssociationSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AsociacionesOngsPage({ searchParams }: { searchParams?: SearchParams }) {
  return <AssociationSectionCatalog sectionSlug="ongs" searchParams={searchParams} />;
}
