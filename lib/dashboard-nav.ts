import type { Role } from "@/lib/authorize";

export type DashboardNavItem = { href: string; label: string };

const USER_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/facilities", label: "Cari fasilitas" },
  { href: "/reservations", label: "Reservasi saya" },
  { href: "/reports", label: "Laporan saya" },
];

const OFFICER_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Antrean" },
  { href: "/officer/queue", label: "Antrian petugas" },
];

const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/officer/queue", label: "Antrian petugas" },
  { href: "/admin/facilities", label: "Kelola fasilitas" },
  { href: "/admin/recap", label: "Rekap" },
  { href: "/admin/users", label: "Verifikasi pengguna" },
];

export function getDashboardNav(role: Role): DashboardNavItem[] {
  if (role === "ADMIN") return ADMIN_NAV;
  if (role === "OFFICER") return OFFICER_NAV;
  return USER_NAV;
}
