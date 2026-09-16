const STEPS = [
  {
    title: "Daftar akun",
    description: "Registrasi dengan email kampus, lalu ajukan akun untuk diverifikasi admin.",
  },
  {
    title: "Verifikasi admin",
    description: "Akun aktif setelah admin memverifikasi pendaftaranmu.",
  },
  {
    title: "Pilih slot",
    description: "Cek slot 30 menit yang masih tersedia pada tanggal tujuan.",
  },
  {
    title: "Tunggu persetujuan",
    description:
      "Petugas memproses pengajuan; status pending, disetujui, atau ditolak terlihat di riwayat.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section aria-labelledby="cara-kerja-heading" className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-sm font-bold tracking-wider text-brand-600 uppercase">
          Cara kerja
        </p>
        <h2
          id="cara-kerja-heading"
          className="mt-2 scroll-mt-24 text-3xl font-bold tracking-tight text-ink-950"
        >
          Reservasi fasilitas tanpa alur yang membingungkan
        </h2>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm shadow-brand-100/50"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600"
            >
              {index + 1}
            </span>
            <h3 className="mt-5 text-lg font-bold text-ink-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
