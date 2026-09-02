# PRD — Sistem Reservasi & Pelaporan Fasilitas Kampus

> **Mata kuliah:** PPK 2026 — Project Sebelum UTS
> **Stack yang disepakati:** React.js (Vite) + Node.js/Express + MySQL + PDF Export
> **Tim:** 4 orang (placeholder)
> **Deadline pengumpulan:** 11 Oktober 2026, 12.00 WIB via Kulon (1 file Word + link Google Drive source/SQL)
> **Presentasi UTS:** 10 menit presentasi + 10–15 menit tanya jawab — materi: latar belakang, fitur utama, demo sistem, kendala
> **Dokumen ini:** PRD lengkap sebagai acuan pengerjaan & pembagian tugas 4 orang + alur Git

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Masalah](#2-latar-belakang--masalah)
3. [Tujuan Produk & Kriteria Sukses](#3-tujuan-produk--kriteria-sukses)
4. [Aktor & Hak Akses](#4-aktor--hak-akses)
5. [Ruang Lingkup](#5-ruang-lingkup)
6. [Arsitektur & Tech Stack](#6-arsitektur--tech-stack)
7. [Aturan Bisnis Inti](#7-aturan-bisnis-inti)
8. [User Story + Acceptance Criteria (US01–US17)](#8-user-story--acceptance-criteria-us01us17)
9. [Functional Requirements](#9-functional-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Alur Pengguna (User Flows)](#11-alur-pengguna-user-flows)
12. [Rancangan Data & ERD](#12-rancangan-data--erd)
13. [Kontrak API (REST)](#13-kontrak-api-rest)
14. [Struktur Folder (memenuhi ketentuan tugas)](#14-struktur-folder-memenuhi-ketentuan-tugas)
15. [Rancangan Halaman (IA & Wireframe checklist)](#15-rancangan-halaman-ia--wireframe-checklist)
16. [Validasi Client + Server](#16-validasi-client--server)
17. [Keamanan](#17-keamanan)
18. [Rekap & Export PDF](#18-rekap--export-pdf)
19. [Prioritas (MoSCoW)](#19-prioritas-moscow)
20. [Rencana Rilis & Timeline Hingga 11 Okt 2026](#20-rencana-rilis--timeline-hingga-11-okt-2026)
21. [Pembagian Tugas 4 Orang (RACI + branch)](#21-pembagian-tugas-4-orang-raci--branch)
22. [Alur Pengerjaan Tiap Orang (harian & integrasi)](#22-alur-pengerjaan-tiap-orang-harian--integrasi)
23. [Strategi Git & Kolaborasi](#23-strategi-git--kolaborasi)
24. [Definition of Done & Quality Gates](#24-definition-of-done--quality-gates)
25. [Rencana Pengujian](#25-rencana-pengujian)
26. [Risiko & Mitigasi](#26-risiko--mitigasi)
27. [Deliverable Word & Demo Checklist](#27-deliverable-word--demo-checklist)
28. [Lampiran A — Akun Demo & Env](#28-lampiran-a--akun-demo--env)
29. [Lampiran B — Seed & Contoh Data](#29-lampiran-b--seed--contoh-data)
30. [Lampiran C — Daftar Keputusan yang Sudah Dikunci](#30-lampiran-c--daftar-keputusan-yang-sudah-dikunci)

---

## 1. Ringkasan Eksekutif

Sistem Reservasi & Pelaporan Fasilitas Kampus adalah aplikasi web terpusat untuk mengelola peminjaman ruang kelas, aula, laboratorium, alat, dan lapangan. Satu alur reservasi + satu alur pelaporan kerusakan berjalan dalam satu sistem yang sama.

- **Pengunjung** tanpa login bisa melihat daftar fasilitas dan ketersediaan per slot (tanpa detail pemohon/tujuan).
- **Pengguna** (mahasiswa/dosen/staf, login) mengajukan reservasi, membatalkan reservasi miliknya, melihat riwayat, serta melaporkan kerusakan (kategori + deskripsi + foto) dan memantau status laporan.
- **Petugas** memproses antrian reservasi (approve/reject/cancel) dan laporan (baru/diproses/selesai/ditolak + catatan resolusi), serta menandai fasilitas `dalam perbaikan`.
- **Admin** mengelola master fasilitas, mendaftarkan akun petugas & pengguna secara langsung, memverifikasi akun hasil registrasi mandiri, serta melihat & mengekspor rekap okupansi & frekuensi kerusakan ke **PDF** (sesuai keputusan tim: PDF saja untuk MVP).

Validasi waktu reservasi (jam 07.00–20.00, slot 30 menit, kelipatan 30 menit) **wajib di sisi server**, dan persetujuan yang bentrok **wajib dicegah di server**.

---

## 2. Latar Belakang & Masalah

- Peminjaman fasilitas masih manual / tersebar (chat, spreadsheet, papan pengumuman) → bentrok jadwal tidak terdeteksi dini, laporan kerusakan tidak terpusat.
- Tidak ada sumber kebenaran tunggal untuk status fasilitas: mana yang aktif, nonaktif, atau dalam perbaikan.
- Rekap okupansi & kerusakan sulit ditarik untuk keputusan pengadaan/perawatan.
- Produk ini menjawab dengan satu portal: katalog fasilitas + kalender ketersediaan + antrian petugas + rekap PDF.

---

## 3. Tujuan Produk & Kriteria Sukses

### Tujuan

1. Civitas bisa mengecek ketersediaan dan mengajukan reservasi mandiri tanpa harus datang ke pengelola.
2. Petugas punya satu antrian untuk memproses reservasi & laporan tanpa ada yang terlewat.
3. Admin punya master data & rekap lintas fasilitas yang bisa diekspor.

### Kriteria sukses sebelum UTS

- Semua 17 user story dapat didemokan end-to-end dengan data seed.
- Tidak ada reservasi bentrok yang bisa lolos approve.
- Validasi slot & jam operasional tidak bisa di-bypass dari client (dibuktikan via direct API call).
- Semua anggota memiliki commit bermakna di GitHub/GitLab.
- Struktur folder memenuhi ketentuan: `/public`, `/app`, `/views`, `/config` (dipetakan ke struktur React+Express di §14).
- Dokumen Word pengumpulan lengkap & link Drive/API dapat dijalankan sesuai petunjuk.

---

## 4. Aktor & Hak Akses

| Aktor | Autentikasi | Hak |
|---|---|---|
| **Pengunjung** | Tanpa login | Melihat daftar fasilitas + ketersediaan per slot (tersedia/tidak tersedia). Tanpa detail pemohon/tujuan. Filter tipe/lokasi/kapasitas. |
| **Pengguna** | Login, `role=user`, `account_status=active` | US03–US07. Tidak bisa mengelola fasilitas atau memproses antrian orang lain. |
| **Petugas** | Login, `role=officer` (dibuat admin) | US08–US12. Tidak bisa mengelola master fasilitas atau membuat akun. |
| **Admin** | Login, `role=admin` | US13–US17 + semua rekap/export. Satu-satunya yang bisa membuat petugas & verifikasi akun. |

**Status akun pengguna:** `pending` → `active` (diverifikasi admin) atau `rejected`. Pengguna `pending`/`rejected`/`inactive` tidak bisa login untuk fitur terproteksi. Pesan error harus jelas.

---

## 5. Ruang Lingkup

### In scope (wajib sebelum UTS)

- Auth: registrasi, login, logout (server+client validation).
- Katalog fasilitas + pencarian (tipe/lokasi/kapasitas) + ketersediaan per slot.
- Reservasi: ajukan, riwayat, detail, batal oleh pemilik sebelum `start_time`, proses petugas (approve/reject/cancel dengan alasan).
- Laporan: buat laporan (kategori+deskripsi+foto), status laporan, proses petugas, ubah status fasilitas terkait.
- Admin: CRUD/nonaktifkan fasilitas, kelola akun petugas & pengguna, verifikasi akun, rekap & export PDF.
- Validasi server untuk semua form penting + jam/slot.
- Pemisahan koneksi DB / view / logika proses.

### Out of scope (Won't Have sebelum UTS)

- Pembayaran, SSO kampus, mobile native, notifikasi WA/push, integrasi kalender eksternal, inventaris alat granular. Boleh masuk backlog pasca-UTS.

---

## 6. Arsitektur & Tech Stack

Keputusan tim: **React.js + MySQL**. Karena React tidak berbicara langsung ke MySQL, arsitektur yang dipakai:

```
[ Browser: React + Vite ] --HTTPS/JSON--> [ Express API ] --mysql2/promise--> [ MySQL 8 ]
         |                                      |
         +-- validasi client                    +-- validasi server (otoritatif)
         +-- React Router, hooks                +-- JWT httpOnly cookie / Bearer (dipilih saat setup)
                                                +-- bcrypt, zod/joi, multer, pdfkit
```

**Stack rinci:**

- Frontend: React 18 + Vite + React Router + fetch/axios + date-fns/dayjs (zona Asia/Jakarta)
- Backend: Node.js 20 LTS + Express 5 + mysql2/promise (atau Prisma/Knex — putuskan di setup, default `mysql2` agar mapping ke `/config/database.js` eksplisit)
- DB: MySQL 8
- Auth: JWT (httpOnly cookie) atau session — diputuskan Anggota 1 saat setup; PRD mengasumsikan JWT httpOnly cookie.
- Upload foto: `multer` → `public/uploads` (MVP) atau S3-compatible (opsional)
- Export PDF: `pdfkit`
- Validasi: `zod` atau `joi` (server), validasi form React (client)
- Tooling: ESLint, Prettier, dotenv

> Catatan pemenuhan ketentuan tugas: mapping struktur ada di §14.

---

## 7. Aturan Bisnis Inti

### 7.1 Waktu reservasi

- Jam operasional: **07.00–20.00 Asia/Jakarta**, slot tetap **30 menit**: 07.00–07.30, 07.30–08.00, …, 19.30–20.00.
- `start_time` dan `end_time` wajib di rentang operasional dan **kelipatan 30 menit**. Validasi di **server** (client hanya UX).
- `end_time` > `start_time`. Tidak boleh lintas hari. `reservation_date` adalah 1 hari.
- Contoh valid: 09.00–10.00, 13.30–14.00. Tidak valid: 09.10–10.00, 06.30–07.30, 19.45–20.15.

### 7.2 Konflik jadwal

- Konflik terjadi jika interval tumpang tindih pada **facility yang sama + tanggal yang sama + status `approved`** yang overlap:
  - `A: [s1, e1)` dan `B: [s2, e2)` bentrok jika `s1 < e2 && s2 < e1`.
  - `10.00–11.00` dan `11.00–12.00` **tidak** bentrok (bersentuhan di tepi diperbolehkan).
- Cek konflik wajib di dua titik:
  1. Saat **approve** (otoritatif — harus menolak jika bentrok).
  2. Saat **create** boleh memberi peringatan dini, tapi tidak menggantikan cek saat approve (karena race condition).
- Transaksi approve harus `SELECT ... FOR UPDATE` atau unique constraint + retry untuk mencegah race.

### 7.3 Pembatalan

- **Pengguna** boleh `cancel` reservasi miliknya sendiri **sebelum `start_time`**. Setelah lewat `start_time`, ditolak (403/422).
- **Petugas** boleh `cancel` reservasi `approved` kapan pun dengan **alasan wajib** (mis. fasilitas mendadak tidak layak).
- Alasan pembatalan petugas disimpan di `cancellation_reason`.

### 7.4 Fasilitas dalam perbaikan

- Petugas dapat set `facilities.status = 'under_maintenance'` terkait laporan `in_progress`.
- Fasilitas `under_maintenance` / `inactive` tidak bisa dipesan (create & approve ditolak).
- Setelah `resolved`, petugas mengembalikan ke `active`.

### 7.5 Laporan

- Kategori contoh: `kerusakan_ringan`, `kerusakan_berat`, `kebersihan`, `kehilangan`, `lainnya` (seed 5 kategori, admin boleh tambah).
- Foto: MVP 1 foto wajib (sesuai keputusan), disimpan sebagai `photo_path`. Validasi: max 5 MB, mime `image/jpeg|png|webp`.
- Status: `new` → `in_progress` → `resolved` | `rejected`. Transisi `resolved` wajib `resolution_notes`.

### 7.6 Akun

- Registrasi mandiri pengguna → `account_status=pending`. Tidak bisa login sampai `active`.
- Petugas **tidak pernah** registrasi mandiri; hanya admin yang membuat.
- Admin juga bisa membuat pengguna langsung (`active` tanpa verifikasi).

---

## 8. User Story + Acceptance Criteria (US01–US17)

Format AC memakai Given/When/Then agar bisa jadi test case.

### US01 — Lihat daftar fasilitas + ketersediaan per slot (tanpa detail pemohon)

- **Sebagai** pengunjung/pengguna, **saya bisa** melihat daftar fasilitas beserta status ketersediaannya per slot waktu (tersedia/tidak tersedia), **tanpa** melihat detail pemohon/tujuan.
- **AC1:** Given pengunjung tanpa login, When membuka `/facilities` dan memilih tanggal, Then melihat daftar fasilitas dengan grid slot 07.00–20.00 bertanda tersedia/tidak tersedia/maintenance.
- **AC2:** Given ada reservasi `approved` di slot tersebut, Then slot tampil tidak tersedia, **tanpa** menampilkan nama pemohon/tujuan.
- **AC3:** Given fasilitas `under_maintenance`/`inactive`, Then semua slot hari itu tampil tidak tersedia dengan badge status.

### US02 — Cari fasilitas (tipe/lokasi/kapasitas)

- **AC1:** Filter kombinasi tipe + lokasi (contains) + kapasitas (min/max) bekerja.
- **AC2:** Filter + ketersediaan tanggal bisa dipakai bersamaan.
- **AC3:** Hasil kosong menampilkan empty state yang jelas, bukan error.

### US03 — Ajukan reservasi (dengan tujuan)

- **AC1:** Pengguna login mengisi facility, tanggal, `start_time`, `end_time`, `purpose` → sukses `pending` bila valid.
- **AC2:** `start/end` tidak kelipatan 30 menit atau di luar 07.00–20.00 → ditolak server 422 meski client di-bypass.
- **AC3:** Fasilitas `inactive`/`maintenance` → ditolak.

### US04 — Batalkan reservasi sendiri sebelum batas waktu

- **AC1:** Pemilik reservasi `pending`/`approved` bisa cancel sebelum `start_time` → status `cancelled_by_user`.
- **AC2:** Bukan pemilik → 403.
- **AC3:** Sudah lewat `start_time` → ditolak dengan pesan.

### US05 — Lihat riwayat & status reservasi (detail lengkap milik sendiri)

- **AC1:** List reservasi milik sendiri dengan filter status.
- **AC2:** Detail menampilkan facility, tanggal, jam, tujuan, status, alasan pembatalan bila ada.
- **AC3:** Tidak bisa melihat detail reservasi orang lain (403).

### US06 — Laporkan kerusakan (kategori, deskripsi, foto)

- **AC1:** Pengguna login membuat laporan dengan facility, kategori, deskripsi, 1 foto → `new`.
- **AC2:** Foto >5MB / mime tidak valid → 422.
- **AC3:** Tanpa login → 401.

### US07 — Lihat status laporan sendiri

- **AC1:** List + detail laporan milik sendiri, termasuk `resolution_notes` bila `resolved`.

### US08 — Dashboard/antrian petugas (reservasi & laporan pending)

- **AC1:** Petugas melihat antrian `pending`/`new` terurut (terlama dulu atau prioritas), dengan counter.
- **AC2:** Tidak ada yang terlewat: filter default menampilkan yang butuh aksi.

### US09 — Setujui/tolak reservasi manual + cegah bentrok

- **AC1:** Petugas approve `pending` yang tidak bentrok → `approved`.
- **AC2:** Jika bentrok dengan `approved` lain di facility+tanggal yang overlap → approve ditolak 409.
- **AC3:** Reject `pending` → `rejected` dengan alasan.

### US10 — Batalkan reservasi yang sudah disetujui (kondisi mendesak)

- **AC1:** Petugas cancel `approved` → `cancelled_by_officer` wajib alasan.
- **AC2:** Tanpa alasan → 422.

### US11 — Ubah status laporan + catatan resolusi

- **AC1:** `new` → `in_progress` → `resolved` (wajib `resolution_notes`) atau `rejected`.
- **AC2:** Transisi ilegal ditolak.

### US12 — Tandai fasilitas 'dalam perbaikan' & kembalikan ke aktif

- **AC1:** Dari laporan `in_progress`, petugas set facility `under_maintenance`.
- **AC2:** Setelah `resolved`, petugas kembalikan ke `active`.
- **AC3:** Selama `under_maintenance`, reservasi baru/approve ditolak.

### US13 — Admin daftarkan petugas langsung

- **AC1:** Admin membuat akun `officer` langsung (tanpa registrasi mandiri).
- **AC2:** Tidak ada endpoint publik yang bisa membuat `officer`.

### US14 — Admin daftarkan pengguna langsung

- **AC1:** Admin membuat akun `user` langsung (`active`).

### US15 — Admin verifikasi/tolak akun hasil registrasi mandiri

- **AC1:** Admin melihat daftar `pending`, lalu verify → `active` atau reject → `rejected`.
- **AC2:** Pengguna `pending` tidak bisa login (401/403 dengan pesan "menunggu verifikasi").

### US16 — Kelola data fasilitas (tambah/edit/nonaktifkan)

- **AC1:** Admin CRUD fasilitas, termasuk set `inactive`.
- **AC2:** Nonaktifkan fasilitas tidak menghapus riwayat reservasi/laporan.

### US17 — Lihat & ekspor rekap okupansi & frekuensi kerusakan (PDF)

- **AC1:** Admin melihat rekap okupansi per fasilitas/periode dan frekuensi kerusakan per fasilitas/lokasi.
- **AC2:** Export PDF (keputusan tim: **PDF saja** untuk MVP) menghasilkan file yang rapi dan bisa dibuka.
- **AC3:** Filter periode & fasilitas memengaruhi isi PDF.

---

## 9. Functional Requirements

| ID | Kebutuhan | US |
|---|---|---|
| FR-AUTH-01 | Registrasi pengguna (pending) | US15 |
| FR-AUTH-02 | Login/logout, role guard | Semua |
| FR-AUTH-03 | Admin create officer/user | US13, US14 |
| FR-AUTH-04 | Admin verify/reject pending | US15 |
| FR-FAC-01 | CRUD fasilitas + status | US16, US12 |
| FR-FAC-02 | Pencarian tipe/lokasi/kapasitas | US02 |
| FR-FAC-03 | Ketersediaan per slot per tanggal | US01 |
| FR-RSV-01 | Create reservasi + validasi slot & jam | US03 |
| FR-RSV-02 | Riwayat & detail milik sendiri | US05 |
| FR-RSV-03 | Cancel oleh pemilik sebelum start | US04 |
| FR-RSV-04 | Approve/reject petugas + cegah bentrok | US09 |
| FR-RSV-05 | Cancel petugas + alasan | US10 |
| FR-RPT-01 | Create laporan + foto | US06 |
| FR-RPT-02 | Status laporan milik sendiri | US07 |
| FR-RPT-03 | Proses laporan petugas | US11 |
| FR-RPT-04 | Tandai maintenance & kembalikan | US12 |
| FR-DASH-01 | Dashboard antrian petugas | US08 |
| FR-REKAP-01 | Rekap okupansi & kerusakan + export PDF | US17 |

---

## 10. Non-Functional Requirements

- **Validasi ganda:** semua form penting divalidasi di React (UX) dan Express (otoritatif).
- **Keamanan:** bcrypt (cost 10–12), JWT httpOnly cookie, RBAC di middleware, rate limit login, CORS whitelist `CLIENT_URL`.
- **Zona waktu:** Asia/Jakarta untuk semua tampilan & validasi.
- **Performa:** list fasilitas & ketersediaan < 500ms untuk 100 fasilitas (tanpa foto) di lokal; pagination bila >50.
- **Upload:** max 5 MB, mime whitelist, nama file aman (uuid), serve via `public/uploads`.
- **PDF:** generate < 3 detik untuk 1 bulan data.
- **Observability:** audit log untuk create/approve/cancel/status change.
- **Kualitas:** ESLint+Prettier, pesan commit jelas, semua anggota punya commit, README & .env.example lengkap.

---

## 11. Alur Pengguna (User Flows)

### Pengunjung → lihat ketersediaan

`/` → `/facilities` → pilih tanggal → lihat grid slot → filter tipe/lokasi/kapasitas → klik fasilitas → detail + kalender

### Pengguna → reservasi

Login → `/facilities/:id` → pilih tanggal & slot → isi tujuan → submit → toast pending → `/reservations` (riwayat) → detail → cancel (jika perlu)

### Petugas → proses reservasi

Login officer → `/officer/queue` → tab Reservasi pending → approve/reject (cek bentrok) → cancel approved (dengan alasan)

### Pengguna → lapor kerusakan

Login → `/facilities/:id` → "Laporkan" → kategori+deskripsi+foto → submit → `/reports` pantau status

### Admin → kelola & rekap

Login admin → `/admin/facilities` (CRUD) → `/admin/users` (create/verify) → `/admin/recap` → filter → Export PDF

---

## 12. Rancangan Data & ERD

### ERD (teks)

```
users 1--* reservations (users.id = reservations.user_id)
users 1--* reports      (users.id = reports.reporter_id)
facilities 1--* reservations
facilities 1--* reports
users 1--* reservations.processed_by (nullable, officer)
users 1--* reports.handled_by (nullable, officer)
users 1--* audit_logs
```

### Tabel `users`

| Kolom | Tipe | Constraint |
|---|---|---|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(190) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM('user','officer','admin') | NOT NULL, DEFAULT 'user' |
| account_status | ENUM('pending','active','rejected','inactive') | NOT NULL, DEFAULT 'pending' |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP |

Index: `UNIQUE(email)`, `INDEX(role, account_status)`

### Tabel `facilities`

| Kolom | Tipe | Constraint |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| name | VARCHAR(150) | NOT NULL, UNIQUE |
| type | VARCHAR(50) | NOT NULL (kelas/aula/lab/alat/lapangan) |
| location | VARCHAR(150) | NOT NULL |
| capacity | INT UNSIGNED | NOT NULL, DEFAULT 0 |
| description | TEXT | NULL |
| status | ENUM('active','inactive','under_maintenance') | NOT NULL, DEFAULT 'active' |
| created_at | DATETIME |  |
| updated_at | DATETIME |  |

Index: `INDEX(type)`, `INDEX(location)`, `INDEX(status)`, `INDEX(capacity)`

### Tabel `reservations`

| Kolom | Tipe | Constraint |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| user_id | BIGINT UNSIGNED | FK → users.id, NOT NULL |
| facility_id | BIGINT UNSIGNED | FK → facilities.id, NOT NULL |
| reservation_date | DATE | NOT NULL |
| start_time | TIME | NOT NULL |
| end_time | TIME | NOT NULL |
| purpose | TEXT | NOT NULL |
| status | ENUM('pending','approved','rejected','cancelled_by_user','cancelled_by_officer','completed') | NOT NULL, DEFAULT 'pending' |
| cancellation_reason | TEXT | NULL |
| processed_by | BIGINT UNSIGNED | FK → users.id, NULL |
| processed_at | DATETIME | NULL |
| created_at | DATETIME |  |
| updated_at | DATETIME |  |

Index: `INDEX(facility_id, reservation_date, status)`, `INDEX(user_id)`, `INDEX(status)`

> Constraint bentrok tidak bisa diwujudkan sebagai UNIQUE sederhana karena interval; cegah via transaksi `SELECT ... FOR UPDATE` di service + test.

### Tabel `reports`

| Kolom | Tipe | Constraint |
|---|---|---|
| id | BIGINT UNSIGNED | PK |
| reporter_id | BIGINT UNSIGNED | FK → users.id, NOT NULL |
| facility_id | BIGINT UNSIGNED | FK → facilities.id, NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| description | TEXT | NOT NULL |
| photo_path | VARCHAR(255) | NOT NULL (MVP 1 foto) |
| status | ENUM('new','in_progress','resolved','rejected') | NOT NULL, DEFAULT 'new' |
| resolution_notes | TEXT | NULL (wajib saat resolved) |
| handled_by | BIGINT UNSIGNED | FK → users.id, NULL |
| handled_at | DATETIME | NULL |
| created_at | DATETIME |  |
| updated_at | DATETIME |  |

Index: `INDEX(facility_id, status)`, `INDEX(reporter_id)`

### Tabel `audit_logs` (opsional tapi direkomendasikan)

| Kolom | Tipe |
|---|---|
| id | BIGINT UNSIGNED PK |
| user_id | BIGINT UNSIGNED NULL |
| action | VARCHAR(50) |
| entity_type | VARCHAR(50) |
| entity_id | BIGINT UNSIGNED |
| description | TEXT |
| created_at | DATETIME |

---

## 13. Kontrak API (REST)

Base URL: `http://localhost:5000/api` (dev). Semua response JSON `{ success, data|error, message }`. Error memakai HTTP status yang tepat.

### Auth

```
POST /auth/register        { name, email, password } -> 201 { user: {id, name, email, account_status:'pending'} }
POST /auth/login           { email, password } -> 200 { user, token } + set-cookie (httpOnly)
POST /auth/logout          -> 200 (clear cookie)
GET  /auth/me              -> 200 { user } (butuh auth)
```

### Users (admin)

```
GET    /admin/users?status=pending&role=user
POST   /admin/users        { name, email, password, role }  (role=user|officer)
PATCH  /admin/users/:id/verify   -> { account_status:'active' }
PATCH  /admin/users/:id/reject   -> { account_status:'rejected' }
PATCH  /admin/users/:id/deactivate
```

### Facilities

```
GET    /facilities?type=&location=&capacity_min=&capacity_max=&date=YYYY-MM-DD
GET    /facilities/:id
POST   /facilities         (admin) { name, type, location, capacity, description, status }
PUT    /facilities/:id     (admin)
PATCH  /facilities/:id/status  (admin|officer untuk maintenance) { status }
GET    /facilities/:id/availability?date=YYYY-MM-DD -> { slots: [{ start:'07:00', end:'07:30', available:boolean, reason }] }
```

### Reservations

```
POST   /reservations                    (user) { facility_id, reservation_date, start_time, end_time, purpose }
GET    /reservations/my?status=&from=&to=   (user)
GET    /reservations/:id                (owner|officer|admin)
PATCH  /reservations/:id/cancel         (owner, sebelum start_time)

GET    /officer/reservations?status=pending|approved&facility_id=&date=
PATCH  /officer/reservations/:id/approve   (officer) -> 409 jika bentrok
PATCH  /officer/reservations/:id/reject    { reason }
PATCH  /officer/reservations/:id/cancel    { reason } (dari approved)
```

### Reports

```
POST   /reports                 (user, multipart) { facility_id, category, description, photo }
GET    /reports/my
GET    /reports/:id
GET    /officer/reports?status=
PATCH  /officer/reports/:id/status  { status, resolution_notes? }
PATCH  /officer/facilities/:id/maintenance  { status: 'under_maintenance'|'active' }
```

### Rekap (admin, PDF saja)

```
GET /admin/recap/occupancy?from=&to=&facility_id=&location=
GET /admin/recap/damage?from=&to=&facility_id=&location=
GET /admin/recap/occupancy/export?from=&to=&facility_id=&location=  -> application/pdf
GET /admin/recap/damage/export?from=&to=&facility_id=&location=     -> application/pdf
```

Semua endpoint terproteksi memakai middleware `authenticate` + `authorize(role)`. Validasi payload memakai `zod`/`joi`.

---

## 14. Struktur Folder (memenuhi ketentuan tugas)

Ketentuan tugas mewajibkan minimal `/public`, `/app` (model/controller), `/views`, `/config`. Untuk React+Express, dipetakan sebagai monorepo:

```
campus-facility-system/          # root repo
├── public/                      # ← wajib: aset publik + uploads
│   ├── uploads/                 # foto laporan (gitignored, kecuali .gitkeep)
│   └── assets/
├── client/                      # React (Vite)
│   ├── src/
│   │   ├── components/          # Button, Card, Badge, SlotGrid, Filters
│   │   ├── views/               # pages: Facilities, FacilityDetail, Reservations, Reports, OfficerQueue, Admin/*
│   │   ├── layouts/             # AppLayout, AuthLayout
│   │   ├── services/            # api.js (fetch wrapper)
│   │   ├── hooks/               # useAuth, useAvailability
│   │   ├── utils/               # validators, slot helpers, fmt
│   │   ├── App.jsx & main.jsx
│   │   └── styles/
│   ├── index.html
│   └── package.json
├── app/                         # ← wajib: model/controller backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/             # auth, role, error, validate, upload, rateLimit
│   ├── validators/              # zod schemas
│   ├── services/                # reservationService (slot+conflict), reportService, pdfService
│   └── utils/
├── config/                      # ← wajib: konfigurasi
│   ├── database.js              # mysql2 pool
│   └── env.js
├── views/                       # ← wajib: template (email atau PDF view bila perlu)
│   └── emails/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/              # opsional
├── server.js                    # entry Express
├── .env.example
├── .gitignore
├── README.md
└── package.json                 # root scripts
```

> Jika dosen memeriksa folder secara literal di root, keempat folder di atas sudah ada di root. Isi `client/` tidak menggantikan kewajiban tersebut.

---

## 15. Rancangan Halaman (IA & Wireframe checklist)

- `/` Landing + CTA lihat fasilitas
- `/facilities` List + filter + badge ketersediaan (tanpa login)
- `/facilities/:id` Detail + kalender slot per tanggal + CTA reservasi/laporkan (guard login)
- `/login`, `/register`, `/pending-verification`
- `/reservations` (user) — list + filter status + detail + cancel
- `/reports` (user) — list + detail + form buat laporan
- `/officer/queue` — dua tab: Reservasi pending & Laporan new/in_progress + aksi
- `/admin/facilities` — CRUD + status
- `/admin/users` — create officer/user + verify/reject pending
- `/admin/recap` — filter + preview tabel + Export PDF

Setiap halaman wajib punya: loading, empty, error state; form punya inline error + toast.

---

## 16. Validasi Client + Server

### Client (React)

- Required, panjang, format email, kekuatan password, file type/size, jam 07.00–20.00, kelipatan 30 menit (UX).
- Disable submit bila invalid, tampilkan pesan dekat field.

### Server (otoritatif — tidak bisa di-bypass)

- Semua rule client diulang di `validators/` + `services/`.
- Validasi jam/slot di satu tempat: `services/reservationService.validateSlot()` — dipakai oleh create & approve.
- Cek konflik di `services/reservationService.checkConflict()` dalam transaksi.
- Upload: `multer` fileFilter + limits.
- Semua error mengembalikan 4xx dengan `message` yang bisa ditampilkan.

**Contoh helper slot (dipakai client & server):**

```js
export function isThirtyMinuteSlot(t) { // t = "HH:mm"
  const [h, m] = t.split(':').map(Number);
  return (m === 0 || m === 30) && h >= 7 && h <= 20;
}
export function withinOperatingHours(start, end) {
  return start >= '07:00' && end <= '20:00' && start < end;
}
```

---

## 17. Keamanan

- Hash password `bcrypt` (jangan simpan plain).
- JWT httpOnly cookie + `SameSite=Lax`, `Secure` di prod, expiry 1–7 hari.
- RBAC: `authorize('admin')`, `authorize('officer','admin')`, dst. di setiap route sensitif.
- Rate limit `/auth/login` (mis. 10/menit/IP).
- CORS: hanya `CLIENT_URL`.
- Jangan commit `.env`; sediakan `.env.example`.
- Sanitasi input, parameterized query (mysql2 `?` placeholders).
- Upload: validasi mime + ext + uuid filename, jangan pakai nama asli user.

---

## 18. Rekap & Export PDF

### Rekap okupansi

- Input: `from`, `to`, `facility_id`, `location`.
- Output tabel: fasilitas | total slot tersedia | slot terpakai (approved) | % okupansi | jumlah reservasi.
- Rumus okupansi per fasilitas per periode: `approved_slots / total_slots_operasional`.

### Rekap kerusakan

- Input sama + `category`.
- Output: fasilitas/lokasi | jumlah laporan `new`/`in_progress`/`resolved`/`rejected` | kategori terbanyak.

### Export PDF (keputusan: PDF saja)

- Library: `pdfkit`.
- Header: judul, periode, filter, tanggal cetak, nama admin.
- Tabel rapi + footer halaman.
- Endpoint `.../export` mengembalikan `Content-Disposition: attachment; filename="rekap-*.pdf"`.

---

## 19. Prioritas (MoSCoW)

**Must (wajib demo UTS):** semua 17 US + PDF export + validasi server slot & anti-bentrok.

**Should:** audit log, pagination, filter lanjutan, dashboard counter, upload 1 foto.

**Could (jika sempat):** multi-foto, kalender drag-select, grafik okupansi.

**Won't (sebelum UTS):** pembayaran, SSO, mobile native, WA/push, inventaris granular.

---

## 20. Rencana Rilis & Timeline Hingga 11 Okt 2026

Asumsi start minggu ini (akhir Agustus). Jika start lebih lambat, kompres minggu 1–2.

| Minggu | Periode | Fokus | Output |
|---|---|---|---|
| 1 | 1–7 Sep | Setup + ERD + wireframe | Repo, struktur folder, ERD, wireframe, `.env.example`, README |
| 2 | 8–14 Sep | Fondasi & Auth | React+Vite+Express+MySQL jalan, `users` + seed, register/login/logout, RBAC |
| 3 | 15–21 Sep | Fasilitas & ketersediaan | CRUD fasilitas, pencarian, availability per slot |
| 4 | 22–28 Sep | Reservasi | Create, riwayat, cancel user, approve/reject/cancel petugas + anti-bentrok |
| 5 | 29 Sep–5 Okt | Laporan & rekap | Laporan+foto, proses laporan, maintenance, rekap & export PDF |
| 6 | 6–9 Okt | Integrasi & hardening | Gabung semua branch, uji lintas role, seed demo, fix bug |
| 7 | 10–11 Okt | Dokumen & rilis | Screenshot, Word, Drive, simulasi demo 10 menit, tag `v1.0-uts` |

Milestone Git: `v0.1-auth`, `v0.2-facilities`, `v0.3-reservations`, `v0.4-reports`, `v1.0-uts`.

---

## 21. Pembagian Tugas 4 Orang (RACI + branch)

Nama placeholder — ganti dengan nama/NIM anggota.

| Anggota | Peran | Tanggung jawab utama | Branch utama | Reviewer |
|---|---|---|---|---|
| **A1 — Anggota 1** | Tech Lead + Auth | Setup repo, `config/database.js`, `server.js`, `users` + seed, register/login/logout, middleware auth/role, akun demo, `.env.example`, README | `feature/setup`, `feature/auth` | A2 |
| **A2 — Anggota 2** | Fasilitas & Ketersediaan | CRUD fasilitas, pencarian tipe/lokasi/kapasitas, availability per tanggal/slot, badge status, halaman user & admin fasilitas | `feature/facilities`, `feature/availability` | A3 |
| **A3 — Anggota 3** | Reservasi | Form reservasi, validasi slot 30 menit & jam, cek konflik, riwayat/detail/cancel user, antrian & approve/reject/cancel petugas | `feature/reservations` | A4 |
| **A4 — Anggota 4** | Laporan, Rekap & Rilis | Laporan+foto, proses laporan, maintenance fasilitas, dashboard petugas, rekap & export PDF, screenshot, dokumen Word, materi demo | `feature/reports`, `feature/recap-pdf`, `docs/submission` | A1 |

RACI singkat: setiap fitur — **R** = pemilik branch, **A** = Tech Lead (A1) untuk keputusan arsitektur, **C** = reviewer, **I** = semua anggota via PR.

Kepemilikan file (CODEOWNERS — buat di `.github/CODEOWNERS`):

```
# Fallback
*               @A1
/app/models/facility*  @A2
/app/controllers/facility* @A2
/client/src/views/*Facility* @A2
/app/*reservation*      @A3
/client/src/views/*Reserv* @A3
/app/*report*           @A4
/app/services/pdf*      @A4
/config/                @A1
/database/              @A1
```

---

## 22. Alur Pengerjaan Tiap Orang (harian & integrasi)

### Alur harian (semua anggota, setiap hari kerja)

```
1. git switch develop && git pull origin develop
2. git switch <feature-branch> && git merge develop  (atau rebase bila disepakati)
3. kerjakan 1 task terukur (1 commit = 1 tujuan)
4. jalankan lint/test/manual check
5. git add -p && git commit -m "feat: ..."
6. git push -u origin <feature-branch> (push minimal 1x/hari)
7. jika fitur siap review → buka PR ke develop, isi deskripsi + screenshot/API proof
8. review PR orang lain (maks 24 jam)
```

### Alur mingguan per anggota

**A1 (minggu 1–2 berat di awal):** setup → auth → seed → RBAC → jaga `develop` tetap hijau, bantu unblock A2–A4.

**A2:** tunggu `facilities` table dari A1 (atau buat migration sendiri lalu PR) → CRUD → search → availability → serah ke A3 untuk dipakai di reservasi.

**A3:** tunggu availability API dari A2 → validasi slot → create reservasi → riwayat/cancel → antrian petugas + anti-bentrok.

**A4:** tunggu facilities dari A2 → laporan+upload → proses laporan → maintenance → rekap → PDF → dokumen Word (mulai cicil dari minggu 3).

### Aturan integrasi

- Integrasi ke `develop` minimal 2×/minggu (Jumat sore wajib merge mingguan).
- Jangan menumpuk PR besar di akhir; PR ideal < 300 baris.
- Konflik diselesaikan pemilik PR, bukan reviewer.
- `develop` harus selalu bisa di-`npm run dev` tanpa error.

---

## 23. Strategi Git & Kolaborasi

### Branch

```
main            — hanya rilis yang siap kumpul/demo (protected)
develop         — integrasi harian (protected, butuh PR + 1 approval)
feature/*       — pekerjaan fitur (dari develop)
fix/*           — perbaikan bug
docs/*          — dokumentasi/Word
```

Contoh nama branch:

```
feature/setup
feature/auth
feature/facilities
feature/availability
feature/reservations
feature/reports
feature/recap-pdf
fix/reservation-conflict-race
docs/submission
```

### Alur Git (step-by-step)

```bash
# sekali di awal (tiap anggota)
git clone <repo-url>
cd campus-facility-system
git switch develop
git pull origin develop

# mulai fitur
git switch -c feature/reservations
# ... kerja ...
git add -p
git commit -m "feat: add reservation slot validation (07-20, 30min)"
git push -u origin feature/reservations
# buka PR: feature/reservations -> develop di GitHub
# setelah approve:
# Squash & Merge (disarankan) atau Merge commit — konsisten satu repo
git switch develop
git pull origin develop
git branch -d feature/reservations
```

**Dilarang:** commit langsung ke `main`/`develop`, force-push ke branch orang lain, commit `.env` atau `node_modules`.

### Commit convention (Conventional Commits ringan)

```
feat: tambah fitur
fix: perbaiki bug
refactor: rapikan tanpa ubah perilaku
test: tambah/perbaiki test
docs: dokumentasi
chore: tooling/config
style: format
```

Contoh:

```
feat: add facility availability API per date
feat: validate reservation operating hours on server
fix: prevent overlapping approved reservations on approve
test: add reservation conflict tests
docs: add local setup instructions
chore: add multer upload limits
```

### Pull Request

- Template PR wajib: tujuan, US yang dicakup, cara test manual, screenshot/API proof, checklist DoD.
- Minimal 1 approval dari reviewer yang ditunjuk (§21).
- CI (jika ada): lint + test harus hijau.
- Merge strategy: **Squash and Merge** (riwayat main/develop rapi).

### Rilis

```bash
# saat siap kumpul/demo
git switch main
git merge develop
git tag -a v1.0-uts -m "UTS release 11 Okt 2026"
git push origin main --tags
# build Drive: zip source + schema.sql + seed.sql + README + .env.example (tanpa .env)
```

### Menjamin 4 anggota punya commit

- Setiap anggota push minimal 1 commit/hari kerja.
- Commit kosong/dummy tidak dihitung; reviewer menolak PR tanpa kontribusi nyata.
- `git shortlog -sne --no-merges` dipakai untuk audit sebelum kumpul.

---

## 24. Definition of Done & Quality Gates

Fitur disebut **Done** jika:

- [ ] User story terkait bisa didemokan end-to-end dengan seed.
- [ ] Validasi client + server ada untuk field penting.
- [ ] RBAC diuji (pengunjung/user/officer/admin).
- [ ] Error handling rapi (4xx/5xx + pesan yang bisa ditampilkan).
- [ ] Migration/seed diperbarui bila ada perubahan skema.
- [ ] Tidak ada secret di repo (`.env` di `.gitignore`).
- [ ] Direview 1 orang & PR di-merge ke `develop`.
- [ ] Lolos uji integrasi di `develop` (manual checklist §25).

Quality gates sebelum merge ke `main`:

- [ ] `develop` bisa `npm install && npm run dev` tanpa error.
- [ ] Semua 17 US diuji ulang (smoke test).
- [ ] Export PDF bisa dibuka.
- [ ] `git shortlog` menunjukkan 4 anggota punya commit.

---

## 25. Rencana Pengujian

### Manual (wajib sebelum tiap merge ke develop)

- Auth: register pending → verify → login; officer tidak bisa register mandiri.
- Fasilitas: CRUD, filter, availability, maintenance block.
- Reservasi: valid slot, luar jam ditolak, bentrok ditolak saat approve, cancel sebelum/sesudah start.
- Laporan: create+foto, status flow, maintenance toggle.
- Rekap: filter + export PDF.

### API (curl/Postman — bukti bypass client)

```bash
# harus 422 meski client di-bypass
curl -X POST http://localhost:5000/api/reservations \
  -H "Authorization: Bearer <token-user>" -H "Content-Type: application/json" \
  -d '{"facility_id":1,"reservation_date":"2026-10-01","start_time":"09:10","end_time":"10:00","purpose":"coba"}'
# harus 409 saat bentrok
# harus 403 saat user cancel milik orang lain
```

### Otomatis (disarankan)

- Unit: `validateSlot`, `withinOperatingHours`, `hasConflict`.
- Integration: create → approve → create overlap → approve kedua harus 409.

---

## 26. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Race condition approve bentrok | Jadwal ganda | Transaksi + `FOR UPDATE`, test konkurensi |
| Validasi hanya di client | Bypass via API | Validasi server otoritatif + test curl |
| Foto besar / mime salah | Storage penuh / XSS | Limit 5MB, whitelist mime, uuid filename |
| Anggota tidak commit | Nilai kolaborasi | Aturan 1 commit/hari + PR kecil + audit shortlog |
| Konflik merge besar | Telat integrasi | Merge ke develop 2×/minggu, PR <300 baris |
| PDF tidak rapi | Gagal rekap | Mulai pdfkit di minggu 5, test dengan data banyak |
| .env bocor | Kredensial terekspos | `.gitignore`, `.env.example`, review PR |

---

## 27. Deliverable Word & Demo Checklist

### Isi Word (sesuai ketentuan tugas)

1. Cover: judul, nama & NIM 4 anggota, kelas, tanggal.
2. Latar belakang & tujuan (ringkas dari §2–§3).
3. Aktor & hak akses (tabel §4).
4. Pembagian tugas (tabel §21 + §20).
5. Link Google Drive: source code + `schema.sql` + `seed.sql` + aset yang dibutuhkan.
6. Cara menjalankan program (dari §28).
7. Akun login tiap aktor (dari §28).
8. Screenshot tiap fitur + penjelasan singkat (urut US01–US17).
9. Kendala & solusi.
10. Link repo GitHub/GitLab (jika diminta).

### Checklist demo 10 menit

```
0:00–1:30  Latar belakang & arsitektur (1 slide)
1:30–4:00  Pengunjung: katalog + filter + ketersediaan
4:00–6:00  Pengguna: reservasi + laporan + riwayat
6:00–8:00  Petugas: antrian, approve/reject/cancel, proses laporan, maintenance
8:00–9:30  Admin: CRUD fasilitas, verify akun, rekap & Export PDF
9:30–10:00 Kendala & mitigasi + penutup
```

Cadangan tanya jawab: validasi slot, anti-bentrok, RBAC, upload, PDF, Git workflow.

---

## 28. Lampiran A — Akun Demo & Env

### Akun demo (seed)

```
Admin    — email: admin@example.com    — password: Admin123!    — status: active
Officer  — email: officer@example.com  — password: Officer123!  — status: active
User     — email: user@example.com     — password: User123!     — status: active
Pending  — email: pending@example.com  — password: User123!     — status: pending (untuk demo verifikasi)
```

> Ganti password sebelum deploy publik.

### .env.example

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campus_facility
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change-this-secret-min-32chars
JWT_EXPIRES_IN=7d
UPLOAD_DIR=public/uploads
MAX_UPLOAD_MB=5
```

### Cara jalan (untuk Word & README)

```bash
# 1) DB
mysql -u root -p -e "CREATE DATABASE campus_facility CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p campus_facility < database/schema.sql
mysql -u root -p campus_facility < database/seed.sql

# 2) Backend
cp .env.example .env
npm install
npm run dev        # http://localhost:5000

# 3) Frontend
cd client
npm install
npm run dev        # http://localhost:5173
```

---

## 29. Lampiran B — Seed & Contoh Data

- 8–12 fasilitas: 3 kelas, 2 aula, 2 lab, 2 lapangan, 1 alat (kapasitas bervariasi, lokasi: Gedung A/B/C, Lapangan).
- 5 kategori laporan seed.
- 10+ reservasi seed (campur pending/approved) untuk demo konflik & rekap.
- 5+ laporan seed (new/in_progress/resolved).

---

## 30. Lampiran C — Daftar Keputusan yang Sudah Dikunci

- Stack: React.js + Vite + Express + MySQL (React tidak langsung ke MySQL).
- Registrasi mandiri pengguna: **ya** (pending → verifikasi admin).
- Export rekap: **PDF saja** untuk MVP (sesuai instruksi).
- Anggota: **placeholder** (nama/NIM diisi belakangan).
- Template Word: **tidak ada** dari dosen — pakai struktur §27.
- Zona waktu: Asia/Jakarta. Jam operasional 07.00–20.00, slot 30 menit, validasi server otoritatif.

---

**Dokumen ini adalah sumber kebenaran untuk pengerjaan.** Perubahan keputusan wajib dicatat di §30 dan diumumkan di grup + PR description. Selanjutnya: buat repo, proteksi `main`/`develop`, buat branch sesuai §21, dan mulai eksekusi minggu 1.
