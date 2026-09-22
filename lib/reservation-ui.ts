export const RESERVATION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED_BY_USER",
  "CANCELLED_BY_OFFICER",
  "COMPLETED",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export type ReservationStatusFilter = ReservationStatus | "ALL";

export type ReservationFilters = {
  status: ReservationStatusFilter;
  from: string;
  to: string;
};

export type ReservationSummary = {
  id: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: ReservationStatus;
  cancellationReason: string | null;
  createdAt: string;
  facility: {
    id: number;
    name: string;
    type: string;
    location: string;
  };
};

export type ReservationDetail = Omit<ReservationSummary, "facility"> & {
  processedAt: string | null;
  updatedAt: string;
  facility: ReservationSummary["facility"] & {
    capacity: number;
    status: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
  };
};

export const RESERVATION_STATUS_META: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Menunggu persetujuan",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Disetujui",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  REJECTED: {
    label: "Ditolak",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  CANCELLED_BY_USER: {
    label: "Dibatalkan pengguna",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
  CANCELLED_BY_OFFICER: {
    label: "Dibatalkan petugas",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  COMPLETED: {
    label: "Selesai",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function buildReservationHistoryUrl(filters: ReservationFilters) {
  const params = new URLSearchParams();

  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const query = params.toString();
  return query ? `/api/reservations/my?${query}` : "/api/reservations/my";
}

export function formatReservationDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function formatReservationDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}
