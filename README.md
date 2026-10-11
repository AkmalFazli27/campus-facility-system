# KampusSpace - Sistem Reservasi & Pelaporan Fasilitas Kampus

Portal web terpusat untuk mengelola peminjaman fasilitas kampus (ruang kelas, aula, laboratorium, alat, dan lapangan) sekaligus pelaporan kerusakannya. Satu aplikasi Next.js (App Router, fullstack) melayani tampilan halaman dan REST API dalam satu port, dengan MySQL sebagai basis data.

**Link demo:** https://kampusspace.vercel.app/

> Proyek mata kuliah Pengembangan Platform Khusus (PPK) 2026, Universitas Diponegoro. Target rilis: sebelum UTS, 11 Oktober 2026.

## Daftar Isi

1. [Sekilas Produk](#sekilas-produk)
2. [Fitur Utama per Peran](#fitur-utama-per-peran)
3. [Tech Stack & Arsitektur](#tech-stack--arsitektur)
4. [Struktur Folder](#struktur-folder)
5. [Prasyarat](#prasyarat)
6. [Setup Database Lokal (MySQL)](#setup-database-lokal-mysql)
7. [Setup Database Bersama / Staging (Aiven MySQL)](#setup-database-bersama--staging-aiven-mysql)
8. [Environment Variables](#environment-variables)
9. [Menjalankan Aplikasi](#menjalankan-aplikasi)
10. [Akun Demo](#akun-demo)
11. [Skrip npm](#skrip-npm)
12. [Pengujian & Kualitas](#pengujian--kualitas)
13. [Aturan Bisnis Inti](#aturan-bisnis-inti)
14. [Peran & Hak Akses](#peran--hak-akses)
15. [Ringkasan API](#ringkasan-api)
16. [Keamanan](#keamanan)
17. [Alur Kerja Git](#alur-kerja-git)
18. [Deploy](#deploy)
19. [Kredit](#kredit)
20. [Dokumentasi Terkait](#dokumentasi-terkait)

## Sekilas Produk

Sebelumnya peminjaman fasilitas kampus masih tersebar (chat, spreadsheet, papan pengumuman), sehingga bentrok jadwal tidak terdeteksi dini dan laporan kerusakan tidak terpusat. KampusSpace menyatukannya dalam satu portal:

- Katalog fasilitas + pencarian berdasarkan tipe, lokasi, dan kapasitas.
- Ketersediaan per slot 30 menit tanpa perlu login, tanpa membocorkan identitas atau tujuan pemohon.
- Reservasi mandiri: ajukan, lihat riwayat dan status, batalkan.
- Pelaporan kerusakan dengan kategori, deskripsi, dan satu foto.
- Antrian terpusat bagi petugas untuk memproses reservasi dan laporan.
- Master data fasilitas, verifikasi akun, serta rekap okupansi dan kerusakan yang bisa diekspor ke PDF bagi admin.

Validasi waktu, slot, dan pencegahan bentrok dilakukan secara otoritatif di sisi server; validasi di sisi klien hanya untuk pengalaman pengguna.

## Fitur Utama per Peran

| Peran | Kemampuan utama |
|---|---|
| **Pengunjung** | Lihat daftar fasilitas + ketersediaan per slot (tersedia/tidak tersedia). Filter tipe/lokasi/kapasitas. Tidak melihat detail pemohon atau tujuan. (US01-US02) |
| **Pengguna** | Registrasi lalu diverifikasi admin. Ajukan reservasi, batalkan reservasi sendiri sebelum waktu mulai, lihat riwayat dan status, laporkan kerusakan, pantau status laporan. (US03-US07) |
| **Petugas** | Proses antrian: setujui/tolak/batalkan reservasi (dengan pencegahan bentrok), ubah status laporan beserta catatan resolusi, tandai fasilitas "dalam perbaikan" dan kembalikan ke aktif. (US08-US12) |
| **Admin** | Kelola master fasilitas, daftarkan akun petugas dan pengguna, verifikasi/tolak akun hasil registrasi mandiri, lihat dan ekspor rekap okupansi serta frekuensi kerusakan ke PDF. (US13-US17) |

Semua peran berbagi satu route `/dashboard` yang isinya bercabang per peran, dengan sidebar yang hanya merender menu milik peran tersebut.

## Tech Stack & Arsitektur

```
[ Browser ] --HTTP--> [ Next.js App Router :3000 ] --Prisma--> [ MySQL 8 ]
                        |-- app/**/page.tsx + components/   (tampilan, Server/Client Components)
                        |-- app/api/**/route.ts             (controller/API, Route Handlers)
                        |-- lib/services/*                  (logika: slot, konflik, rekap, PDF)
                        |-- lib/db.ts + config/env.ts       (koneksi & validasi env)
                        |-- proxy.ts                        (auth + RBAC optimistic)
```

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5.
- **Styling:** Tailwind CSS v4 (CSS-first, `app/globals.css`), shadcn/@base-ui, lucide-react, next-themes, sonner.
- **Database:** MySQL 8 via Prisma 6 (`prisma/schema.prisma` sebagai sumber kebenaran skema).
- **Auth:** JWT httpOnly cookie via `jose` + hash `bcryptjs`.
- **Validasi:** `zod` di klien (UX) dan Route Handler (otoritatif).
- **Export:** `pdfkit` untuk rekap PDF.
- **Upload foto:** `@vercel/blob` di produksi, atau folder `public/uploads` saat lokal.
- **Pengujian:** Node.js test runner (`node --test`) dengan `tsx`.
- **Utilitas:** `date-fns` (zona `Asia/Jakarta`).

Catatan Next.js 16: berkas `proxy.ts` adalah konvensi pengganti `middleware.ts`. `proxy.ts` hanya melakukan pemeriksaan optimistic (baca cookie, tanpa DB); Route Handler tetap melakukan pemeriksaan aman lewat `getSessionUser()`.

## Struktur Folder

```
campus-facility-system/
├── app/                    # App Router: halaman (views) + Route Handlers (controller)
│   ├── (auth)/             # /login, /register
│   ├── dashboard/          # /dashboard bercabang per peran + _components/ sidebar & dashboard role
│   ├── facilities/         # katalog, filter, detail + slot ketersediaan
│   ├── reservations/       # reservasi milik pengguna
│   ├── reports/            # laporan milik pengguna + form buat laporan
│   ├── officer/            # antrian, riwayat reservasi, laporan
│   ├── admin/              # kelola fasilitas, kelola pengguna, rekap
│   └── api/                # Route Handler REST (auth, facilities, reservations, reports, admin)
├── components/
│   ├── ui/                 # primitif shadcn (diubah hanya via CLI shadcn)
│   └── custom/             # komponen domain KampusSpace
├── lib/
│   ├── db.ts               # singleton PrismaClient
│   ├── auth.ts, session.ts # JWT + pembacaan sesi
│   ├── authorize.ts        # aturan RBAC per path/role
│   ├── services/           # reservationService, facilityService, reportService, recapService, pdfService
│   ├── validations/        # skema zod
│   └── helpers/            # helper slot, format, timezone
├── config/env.ts           # validasi environment variable via zod
├── views/                  # folder literal wajib: template email + CATATAN-MAPPING.md
├── public/                 # aset publik + uploads/ (foto laporan, gitignored)
├── prisma/                 # schema.prisma, migrations/, seed.ts
├── database/               # CATATAN.md (arsip snapshot SQL untuk pengumpulan)
├── scripts/                # smoke:auth, smoke:reservation-concurrency
├── tests/                  # unit test (node --test)
└── docs/                   # PRD, DESIGN, GIT-WORKFLOW, pembagian tugas, laporan
```

Struktur memenuhi ketentuan tugas dengan mempertahankan folder literal `/public`, `/app`, `/views`, dan `/config` di root, sementara `app/` Next.js dipetakan sebagai gabungan views + controller.

## Prasyarat

- Node.js 20 atau lebih baru (disarankan LTS) dan npm.
- MySQL 8+ yang berjalan lokal (cek `mysql --version` atau service MySQL di Windows).
- Akun Aiven MySQL hanya untuk integrasi/demo, bukan pengembangan harian.

## Setup Database Lokal (MySQL)

```bash
# 1) Buat database dev
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS campus_facility_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2) Isi env (Prisma CLI membaca .env, Next.js juga membaca .env.local)
cp .env.example .env.local
cp .env.example .env
# lalu isi DATABASE_URL + JWT_SECRET (min 32 karakter) di kedua file

# 3) Instalasi, migration, dan seed
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4) Verifikasi
npx prisma studio
npm run dev
```

Jangan commit `.env` atau `.env.local`. Yang di-commit hanya `prisma/schema.prisma`, `prisma/migrations/`, dan `.env.example`.

Aturan database (wajib):

- Pengembangan harian memakai MySQL lokal `campus_facility_dev`.
- Database bersama Aiven `campus_facility` hanya untuk integrasi dan demo.
- Dilarang `prisma migrate reset` maupun `prisma migrate dev` ke database Aiven. Ke staging hanya `prisma migrate deploy`.
- Kredensial hanya dibagikan lewat jalur private, tidak pernah di-commit ke repo, PR, atau chat publik.

## Setup Database Bersama / Staging (Aiven MySQL)

Free tier Aiven lambat dan koneksinya terbatas, jadi dev harian tetap di MySQL lokal.

```bash
# 1) Simpan URL staging di file terpisah (tidak di-commit)
cp .env.example .env.staging.local
# isi DATABASE_URL staging, contoh:
# DATABASE_URL="mysql://campus_app:PASSWORD@HOST:PORT/campus_facility?ssl-mode=REQUIRED"

# 2) Terapkan migration yang sudah ada (jangan migrate dev ke staging)
$env:DATABASE_URL = "<isi-URL-staging>"
npx prisma migrate deploy
npm run db:seed  # sekali saja
```

Perubahan skema mengalir lewat lokal, PR, `develop`, lalu `migrate deploy` ke staging.

## Environment Variables

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `APP_URL` | Tidak | `http://localhost:3000` | Base URL aplikasi. Dipakai smoke test (`smoke:auth`). |
| `DATABASE_URL` | Ya | - | Koneksi MySQL. Contoh: `mysql://root:PASSWORD@localhost:3306/campus_facility_dev`. |
| `JWT_SECRET` | Ya | - | Secret penandatangan JWT, minimal 32 karakter. |
| `JWT_EXPIRES_IN` | Tidak | `7d` | Masa berlaku token/sesi. |
| `UPLOAD_DIR` | Tidak | `public/uploads` | Lokasi penyimpanan foto laporan saat lokal. |
| `MAX_UPLOAD_MB` | Tidak | `5` | Batas ukuran foto laporan (MB). |
| `BLOB_READ_WRITE_TOKEN` | Tidak | - | Token Vercel Blob. Bila diisi (produksi), foto laporan disimpan ke Blob; tanpa token, ke `UPLOAD_DIR`. |

Variabel divalidasi saat aplikasi dimuat lewat `config/env.ts`. Aplikasi gagal cepat bila `JWT_SECRET` kurang dari 32 karakter.

## Menjalankan Aplikasi

```bash
npm install     # postinstall otomatis menjalankan prisma generate
npm run dev     # http://localhost:3000
```

Untuk build produksi:

```bash
npm run build
npm run start
```

Aplikasi berjalan di satu port: halaman dan `/api/*` dilayani bersamaan.

## Akun Demo

Tersedia dari `npm run db:seed` (idempoten, aman dijalankan ulang):

| Peran | Email | Password | Status akun |
|---|---|---|---|
| Admin | `admin@example.com` | `Admin123!` | active |
| Petugas | `officer@example.com` | `Officer123!` | active |
| Pengguna | `user@example.com` | `User123!` | active |
| Pendaftar | `pending@example.com` | `User123!` | pending (untuk demo verifikasi) |

Seed juga menyiapkan 10 fasilitas contoh (kelas, aula, lab, lapangan, alat) di Gedung A/B/C dan Area Luar. Ganti password sebelum dipakai di lingkungan publik.

## Skrip npm

| Skrip | Perintah | Kegunaan |
|---|---|---|
| `dev` | `next dev` | Menjalankan server pengembangan. |
| `build` | `next build` | Build produksi. |
| `start` | `next start` | Menjalankan hasil build. |
| `lint` | `eslint` | Cek lint. |
| `typecheck` | `tsc --noEmit` | Cek tipe tanpa emit. |
| `test` | `node --env-file-if-exists=.env --import tsx --test` | Menjalankan unit test. |
| `db:generate` | `prisma generate` | Menghasilkan Prisma Client. |
| `db:migrate` | `prisma migrate dev` | Membuat/menerapkan migration (lokal). |
| `db:seed` | `prisma db seed` | Mengisi akun demo dan fasilitas. |
| `smoke:auth` | `node --env-file=.env scripts/smoke-auth.mjs` | Smoke test end-to-end Auth API (server dev harus jalan). |
| `smoke:reservation-concurrency` | `node --env-file=.env --import tsx scripts/smoke-reservation-concurrency.ts` | Uji konkurensi pencegahan bentrok reservasi. |

## Pengujian & Kualitas

```bash
npm test            # seluruh unit test di tests/
npm test tests/services   # jalankan subset (opsional)
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run smoke:auth  # butuh `npm run dev` aktif + MySQL hidup
```

`smoke:auth` membuktikan alur register, verifikasi, login, dan proteksi endpoint lewat pemanggilan HTTP langsung. Gunakan sebagai bukti saat PR atau demo.

## Aturan Bisnis Inti

- **Jam operasional:** 07.00-20.00 `Asia/Jakarta`, slot tetap 30 menit (07.00-07.30, 07.30-08.00, ..., 19.30-20.00). `start_time`/`end_time` wajib berada dalam rentang ini dan kelipatan 30 menit; divalidasi di server.
- **Batas pengajuan:** paling lambat H-3 hari kalender `Asia/Jakarta` (bukan 72 jam sebelum `start_time`). Untuk penggunaan 10 Oktober, pengajuan terakhir 7 Oktober pukul 23.59 WIB.
- **Pencegahan bentrok:** konflik terjadi bila interval tumpang tindih pada fasilitas dan tanggal yang sama dengan status `APPROVED` (`s1 < e2 && s2 < e1`). Interval yang hanya bersentuhan di tepi diperbolehkan. Pemeriksaan otoritatif dilakukan saat approve.
- **Efek samping approve:** setelah satu reservasi disetujui, reservasi `PENDING` lain pada fasilitas/tanggal sama yang tumpang tindih otomatis menjadi `REJECTED` (alasan bentrok), dalam satu transaksi.
- **Pembatalan otomatis:** mulai H-1 pukul 00.00 WIB, reservasi `PENDING` tidak bisa lagi disetujui. Saat pengguna atau petugas membuka dashboard/data reservasi, statusnya disinkronkan menjadi `CANCELLED_BY_SYSTEM` beserta alasan kedaluwarsa. Tanpa kunjungan ke aplikasi, perubahan baru terjadi pada akses berikutnya.
- **Pembatalan manual:** pengguna boleh membatalkan reservasinya sebelum `start_time`; petugas boleh membatalkan reservasi `APPROVED` kapan pun dengan alasan wajib.
- **Fasilitas dalam perbaikan:** fasilitas berstatus `UNDER_MAINTENANCE` atau `INACTIVE` tidak bisa dipesan (create dan approve ditolak) sampai petugas mengembalikannya ke `ACTIVE`.
- **Laporan:** satu foto wajib (maks 5 MB, `image/jpeg|png|webp`). Alur status `NEW` -> `IN_PROGRESS` -> `RESOLVED`/`REJECTED`; transisi ke `RESOLVED` wajib catatan resolusi.

Status reservasi: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED_BY_USER`, `CANCELLED_BY_OFFICER`, `CANCELLED_BY_SYSTEM`, `COMPLETED`.
Status laporan: `NEW`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`.

## Peran & Hak Akses

| Peran | Autentikasi | Hak akses |
|---|---|---|
| Pengunjung | Tanpa login | Katalog fasilitas + ketersediaan per slot, filter tipe/lokasi/kapasitas. |
| Pengguna | Login, `role=USER`, `account_status=ACTIVE` | Reservasi dan laporan miliknya sendiri. |
| Petugas | Login, `role=OFFICER` (dibuat admin) | Proses antrian reservasi dan laporan, ubah status maintenance fasilitas. |
| Admin | Login, `role=ADMIN` | Master fasilitas, kelola & verifikasi akun, rekap dan export PDF. |

Alur status akun: registrasi mandiri menghasilkan `PENDING`, lalu admin memverifikasi menjadi `ACTIVE` atau menolak menjadi `REJECTED`. Akun juga bisa menjadi `INACTIVE` (dinonaktifkan). Petugas tidak pernah registrasi mandiri; akun petugas hanya dibuat oleh admin. Pengguna dengan status selain `ACTIVE` tidak bisa mengakses fitur terproteksi.

Dashboard: satu route `/dashboard` dengan guard ganda (`proxy.ts` + `getSessionUser()`) dan sidebar yang hanya merender section milik peran terkait.

## Ringkasan API

Base URL: `http://localhost:3000/api`. Semua respons JSON, dengan status HTTP yang sesuai. Route Handler yang menyentuh DB/auth/upload/PDF memakai `runtime = 'nodejs'`.

| Grup | Endpoint |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Users (admin) | `GET/POST /admin/users`, `PATCH /admin/users/:id/verify`, `.../reject`, `.../deactivate` |
| Facilities | `GET /facilities`, `GET /facilities/:id`, `POST/PUT /facilities`, `PATCH /facilities/:id/status`, `GET /facilities/:id/availability` |
| Reservations | `POST /reservations`, `GET /reservations/my`, `GET /reservations/:id`, `PATCH /reservations/:id/cancel` |
| Officer reservations | `GET /officer/reservations`, `GET /officer/reservations/history`, `PATCH /officer/reservations/:id/approve`, `.../reject`, `.../cancel` |
| Reports | `POST /reports`, `GET /reports/my`, `GET /reports/:id`, `GET /officer/reports`, `PATCH /officer/reports/:id/status`, `PATCH /officer/facilities/:id/maintenance` |
| Rekap (admin) | `GET /admin/recap/occupancy`, `.../damage`, `GET /admin/recap/occupancy/export`, `.../damage/export` (PDF) |

Kontrak lengkap beserta payload dan kode status ada di PRD §13.

## Keamanan

- Sesi memakai JWT httpOnly cookie (`jose`); password di-hash dengan `bcryptjs`.
- Guard ganda: `proxy.ts` (optimistic, berbasis cookie) + pemeriksaan ulang role di Route Handler lewat `getSessionUser()`.
- Validasi `zod` di server bersifat otoritatif untuk form penting, jam/slot, status fasilitas, dan pencegahan bentrok.
- Upload dibatasi mime whitelist dan ukuran (`MAX_UPLOAD_MB`).
- Rahasia tidak pernah di-commit; hanya `.env.example` yang masuk repo.

## Alur Kerja Git

Repo memakai dua cabang proteksi, `main` (siap demo/kumpul) dan `develop` (integrasi harian), dengan alur feature branch -> PR -> review -> Squash and Merge.

Panduan lengkap (branch, konvensi commit, template PR, CODEOWNERS, hotfix) ada di [`docs/GIT-WORKFLOW.md`](docs/GIT-WORKFLOW.md).

## Deploy

Aplikasi di-deploy ke Vercel: **https://kampusspace.vercel.app/**

- Build memakai `npm run build` (Next.js). `postinstall` menjalankan `prisma generate`.
- Migration ke database terkelola (mis. Aiven) memakai `npx prisma migrate deploy`, bukan `migrate dev`.
- Foto laporan otomatis disimpan ke Vercel Blob saat `BLOB_READ_WRITE_TOKEN` tersedia (store Blob di-connect); tanpa token (lokal) foto ditulis ke `public/uploads`.

## Kredit

Kelompok 9 - Departemen Informatika, Fakultas Sains dan Matematika, Universitas Diponegoro.

| Kode | Nama | NIM | Peran & tanggung jawab |
|---|---|---|---|
| A1 | Muhammad Akmal Fazli Riyadi | 24060124130123 | Tech Lead + Auth: auth/RBAC, seed, kontrak dashboard & sidebar, `components/ui` |
| A2 | Dehar Zaidan Dzaki Amirullah | 24060124130099 | Fasilitas & Ketersediaan: katalog, filter, endpoint availability |
| A3 | Devano Trestanto | 24060124140149 | Reservasi + Dashboard User: validasi slot/konflik, antrian reservasi, UserDashboard |
| A4 | Farras Hilmy Zaidan | 24060124120003 | Laporan, Rekap PDF + Dashboard Officer/Admin: proses laporan, rekap & export |

Dosen Pengampu: Sandy Kurniawan, S.Kom., M.Kom.

## Dokumentasi Terkait

- [`docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md`](docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md) - sumber kebenaran produk, user story, aturan bisnis, kontrak API, ERD.
- [`docs/PEMBAGIAN-TUGAS-4-ORANG.md`](docs/PEMBAGIAN-TUGAS-4-ORANG.md) - matriks tanggung jawab dan timeline tiap anggota.
- [`docs/GIT-WORKFLOW.md`](docs/GIT-WORKFLOW.md) - cabang, konvensi commit, PR, rilis.
- [`docs/PPEK.md`](docs/PPEK.md) - laporan pengembangan sistem.
- [`PRODUCT.md`](PRODUCT.md) - ringkasan produk dan konteks operasional.
- [`DESIGN.md`](DESIGN.md) - arah visual dan design system KampusSpace.
- [`prisma/schema.prisma`](prisma/schema.prisma) - skema database otoritatif.

## Lisensi

Proyek akademik untuk mata kuliah Pengembangan Platform Khusus (PPK) 2026. Belum ada lisensi sumber terbuka; hubungi anggota kelompok untuk penggunaan di luar keperluan mata kuliah.
