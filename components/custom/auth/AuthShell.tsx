"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buildAuthToggleHref, type AuthMode } from "@/lib/auth-ui";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import OverlayPanel from "./OverlayPanel";

export default function AuthShell({
  initialMode,
  next,
}: {
  initialMode: AuthMode;
  next?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const toRegister = mode === "sign-up";

  function toggle(nextToRegister: boolean) {
    setMode(nextToRegister ? "sign-up" : "sign-in");
    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        buildAuthToggleHref(nextToRegister, next)
      );
    }
  }

  return (
    <main className="relative flex w-full flex-1 flex-col">
      <div
        className={`auth-slider relative flex w-full flex-1 flex-col overflow-hidden bg-surface md:block md:min-h-svh ${
          toRegister ? "right-panel-active" : ""
        }`}
      >
        <div
          className={`form-container sign-in-container relative w-full flex-col items-center justify-center gap-6 overflow-y-auto p-6 sm:p-10 md:p-12 md:absolute md:top-0 md:left-0 md:h-full md:w-1/2 ${
            toRegister ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="w-full max-w-[400px]">
            <div className="mb-3 flex flex-col gap-1">
              <Link
                href="/"
                aria-label="Kembali ke beranda"
                className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <ArrowLeft aria-hidden className="size-4" />
                <span>Kembali ke beranda</span>
              </Link>
              <Link
                href="/"
                className="text-3xl font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <span className="text-ink-950">Kampus</span>
                <span className="text-brand-500">Space</span>
              </Link>

            </div>
            <h1 className="text-4xl leading-[44px] font-medium text-ink-950">
              Selamat datang kembali
            </h1>
            <p className="mt-1 text-base text-ink-600">
              Portal reservasi ruangan, fasilitas, dan pelaporan insiden.
            </p>
            <div className="mt-4">
              <SignInForm next={next} />
            </div>
          </div>
          <div className="flex w-full max-w-[400px] items-center justify-center gap-1.5 border-t pt-4 text-center md:hidden">
            <span className="text-xs text-ink-600">Belum memiliki akun?</span>
            <button
              type="button"
              onClick={() => toggle(true)}
              className="min-h-11 text-sm font-bold text-brand-600 hover:underline focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              Daftar akun baru
            </button>
          </div>
        </div>
        <div
          className={`form-container sign-up-container relative w-full flex-col items-center justify-center gap-6 overflow-y-auto p-6 sm:p-10 md:p-12 md:absolute md:top-0 md:left-0 md:h-full md:w-1/2 ${
            toRegister ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="w-full max-w-[400px]">
            <div className="mb-3 flex flex-col gap-1">
              <Link
                href="/"
                aria-label="Kembali ke beranda"
                className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <ArrowLeft aria-hidden className="size-4" />
                <span>Kembali ke beranda</span>
              </Link>
              <Link
                href="/"
                className="text-3xl font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <span className="text-ink-950">Kampus</span>
                <span className="text-brand-500">Space</span>
              </Link>

            </div>
            <h2 className="text-4xl leading-[44px] font-medium text-ink-950">
              Daftar akun civitas
            </h2>
            <p className="mt-1 text-base text-ink-600">
              Pengajuan akses portal reservasi ruangan dan fasilitas kampus.
            </p>
            <div className="mt-3">
              <SignUpForm />
            </div>
          </div>
          <div className="flex w-full max-w-[400px] items-center justify-center gap-1.5 border-t pt-3 text-center md:hidden">
            <span className="text-xs text-ink-600">Sudah memiliki akun?</span>
            <button
              type="button"
              onClick={() => toggle(false)}
              className="min-h-11 text-sm font-bold text-brand-600 hover:underline focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              Masuk ke portal
            </button>
          </div>
        </div>
        <OverlayPanel mode={mode} onToggle={toggle} />
      </div>
    </main>
  );
}
