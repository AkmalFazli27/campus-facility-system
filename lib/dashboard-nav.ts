import type { Role } from "@/lib/authorize";

export type DashboardNavItem = { href: string; label: string; section: string };

const USER_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", section: "Pengguna" },
  { href: "/reservations", label: "Reservasi Saya", section: "Pengguna" },
  { href: "/reports", label: "Laporan Saya", section: "Pengguna" },
];

const OFFICER_NAV: DashboardNavItem[] = [
  { href: "/officer/queue", label: "Antrian Petugas", section: "Petugas" },
];

const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", section: "Admin" },
  { href: "/admin/facilities", label: "Kelola Fasilitas", section: "Admin" },
  { href: "/admin/recap", label: "Rekap Admin", section: "Admin" },
  { href: "/admin/users", label: "Verifikasi Pengguna", section: "Admin" },
];

export function getDashboardNav(role: Role): DashboardNavItem[] {
  if (role === "ADMIN") return ADMIN_NAV;
  if (role === "OFFICER") return OFFICER_NAV;
  return USER_NAV;
}

export function isDashboardNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function roleLabel(role: Role): string {
  if (role === "ADMIN") return "Admin";
  if (role === "OFFICER") return "Petugas";
  return "Pengguna";
}
