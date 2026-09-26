"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu } from "lucide-react";
import { getDashboardPageTitle } from "@/lib/dashboard-nav";

export default function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Buka navigasi dashboard"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-slate-100 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
      >
        <Menu aria-hidden className="size-5" />
      </button>
      <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-ink-950">
        {getDashboardPageTitle(pathname)}
      </p>
      <Link
        href="/"
        aria-label="Kembali ke Beranda"
        title="Kembali ke Beranda"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-slate-100 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
      >
        <Home aria-hidden className="size-5" />
      </Link>
    </div>
  );
}
