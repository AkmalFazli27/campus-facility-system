import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="grid items-center gap-10 lg:grid-cols-2">
      <div>
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
      <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border-4 border-white shadow-xl sm:min-h-[440px] lg:min-h-[520px]">
        <Image
          src="/assets/undip-img.png"
          alt="Gedung fasilitas kampus"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />


        <div className="absolute top-5 right-5 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-lg backdrop-blur-md">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-brand-600 uppercase">
            <Clock aria-hidden className="size-3.5" />
            Jam operasional
          </p>
          <p className="mt-1 text-xs font-bold text-ink-950">07.00–20.00 WIB</p>
        </div>

        <div className="absolute bottom-5 left-5 rounded-2xl border border-white/60 bg-white/90 p-3 pr-4 shadow-lg backdrop-blur-md">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-brand-600 uppercase">
            <CalendarCheck aria-hidden className="size-3.5" />
            Cek ketersediaan
          </p>
          <p className="mt-1 text-xs font-bold text-ink-950">Slot 30 menit</p>
        </div>
      </div>
    </section>
  );
}
