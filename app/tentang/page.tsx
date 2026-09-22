import type { Metadata } from "next";
import { Building2, Clock, Users } from "lucide-react";
import AboutFaq from "@/components/custom/AboutFaq";
import FinalCta from "@/components/custom/FinalCta";
import WorkflowCards from "@/components/custom/WorkflowCards";
export const metadata: Metadata = {
  title: "Tentang — KampusSpace",
  description: "KampusSpace adalah portal kampus untuk melihat ketersediaan fasilitas, mengajukan reservasi, dan melaporkan kerusakan dalam satu tempat.",
};
const OPS_CARDS = [
  { icon: Clock, title: "Jam operasional", body: "Senin–Jumat 07.00–20.00 WIB (Asia/Jakarta). Semua slot dalam interval 30 menit." },
  { icon: Building2, title: "Aturan slot", body: "Reservasi yang disetujui untuk fasilitas dan tanggal yang sama tidak boleh tumpang tindih. Server memvalidasi ulang setiap pengajuan." },
  { icon: Users, title: "Peran pengguna", body: "Visitor melihat ketersediaan. User mengelola reservasi dan laporan. Officer memproses antrean. Admin mengelola data dan rekap." },
];
export default function TentangPage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-12 sm:py-16">
        <section aria-labelledby="tentang-heading" className="max-w-3xl">
          <p className="text-sm font-bold tracking-wider text-brand-600 uppercase">Tentang KampusSpace</p>
          <h1 id="tentang-heading" className="mt-2 text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">Satu tempat untuk fasilitas kampus</h1>
          <p className="mt-4 text-base leading-relaxed text-ink-600">KampusSpace adalah sumber kebenaran tunggal untuk ketersediaan fasilitas, reservasi terpandu 07.00–20.00 dalam slot 30 menit, dan pelaporan kerusakan berfoto — tanpa koordinasi manual yang tercecer.</p>
        </section>
        <section aria-label="Informasi operasional" className="grid gap-4 sm:grid-cols-3">
          {OPS_CARDS.map((c) => (
            <article key={c.title} className="rounded-3xl border border-brand-100 bg-white p-6">
              <c.icon aria-hidden className="size-6 text-brand-600" />
              <h2 className="mt-3 font-bold text-ink-950">{c.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{c.body}</p>
            </article>
          ))}
        </section>
        <WorkflowCards />
        <AboutFaq />
        <FinalCta />
      </main>
    </div>
  );
}
