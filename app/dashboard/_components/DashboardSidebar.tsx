"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardLogoutButton from "@/app/dashboard/_components/DashboardLogoutButton";
import { getDashboardNav, isDashboardNavItemActive, roleLabel } from "@/lib/dashboard-nav";
import type { Role } from "@/lib/authorize";
import type { SessionUser } from "@/lib/session";
import { userTypeLabel } from "@/lib/user-dashboard";
import { cn } from "@/lib/utils";

type SidebarUser = Pick<SessionUser, "name" | "identityNumber" | "userType">;

function UserSubtitle({ user, role }: { user: SidebarUser; role: Role }) {
  if (user.identityNumber) return `${user.identityNumber} · ${userTypeLabel(user.userType)}`;
  return roleLabel(role);
}

function SidebarNav({ role, orientation }: { role: Role; orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const items = getDashboardNav(role);
  const section = items[0]?.section ?? roleLabel(role);
  return (
    <nav aria-label={`Navigasi dashboard ${role.toLowerCase()}`} className={orientation === "vertical" ? "flex flex-col gap-1" : "flex gap-2 overflow-x-auto"}>
      <p className="px-3 pt-1 text-xs font-semibold tracking-wider text-ink-400 uppercase">{section}</p>
      {items.map((item) => {
        const isActive = isDashboardNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap",
              isActive
                ? "bg-brand-500 font-semibold text-white shadow-sm"
                : "text-ink-600 hover:bg-slate-100 hover:text-ink-950",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardSidebar({ role, user }: { role: Role; user: SidebarUser }) {
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <>
      <div className="lg:hidden">
        <div className="mb-4 flex items-center gap-3">
          <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-950">{user.name}</p>
            <p className="truncate text-xs text-ink-600">
              <UserSubtitle user={user} role={role} />
            </p>
          </div>
        </div>
        <SidebarNav role={role} orientation="horizontal" />
      </div>
      <aside aria-label={`Panel dashboard ${role.toLowerCase()}`} className="fixed top-0 left-0 hidden h-screen w-[250px] shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 max-lg:hidden lg:flex">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 px-1">
            <p className="text-lg font-bold tracking-tight text-ink-950">
              Kampus<span className="text-brand-500">Space</span>
            </p>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
              <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
              Ruang Kerja Terpadu
            </span>
          </div>
          <SidebarNav role={role} orientation="vertical" />
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-950">{user.name}</p>
              <p className="truncate text-xs text-ink-600">
                <UserSubtitle user={user} role={role} />
              </p>
            </div>
          </div>
          <DashboardLogoutButton className="rounded-full" />
        </div>
      </aside>
    </>
  );
}
