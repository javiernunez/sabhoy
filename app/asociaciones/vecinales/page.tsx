import { AssociationSectionCatalog } from "@/components/AssociationSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AsociacionesVecinalesPage({ searchParams }: { searchParams?: SearchParams }) {
  return <AssociationSectionCatalog sectionSlug="vecinales" searchParams={searchParams} />;
}
