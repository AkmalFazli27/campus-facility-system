import Link from "next/link";
import { CalendarCheck, Wrench } from "lucide-react";

const RESERVATION_STEPS = [
  "Pilih fasilitas, tanggal, dan rentang slot 30 menit.",
  "Isi tujuan penggunaan dengan jelas.",
  "Kirim pengajuan dan pantau status di Reservasi saya.",
  "Gunakan fasilitas setelah status disetujui petugas.",
];

const REPORT_STEPS = [
  "Pilih fasilitas dan kategori kerusakan.",
  "Tulis deskripsi dan unggah satu foto (max 5 MB).",
  "Kirim laporan dan pantau status di Laporan saya.",
  "Lihat catatan penyelesaian setelah status selesai.",
];

export default function WorkflowCards() {
  return (
    <section aria-label="Dua alur utama" className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-brand-100 bg-white p-8">
        <CalendarCheck aria-hidden className="size-8 text-brand-600" />
        <h2 className="mt-4 text-2xl font-bold text-ink-950">
          Reservasi fasilitas online
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Amankan slot dalam interval 30 menit pada jam 07.00–20.00. Server
          menolak pengajuan yang bentrok dengan jadwal yang sudah disetujui.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-600">
          {RESERVATION_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <Link
          href="/facilities"
          className="mt-6 inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-brand-600 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          Lihat fasilitas →
        </Link>
      </article>
      <article className="rounded-3xl border border-brand-100 bg-white p-8">
        <Wrench aria-hidden className="size-8 text-brand-600" />
        <h2 className="mt-4 text-2xl font-bold text-ink-950">
          Lapor fasilitas bermasalah
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Temukan AC mati, proyektor buram, atau kursi rusak? Kirim laporan
          dengan bukti foto dan pantau status penanganannya.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-600">
          {REPORT_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <Link
          href="/register"
          className="mt-6 inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-brand-600 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          Daftar untuk melapor →
        </Link>
      </article>
    </section>
  );
}
