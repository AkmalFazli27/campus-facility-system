import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import ReservationHistory from "@/components/custom/reservations/ReservationHistory";

export const metadata: Metadata = {
  title: "Reservasi saya | KampusSpace",
  description: "Lihat riwayat dan status reservasi fasilitas kampus.",
};

export default function ReservationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
      <section className="max-w-3xl space-y-4">
        <Badge className="border-brand-100 bg-brand-50 text-brand-700">
          Portal pengguna
        </Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
            Reservasi saya
          </h1>
          <p className="text-base leading-7 text-ink-600 sm:text-lg">
            Pantau pengajuan, status persetujuan, dan detail penggunaan fasilitasmu.
          </p>
        </div>
      </section>

      <ReservationHistory />
    </main>
  );
}
