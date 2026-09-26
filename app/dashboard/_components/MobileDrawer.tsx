"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, X } from "lucide-react";
import DashboardLogoutButton from "@/app/dashboard/_components/DashboardLogoutButton";
import { SidebarNav, type SidebarUser } from "@/app/dashboard/_components/DashboardSidebar";
import type { Role } from "@/lib/authorize";
import { cn } from "@/lib/utils";

export default function MobileDrawer({
  open,
  onClose,
  role,
  user,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
  user: SidebarUser;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div role="dialog" aria-modal="true" aria-label="Navigasi dashboard" className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Tutup navigasi dashboard"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-950/40"
      />
      <div
        onClick={onClose}
        className="absolute top-0 left-0 flex h-full w-[280px] flex-col justify-between gap-5 bg-white p-4 shadow-xl"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2 px-1">
            <Link
              href="/"
              aria-label="Kembali ke Beranda"
              className="rounded-lg text-lg font-bold tracking-tight text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              Kampus<span className="text-brand-500">Space</span>
            </Link>
            <button
              type="button"
              aria-label="Tutup navigasi dashboard"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-ink-600 transition-colors hover:bg-slate-100 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <SidebarNav role={role} orientation="vertical" />
          <Link
            href="/"
            title="Kembali ke Beranda"
            className={cn(
              "flex items-center gap-2.5 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-slate-100 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
            )}
          >
            <Home aria-hidden className="size-4 shrink-0" />
            Kembali ke Beranda
          </Link>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-950">{user.name}</p>
              <p className="truncate text-xs text-ink-600">{role === "ADMIN" ? "Admin" : role === "OFFICER" ? "Petugas" : "Pengguna"}</p>
            </div>
          </div>
          <DashboardLogoutButton className="rounded-full" />
        </div>
      </div>
    </div>
  );
}
