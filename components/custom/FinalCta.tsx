import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="rounded-3xl bg-ink-950 px-6 py-10 text-white sm:px-10 sm:py-12"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h2 id="final-cta-heading" className="text-3xl font-bold tracking-tight">
            Siap memakai fasilitas kampus?
          </h2>
          <p className="mt-3 leading-relaxed text-white/75">
            Daftar akun untuk mengecek ketersediaan, mengajukan reservasi, dan
            membuat laporan fasilitas dari satu tempat.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/facilities"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-h-11 rounded-full border-white/30 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/70"
            )}
          >
            Mulai reservasi
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 rounded-full bg-brand-500 px-5 text-white hover:bg-brand-600 focus-visible:ring-brand-300"
            )}
          >
            Laporkan kerusakan
          </Link>
        </div>
      </div>
    </section>
  );
}
