"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import logo from "@/components/assets/logo.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { isAuthRoute } from "@/lib/landing";

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Fasilitas", href: "/facilities" },
  { label: "Tentang", href: "/tentang" },
];

export default function PublicHeader() {
  const pathname = usePathname();

  if (isAuthRoute(pathname)) return null;

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
              Gunakan menu ini untuk menjelajahi fasilitas atau masuk ke akun Anda.
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
          </DialogContent>
        </Dialog>
      </nav>
    </div>
  );
}
