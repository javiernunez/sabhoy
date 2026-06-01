import { AssociationSectionCatalog } from "@/components/AssociationSectionCatalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AsociacionesClubesPage({ searchParams }: { searchParams?: SearchParams }) {
  return <AssociationSectionCatalog sectionSlug="clubes-deportivos" searchParams={searchParams} />;
}
