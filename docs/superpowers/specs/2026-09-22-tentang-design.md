# Desain Halaman Tentang (`/tentang`) — KampusSpace

- **Tanggal:** 2026-09-22
- **Status:** Disetujui pemilik (pendekatan A + sentuhan C: statis reuse-komponen + teaser landing)
- **Sumber kebenaran:** `docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md`, `DESIGN.md`, `PRODUCT.md`
- **Kondisi saat ini:** Tab Tentang bukan halaman — anchor `/#tentang` ke `<section id="tentang">` berisi `WorkflowCards` di `app/page.tsx:116`. Nav didefinisikan di `components/custom/PublicHeader.tsx:20-24` dengan `isActive` sengaja `false` untuk anchor. Footer panduan link ke `/#tentang` dan `/#cara-kerja-heading` di `components/custom/PublicFooter.tsx:16-19`.
- **Keputusan terkunci:** Isi = Profil + alur + FAQ. Routing = halaman sendiri `/tentang`, ganti link header/footer dari `/#tentang`.

Saat referensi bertentangan dengan PRD, PRD menang. Saat bertentangan dengan `DESIGN.md`, `DESIGN.md` menang.

## 1. Tujuan & alur

Halaman `/tentang` menjelaskan apa itu KampusSpace kepada visitor tanpa login: katalog publik, reservasi terpandu 07.00–20.00 WIB slot 30 menit dengan validasi anti-bentrok server, dan pelaporan kerusakan berfoto. Satu tugas: membangun kepercayaan lalu mengantar ke `/facilities` atau `/register`. Tidak menampilkan data pemohon/tujuan siapa pun dan tidak menjanjikan SSO, QR tiket, rating, atau instant approval.

## 2. Isi halaman (5 blok vertikal, gap-16)

1. **Hero mini** — overline `Tentang KampusSpace`, H1 `Satu tempat untuk fasilitas kampus`, lead: cek ketersediaan tanpa login, ajukan reservasi, laporkan kerusakan dalam satu portal.
2. **Info operasional** — 3 kartu: Jam operasional 07.00–20.00 WIB Asia/Jakarta; Aturan slot 30 menit + validasi konflik server-side; Peran visitor/user/officer/admin (1 kalimat per peran sesuai PRODUCT.md).
3. **Alur ganda (reuse)** — render ulang `components/custom/WorkflowCards.tsx` apa adanya (Reservasi fasilitas online + Lapor fasilitas bermasalah).
4. **FAQ (accordion shadcn)** — 5 item: apakah perlu akun untuk cek ketersediaan; bagaimana jika slot bentrok; bagaimana cara batalkan; aturan foto laporan (1 foto, max 5 MB, JPEG/PNG/WebP); siapa yang menyetujui dan berapa lama.
5. **CTA akhir (reuse)** — render ulang `components/custom/FinalCta.tsx`.

**Dilarang tampil sebagai fitur:** SSO, QR tiket, rating/ulasan, angka penggunaan, klaim kecepatan respon, instant approval.

## 3. Arsitektur & routing

- Baru: `app/tentang/page.tsx` sebagai Server Component statis (tanpa fetch DB, tanpa `force-dynamic`). Metadata: `title: Tentang — KampusSpace`, `description` ID satu kalimat.
- Layout mengikuti public shell DESIGN.md: container `mx-auto max-w-6xl px-6 py-12 sm:py-16`, background `canvas-public` dari `app/layout.tsx`, kartu `bg-white border-brand-100 rounded-3xl`.
- Ubah `components/custom/PublicHeader.tsx`: NAV `Tentang: /#tentang → /tentang`; perbaiki `isActive` agar `pathname === /tentang` highlight + `aria-current="page"`; berlaku desktop + dialog mobile.
- Ubah `components/custom/PublicFooter.tsx`: GUIDE_LINKS `Alur reservasi & pelaporan: /#tentang → /tentang`.
- Sentuhan C di `app/page.tsx`: pertahankan `<section id="tentang">` agar link lama tidak broken, tambah link `Pelajari lebih lanjut → /tentang` di bawah `WorkflowCards` (atau sebagai prop/link tambahan, tanpa mengubah isi kartu).

## 4. Komponen (`components/custom/`)

Reuse tanpa duplikasi: `WorkflowCards`, `FinalCta`, `PublicHeader` (global), `PublicFooter` (global). Baru hanya komposisi di `app/tentang/page.tsx` + blok FAQ memakai primitif `Accordion` shadcn yang sudah ada. Aturan: radius kartu publik 20–24px, heading sentence case Bahasa Indonesia, status selalu teks + warna/ikon (tidak warna saja), target sentuh min 44px, fokus ring terlihat.

## 5. Data flow & state

Statis penuh: tidak ada query DB, tidak ada form/mutasi, tidak ada loading/skeleton/error state baru. Jika primitif Accordion butuh client interactivity, bungkus hanya blok FAQ sebagai Client Component; sisa halaman tetap Server Component.

## 6. Pengujian penerimaan

- Nav `Tentang` mengarah ke `/tentang` dan highlight aktif hanya di route tersebut; menu mobile sama.
- `/tentang` render 5 blok, tidak ada teks SSO/QR/rating/instant-approval.
- Link lama `/#tentang` masih scroll ke section landing; section landing punya link ke `/tentang`.
- Layout 360px: tidak ada konten terpotong, accordion keyboard-accessible (label, Escape/close terlihat).
- `npm run lint` bersih.

## 7. Di luar lingkup

Statistik live (count fasilitas), tim pengelola/kontak khusus, CMS, i18n Inggris, perubahan AvailabilityGrid, AppShell/sidebar, autentikasi.
