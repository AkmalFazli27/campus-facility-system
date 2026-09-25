const FAQS = [
  { q: "Apakah perlu akun untuk cek ketersediaan?", a: "Tidak. Semua orang bisa melihat katalog dan slot 30 menit pada jam 07.00–20.00 WIB tanpa login. Akun baru dibutuhkan saat mengajukan reservasi atau laporan." },
  { q: "Bagaimana jika slot yang saya mau bentrok?", a: "Server memeriksa ulang setiap pengajuan terhadap reservasi yang sudah disetujui untuk fasilitas dan tanggal yang sama. Jika bentrok, pengajuan ditolak dengan pesan Slot ini baru saja digunakan. Pilih slot lain." },
  { q: "Bagaimana cara membatalkan reservasi?", a: "Buka Reservasi saya, pilih reservasi milik Anda sebelum waktu mulai, lalu konfirmasi pembatalan. Status berubah menjadi dibatalkan dan slot kembali tersedia." },
  { q: "Aturan foto laporan kerusakan?", a: "Satu foto per laporan, maksimal 5 MB, format JPEG/PNG/WebP. Tulis fasilitas, kategori, dan deskripsi yang jelas agar petugas mudah menindaklanjuti." },
  { q: "Siapa yang menyetujui pengajuan?", a: "Petugas fasilitas memproses antrean. Status yang mungkin: menunggu, disetujui, ditolak, atau dibatalkan. Pantau status di Reservasi saya dan Laporan saya." },
];
export default function AboutFaq() {
  return (
    <section aria-labelledby="tentang-faq-heading" className="rounded-3xl border border-brand-100 bg-white p-8">
      <p className="text-xs font-bold tracking-wider text-brand-600 uppercase">Pertanyaan umum</p>
      <h2 id="tentang-faq-heading" className="mt-2 text-2xl font-bold text-ink-950">Sering ditanyakan</h2>
      <div className="mt-6 space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-brand-100 bg-canvas-public px-5 py-4 open:bg-white">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none">
              {f.q}
              <span aria-hidden className="text-brand-600 group-open:hidden">+</span>
              <span aria-hidden className="hidden text-brand-600 group-open:inline">−</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
