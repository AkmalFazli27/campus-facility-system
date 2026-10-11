// Helper murni untuk landing page publik.
// Dipakai Client Component (QuickSearchForm, PublicHeader) dan bisa
// dipakai ulang halaman lain. Tanpa akses DB.

export type FacilitySearchInput = {
  type?: string;
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
};

export function buildFacilitySearchUrl(input: FacilitySearchInput): string {
  const params = new URLSearchParams();
  const type = input.type?.trim();
  if (type && type !== "all") params.set("type", type);
  const location = input.location?.trim();
  if (location && location !== "all") params.set("location", location);
  const date = input.date?.trim();
  if (date) params.set("date", date);
  const startTime = input.startTime?.trim();
  const endTime = input.endTime?.trim();
  if (startTime && endTime) {
    params.set("start_time", startTime);
    params.set("end_time", endTime);
  }
  const qs = params.toString();
  return qs ? `/facilities?${qs}` : "/facilities";
}

export type TimeSlot = {
  start: string;
  end: string;
  label: string;
};

// Slot tetap 30 menit pada jam operasional 07.00-20.00 (PRD §7.1).
export function buildTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let minutes = 7 * 60; minutes < 20 * 60; minutes += 30) {
    const start = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60
    ).padStart(2, "0")}`;
    const endMinutes = minutes + 30;
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
      endMinutes % 60
    ).padStart(2, "0")}`;
    slots.push({
      start,
      end,
      label: `${start.replace(":", ".")} – ${end.replace(":", ".")}`,
    });
  }
  return slots;
}

// Opsi jam mulai: 07.00-19.30 step 30 menit (26 opsi, start tiap slot).
export function buildStartOptions(): string[] {
  const options: string[] = [];
  for (let minutes = 7 * 60; minutes < 20 * 60; minutes += 30) {
    const value = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60
    ).padStart(2, "0")}`;
    options.push(value);
  }
  return options;
}

// Opsi jam selesai: 07.30-20.00 step 30 menit (26 opsi, end tiap slot),
// disaring > start. Start tidak valid → daftar penuh.
export function buildEndOptions(start: string): string[] {
  const options: string[] = [];
  for (let minutes = 7 * 60; minutes < 20 * 60; minutes += 30) {
    const endMinutes = minutes + 30;
    const value = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(
      endMinutes % 60
    ).padStart(2, "0")}`;
    options.push(value);
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(start)) return options;
  return options.filter((time) => time > start);
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

const DASHBOARD_ROUTES = [
  "/dashboard",
  "/reservations",
  "/reports",
  "/officer",
  "/admin",
];

export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
