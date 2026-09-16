import { ArrowLeft, ArrowRight, GraduationCap, LockOpen } from "lucide-react";
import type { AuthMode } from "@/lib/auth-ui";

export default function OverlayPanel({
  mode,
  onToggle,
}: {
  mode: AuthMode;
  onToggle: (toRegister: boolean) => void;
}) {
  void mode;
  return (
    <div className="overlay-container pointer-events-none absolute top-0 left-1/2 hidden h-full w-1/2 overflow-hidden md:block">
      <div className="overlay relative -left-full h-full w-[200%] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:16px_16px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-400/20 blur-2xl"
        />
        <div className="overlay-panel overlay-left absolute top-0 left-0 flex h-full w-1/2 flex-col items-center justify-center p-12 text-center select-none">
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-md">
            <LockOpen aria-hidden className="size-7" />
          </span>
          <h2 className="mb-3 text-3xl leading-tight font-semibold">
            Sudah punya akun kampus?
          </h2>
          <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/85">
            Akses langsung kalender ketersediaan aula, laboratorium, dan kelas
            multimedia.
          </p>
          <button
            type="button"
            onClick={() => onToggle(false)}
            className="pointer-events-auto flex items-center gap-2 rounded-full border-2 border-white/90 px-8 py-3 text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:bg-white hover:text-brand-700 active:scale-95"
          >
            <ArrowLeft aria-hidden className="size-4" />
            <span>Masuk ke portal</span>
          </button>
        </div>
        <div className="overlay-panel overlay-right absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center p-12 text-center select-none">
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner backdrop-blur-md">
            <GraduationCap aria-hidden className="size-7" />
          </span>
          <h2 className="mb-3 text-3xl leading-tight font-semibold">
            Halo, civitas akademika!
          </h2>
          <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/85">
            Belum terdaftar? Ajukan akun civitas untuk mulai memesan fasilitas
            kampus.
          </p>
          <button
            type="button"
            onClick={() => onToggle(true)}
            className="pointer-events-auto flex items-center gap-2 rounded-full border-2 border-white/90 px-8 py-3 text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:bg-white hover:text-brand-700 active:scale-95"
          >
            <span>Daftar akun baru</span>
            <ArrowRight aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
