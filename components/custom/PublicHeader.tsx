"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import logo from "@/components/assets/logo.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isAuthRoute, isDashboardRoute } from "@/lib/landing";

export type HeaderUser = {
  name: string;
  email: string;
  role: string;
} | null;

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Fasilitas", href: "/facilities" },
  { label: "Tentang", href: "/tentang" },
];

export default function PublicHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isAuthRoute(pathname)) return null;
  if (isDashboardRoute(pathname)) return null;

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout gagal");
      setConfirmOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Gagal keluar");
    } finally {
      setLoggingOut(false);
    }
  }

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sticky top-3 z-40 px-3 pt-1 sm:top-5">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 rounded-full border border-brand-100 bg-white/80 py-2 pr-2 pl-3 shadow-lg shadow-brand-100/60 backdrop-blur-md"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <Image
            src={logo}
            alt="Logo KampusSpace"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-ink-950">
              Kampus<span className="text-brand-500">Space</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest text-ink-400 uppercase">
              Portal Fasilitas
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 text-sm font-medium text-ink-600 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors hover:bg-brand-50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                  isActive(link.href) && "bg-brand-50 font-semibold text-brand-600"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Popover>
              <PopoverTrigger
                aria-haspopup="menu"
                className="inline-flex max-h-11 min-h-11 items-center gap-1.5 rounded-full bg-brand-50 px-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <span
                  className="max-w-32 truncate"
                  title={user.name}
                >
                  {user.name}
                </span>
                <ChevronDown aria-hidden className="size-4 shrink-0" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-64 rounded-2xl p-2"
              >
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-ink-950">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-ink-500">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                >
                  <LayoutDashboard aria-hidden className="size-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none disabled:opacity-60"
                >
                  <LogOut aria-hidden className="size-4" />
                  {loggingOut ? "Keluar..." : "Keluar"}
                </button>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants(), "rounded-full bg-brand-500 hover:bg-brand-600")}
              >
                Daftar Akun
              </Link>
            </>
          )}
        </div>

        <Dialog>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Buka menu navigasi"
                className="rounded-full md:hidden"
              >
                <Menu aria-hidden />
              </Button>
            }
          />
          <DialogContent className="rounded-3xl">
            <DialogTitle>Menu navigasi</DialogTitle>
            <DialogDescription>
              {user
                ? `Masuk sebagai ${user.name}. Kelola reservasi dari dashboard.`
                : "Gunakan menu ini untuk menjelajahi fasilitas atau masuk ke akun Anda."}
            </DialogDescription>
            <ul className="flex flex-col gap-1 text-sm font-medium text-ink-600">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <DialogClose
                    render={
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "block rounded-2xl px-4 py-3 hover:bg-brand-50 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                          isActive(link.href) && "bg-brand-50 font-semibold text-brand-600"
                        )}
                      >
                        {link.label}
                      </Link>
                    }
                  />
                </li>
              ))}
            </ul>
            {user ? (
              <div className="flex flex-col gap-2 pt-2">
                <div className="rounded-2xl bg-brand-50 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink-950">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-ink-500">{user.email}</p>
                </div>
                <DialogClose
                  render={
                    <Link
                      href="/dashboard"
                      className={cn(buttonVariants(), "w-full rounded-full bg-brand-500 hover:bg-brand-600")}
                    >
                      Dashboard
                    </Link>
                  }
                />
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(true)}
                  disabled={loggingOut}
                  className="w-full rounded-full"
                >
                  {loggingOut ? "Keluar..." : "Keluar"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <DialogClose
                  render={
                    <Link
                      href="/login"
                      className={cn(buttonVariants({ variant: "outline" }), "flex-1 rounded-full")}
                    >
                      Masuk
                    </Link>
                  }
                />
                <DialogClose
                  render={
                    <Link
                      href="/register"
                      className={cn(buttonVariants(), "flex-1 rounded-full bg-brand-500 hover:bg-brand-600")}
                    >
                      Daftar Akun
                    </Link>
                  }
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </nav>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keluar dari akun?</DialogTitle>
            <DialogDescription>
              Kamu perlu masuk kembali untuk mengelola reservasi dan laporan
              fasilitas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  disabled={loggingOut}
                  className="rounded-full"
                >
                  Batal
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full"
            >
              {loggingOut ? "Keluar..." : "Ya, keluar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
