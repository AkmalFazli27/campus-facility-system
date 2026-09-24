import FacilitiesClient from "@/app/facilities/FacilitiesClient";
import { getFiltersFromSearchParams } from "@/lib/facilities/helpers";

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <FacilitiesClient initialFilters={getFiltersFromSearchParams(params)} />;
}
