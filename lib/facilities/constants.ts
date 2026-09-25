import type { FacilityStatus } from "@/lib/facilities/types";

export const facilityTypes = [
  { value: "", label: "Semua tipe" },
  { value: "kelas", label: "Kelas" },
  { value: "aula", label: "Aula" },
  { value: "lab", label: "Laboratorium" },
  { value: "lapangan", label: "Lapangan" },
  { value: "alat", label: "Alat" },
] as const;

export const statusCopy: Record<FacilityStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Aktif", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  INACTIVE: { label: "Tidak aktif", className: "border-slate-200 bg-slate-100 text-slate-600" },
  UNDER_MAINTENANCE: {
    label: "Dalam perbaikan",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};
