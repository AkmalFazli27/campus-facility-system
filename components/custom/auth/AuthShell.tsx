"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ShieldCheck, Users } from "lucide-react";
import { buildAuthToggleHref, type AuthMode } from "@/lib/auth-ui";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import OverlayPanel from "./OverlayPanel";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Validasi server" },
  { icon: Users, label: "RBAC terpadu" },
  { icon: Clock, label: "Slot 07.00–20.00" },
];

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
    <main className="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none fixed top-12 left-1/2 h-[550px] w-[700px] max-w-[95vw] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-500/20 via-brand-100/60 to-amber-200/40 blur-3xl"
      />
      <div
        className={`auth-slider relative flex w-full max-w-[940px] flex-col overflow-hidden rounded-3xl border bg-surface shadow-xl shadow-brand-100/60 md:block md:min-h-[640px] ${
          toRegister ? "right-panel-active" : ""
        }`}
      >
        <div
          className={`form-container sign-in-container relative w-full flex-col justify-between gap-6 overflow-y-auto p-6 sm:p-10 md:absolute md:top-0 md:left-0 md:h-full md:w-1/2 ${
            toRegister ? "hidden md:flex" : "flex"
          }`}
        >
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <span className="text-ink-950">Kampus</span>
                <span className="text-brand-500">Space</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-ink-600 uppercase">
                <span aria-hidden className="size-1.5 rounded-full bg-success" />
                Portal civitas
              </span>
            </div>
            <h1 className="text-[28px] leading-9 font-medium text-ink-950">
              Selamat datang kembali
            </h1>
            <p className="mt-1 text-sm text-ink-600">
              Portal reservasi ruangan, fasilitas, dan pelaporan insiden.
            </p>
            <div className="mt-4">
              <SignInForm next={next} />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-t pt-4 text-center md:hidden">
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
          className={`form-container sign-up-container relative w-full flex-col justify-between gap-6 overflow-y-auto p-6 sm:p-10 md:absolute md:top-0 md:left-0 md:h-full md:w-1/2 ${
            toRegister ? "flex" : "hidden md:flex"
          }`}
        >
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
              >
                <span className="text-ink-950">Kampus</span>
                <span className="text-brand-500">Space</span>
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-warning uppercase">
                <span aria-hidden className="size-1.5 rounded-full bg-warning" />
                Registrasi baru
              </span>
            </div>
            <h2 className="text-[28px] leading-9 font-medium text-ink-950">
              Daftar akun civitas
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Pengajuan akses portal reservasi ruangan dan fasilitas kampus.
            </p>
            <div className="mt-3">
              <SignUpForm />
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-t pt-3 text-center md:hidden">
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
      <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-center">
        {TRUST_BADGES.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-2 text-ink-600"
          >
            <b.icon aria-hidden className="size-4 text-brand-600" />
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              {b.label}
            </span>
          </span>
        ))}
      </footer>
    </main>
  );
}
