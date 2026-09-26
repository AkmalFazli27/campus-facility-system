"use client";

import { useState, type ReactNode } from "react";
import DashboardSidebar, { type SidebarUser } from "@/app/dashboard/_components/DashboardSidebar";
import type { Role } from "@/lib/authorize";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kampusspace:sidebar-collapsed";

export default function DashboardShell({
  role,
  user,
  children,
  maxWidth = "6xl",
}: {
  role: Role;
  user: SidebarUser;
  children: ReactNode;
  maxWidth?: "6xl" | "7xl";
}) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  function handleToggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* abaikan */
      }
      return next;
    });
  }

  return (
    <div className={cn("w-full transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-[250px]")}>
      <div className={cn("mx-auto flex w-full flex-col gap-6 px-6 py-10", maxWidth === "7xl" ? "max-w-7xl" : "max-w-6xl")}>
        <DashboardSidebar role={role} user={user} collapsed={collapsed} onToggle={handleToggle} />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
