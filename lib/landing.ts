// Helper murni untuk landing page publik.
// Dipakai Client Component (QuickSearchForm, PublicHeader) dan bisa
// dipakai ulang halaman lain. Tanpa akses DB.

export type FacilitySearchInput = {
  type?: string;
  location?: string;
  date?: string;
};

export function buildFacilitySearchUrl(input: FacilitySearchInput): string {
  const params = new URLSearchParams();
  const type = input.type?.trim();
  if (type && type !== "all") params.set("type", type);
  const location = input.location?.trim();
  if (location) params.set("location", location);
  const date = input.date?.trim();
  if (date) params.set("date", date);
  const qs = params.toString();
  return qs ? `/facilities?${qs}` : "/facilities";
}

export function facilityStatusLabel(
  status: "ACTIVE" | "UNDER_MAINTENANCE" | "INACTIVE"
): string {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "UNDER_MAINTENANCE":
      return "Dalam perbaikan";
    case "INACTIVE":
      return "Nonaktif";
  }
}

const AUTH_ROUTES = ["/login", "/register", "/pending-verification"];

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
