import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEMO_SLOTS = [
  true, true, false, true, true, false, true, false,
];

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <p className="mb-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wider text-brand-600 uppercase">
          Portal reservasi &amp; pelaporan fasilitas kampus
        </p>
        <h1
          id="hero-heading"
          className="text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl"
        >
          Ruang dan fasilitas kampus{" "}
          <span className="text-brand-600">dalam genggaman.</span>
        </h1>
        <p className="mt-4 max-w-lg leading-relaxed text-ink-600">
          Lihat ketersediaan ruang, aula, laboratorium, dan lapangan. Ajukan
          reservasi, pantau statusnya, dan laporkan kerusakan — tanpa
          koordinasi manual.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/facilities"
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 rounded-full bg-brand-500 hover:bg-brand-600")}
          >
            Lihat fasilitas
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-h-11 rounded-full")}
          >
            Daftar akun
          </Link>
        </div>
      </div>
      <div
        aria-label="Contoh ketersediaan slot"
        className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-tr from-brand-500 via-brand-600 to-amber-400 p-6 shadow-xl sm:p-8"
      >
        <p className="text-xs font-bold tracking-widest text-white/90 uppercase">
          Contoh slot hari ini • 30 menit
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {DEMO_SLOTS.map((free, i) => (
            <span
              key={i}
              className={cn(
                "rounded-xl px-2 py-3 text-center text-xs font-bold",
                free ? "bg-white/95 text-ink-950" : "bg-black/25 text-white/80"
              )}
            >
              {free ? "Buka" : "Penuh"}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-white">
            <Clock aria-hidden className="size-3.5" /> Operasional 07.00–20.00
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-white">
            <ShieldCheck aria-hidden className="size-3.5" /> Validasi anti-bentrok
          </span>
        </div>
      </div>
    </section>
  );
}
