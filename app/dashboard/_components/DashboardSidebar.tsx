"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck2,
  ChevronsLeft,
  ChevronsRight,
  ClipboardClock,
  ClipboardList,
  Home,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import DashboardLogoutButton from "@/app/dashboard/_components/DashboardLogoutButton";
import { getDashboardNav, isDashboardNavItemActive, roleLabel } from "@/lib/dashboard-nav";
import type { Role } from "@/lib/authorize";
import type { SessionUser } from "@/lib/session";
import { userTypeLabel } from "@/lib/user-dashboard";
import { cn } from "@/lib/utils";

export type SidebarUser = Pick<SessionUser, "name" | "identityNumber" | "userType">;

const NAV_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/reservations": CalendarCheck2,
  "/reports": ClipboardList,
  "/officer/queue": ClipboardList,
  "/admin/facilities": Building2,
  "/admin/recap": ClipboardClock,
  "/admin/users": Users,
};

function UserSubtitle({ user, role }: { user: SidebarUser; role: Role }) {
  if (user.identityNumber) return `${user.identityNumber} · ${userTypeLabel(user.userType)}`;
  return roleLabel(role);
}

export function SidebarNav({
  role,
  orientation,
  collapsed = false,
}: {
  role: Role;
  orientation: "vertical" | "horizontal";
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const items = getDashboardNav(role);
  const section = items[0]?.section ?? roleLabel(role);
  return (
    <nav aria-label={`Navigasi dashboard ${role.toLowerCase()}`} className={orientation === "vertical" ? "flex flex-col gap-1" : "flex gap-2 overflow-x-auto"}>
      {!collapsed && (
        <p className="px-3 pt-1 text-xs font-semibold tracking-wider text-ink-400 uppercase">{section}</p>
      )}
      {items.map((item) => {
        const isActive = isDashboardNavItemActive(pathname, item.href);
        const Icon = NAV_ICONS[item.href] ?? LayoutDashboard;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap",
              collapsed && "justify-center px-2",
              isActive
                ? "bg-brand-500 font-semibold text-white shadow-sm"
                : "text-ink-600 hover:bg-slate-100 hover:text-ink-950",
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardSidebar({
  role,
  user,
  collapsed = false,
  onToggle,
}: {
  role: Role;
  user: SidebarUser;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <>
      <aside
        aria-label={`Panel dashboard ${role.toLowerCase()}`}
        className={cn(
          "fixed top-0 left-0 hidden h-screen shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 transition-[width] duration-200 max-lg:hidden lg:flex",
          collapsed ? "w-[72px] items-center px-2" : "w-[250px]",
        )}
      >
        <div className={cn("flex w-full flex-col gap-5", collapsed && "items-center")}>
          <div className={cn("flex w-full flex-col gap-2", collapsed ? "items-center px-0" : "px-1")}>
            <div className={cn("flex w-full items-center", collapsed ? "flex-col gap-2" : "justify-between gap-2")}>
              <Link
                href="/"
                title="Kembali ke Beranda"
                aria-label="Kembali ke Beranda"
                className="rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                {collapsed ? (
                  <span aria-hidden className="flex size-9 items-center justify-center rounded-xl bg-brand-500 text-base font-bold text-white">
                    K
                  </span>
                ) : (
                  <p className="text-lg font-bold tracking-tight text-ink-950">
                    Kampus<span className="text-brand-500">Space</span>
                  </p>
                )}
              </Link>
              {onToggle && (
                <button
                  type="button"
                  onClick={onToggle}
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
                  title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-ink-600 transition-colors hover:bg-slate-100 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                >
                  {collapsed ? <ChevronsRight aria-hidden className="size-4" /> : <ChevronsLeft aria-hidden className="size-4" />}
                </button>
              )}
            </div>
            {!collapsed && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                Ruang Kerja Terpadu
              </span>
            )}
          </div>
          <SidebarNav role={role} orientation="vertical" collapsed={collapsed} />
          <Link
            href="/"
            title="Kembali ke Beranda"
            className={cn(
              "flex items-center gap-2.5 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-slate-100 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
              collapsed && "justify-center px-2",
            )}
          >
            <Home aria-hidden className="size-4 shrink-0" />
            {!collapsed && "Kembali ke Beranda"}
          </Link>
        </div>
        <div className={cn("flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-3", collapsed && "items-center bg-transparent p-0")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {initial}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-950">{user.name}</p>
                <p className="truncate text-xs text-ink-600">
                  <UserSubtitle user={user} role={role} />
                </p>
              </div>
            )}
          </div>
          <DashboardLogoutButton className="rounded-full" iconOnly={collapsed} />
        </div>
      </aside>
    </>
  );
}
