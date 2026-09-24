# Pembagian Tugas 4 Orang — Sistem Reservasi & Pelaporan Fasilitas Kampus

> Stack: Next.js 16 (App Router, fullstack) + MySQL via Prisma 6 | Export: PDF | Registrasi mandiri: ya | Anggota: placeholder
> Sumber kebenaran: `docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md`

---

## 1. Prinsip Pembagian

- Setiap anggota **wajib punya commit bermakna** (aturan tugas).
- Pembagian **vertikal per fitur** (bukan horizontal layer) agar tiap orang bisa demo end-to-end.
- Review **silang** agar semua paham sistem orang lain.
- PR kecil (<300 baris), integrasi ke `develop` **2×/minggu**.

---

## 2. Matriks Tanggung Jawab

| Area | A1 — Tech Lead + Auth | A2 — Fasilitas | A3 — Reservasi + Dashboard User | A4 — Laporan, Rekap + Dashboard Officer/Admin |
|---|---|---|---|---|
| **User story** | US13–US15 (sebagian), fondasi semua US | US01, US02, US12, US16 | US03–US05, US08–US10 (FR-DASH-02) | US06–US08, US11–US12, US17 (FR-DASH-01, FR-DASH-03) |
| **Dashboard (`/dashboard`)** | Kontrak: `page.tsx` guard + `DashboardSidebar.tsx` + matcher `proxy.ts` | Widget *Kelola Fasilitas* di `AdminDashboard.tsx` | `UserDashboard.tsx` | `OfficerDashboard.tsx` + widget *Rekap* di `AdminDashboard.tsx` |
| **Branch** | `feature/setup`, `feature/auth` | `feature/facilities`, `feature/availability` | `feature/reservations`, `feature/dashboard-user` | `feature/reports`, `feature/recap-pdf`, `feature/dashboard-officer`, `docs/submission` |
| **Reviewer** | mereview A4 | mereview A1 | mereview A2 | mereview A3 |
| **File utama** | `config/*`, `proxy.ts`, `lib/db.ts`, `lib/auth.ts`, `lib/utils.ts`, `app/api/auth/**`, `app/globals.css`, `components.json`, `components/ui/**`, `prisma/**`, `.env.example`, **`app/dashboard/page.tsx`, `app/dashboard/_components/DashboardSidebar.tsx`** | `app/api/facilities/**`, `app/**/facilities/**`, **`app/dashboard/_components/AdminDashboard.tsx` (widget Kelola)** | `app/api/**/reservations/**`, `app/**/reservations/**`, `lib/services/reservationService.ts`, **`app/dashboard/_components/UserDashboard.tsx`** | `app/api/**/reports/**`, `lib/services/pdf*.ts`, `docs/*`, **`app/dashboard/_components/OfficerDashboard.tsx`, `AdminDashboard.tsx` (widget Rekap)** |

> **Kontrak shell dashboard (mitigasi "bagi per role lepas"):** isi per role dikerjakan lepas (A3 user, A4 officer, A2+A4 admin), tetapi **A1 mengunci 1 file kontrak** `DashboardSidebar.tsx` (prop `role` → filter render ketat) + `app/dashboard/page.tsx` (guard ganda `proxy.ts` + `getSessionUser()`, switch per role). Ini mencegah 3 sidebar beda gaya & bocor RBAC. Detail: PRD §4.1.

---

## 3. Rincian Tugas Tiap Anggota

### A1 — Anggota 1: Tech Lead + Auth (penjaga `develop`)

**Minggu 1**
- [ ] Inisiasi repo GitHub/GitLab, proteksi `main` & `develop`, buat `.github/CODEOWNERS` & PR template.
- [ ] Buat struktur folder Next.js: `app/` (pages + `api/`), `components/`, `lib/`, plus folder literal wajib: `/public`, `/config`, `/views` (+ `views/CATATAN-MAPPING.md`).
- [ ] Setup Next.js (`create-next-app`, TypeScript, ESLint), Prisma (`schema.prisma`, `migrate dev`, `seed.ts`), `lib/db.ts`, `config/env.ts`, `.env.example`, `.gitignore`, `proxy.ts` (kerangka).
- [ ] Setup Tailwind v4 (`tailwindcss` + `@tailwindcss/postcss`, `postcss.config.mjs`, `app/globals.css`, impor di root layout).
- [ ] Setup shadcn (`components.json`: preset base-nova/neutral/css-variables, `lib/utils.ts` berisi `cn()`), install komponen awal: button, card, badge, input, label, textarea, select, dialog, table, tabs, calendar, popover, skeleton, sonner. Verifikasi `npm run build` hijau.
- [ ] Setup layout dasar + halaman publik, helper fetch ke `/api/*`.
- [ ] Tulis ERD & `prisma/schema.prisma` untuk model `User` (kolaborasi dengan A2–A4 untuk model lain), lalu `migrate dev`.

**Minggu 2**
- [ ] `POST /api/auth/register` → `pending`, `POST /api/auth/login` (bcryptjs + JWT httpOnly via `jose`), `POST /api/auth/logout`, `GET /api/auth/me` (semua Route Handler `runtime = 'nodejs'`).
- [ ] `proxy.ts` `authenticate` + `authorize(role)`, error handling + validasi `zod` di Route Handler.
- [ ] Halaman `/login`, `/register`, `/pending-verification`, guard route per role (Server Component + middleware).
- [ ] `prisma/seed.ts` + `npm run db:seed`: admin, officer, user, pending.
- [ ] `POST /api/admin/users`, `PATCH /api/admin/users/:id/verify|reject` (bersama A4, tapi A1 pemilik kontrak).

**Minggu 3–6**
- [ ] **Kontrak dashboard (PRD §4.1):** `app/dashboard/page.tsx` (guard ganda: `proxy.ts` matcher `/dashboard/:path*` + `getSessionUser()`; `null`/`pending`/`rejected`/`inactive` → redirect `/login?next=/dashboard`; switch per `role`) + `app/dashboard/_components/DashboardSidebar.tsx` (prop `role` → render ketat section per role: user / officer / admin). Buat skeleton komponen kosong `UserDashboard`/`OfficerDashboard`/`AdminDashboard` agar A2–A4 tinggal isi.
- [ ] Jaga `develop` tetap hijau, selesaikan konflik, bantu unblock A2–A4.
- [ ] Tambah `audit_logs` bila sempat (Should).

**Deliverable A1:** repo rapi, Tailwind + shadcn jalan, auth jalan, RBAC jalan, seed & env lengkap.

> Aturan komponen UI: `components/ui/*` milik A1 — anggota lain dilarang edit manual. Butuh komponen baru di luar daftar awal → tambah via `npx shadcn@latest add <nama>` dalam PR kecil dan catat di PR description.

### A2 — Anggota 2: Fasilitas & Ketersediaan

**Minggu 1–2**
- [ ] Finalisasi skema `facilities` bersama A1.

**Minggu 3**
- [ ] `GET /api/facilities` + filter `type, location, capacity_min/max, date` (Route Handler).
- [ ] `GET /api/facilities/:id`, `POST /api/facilities`, `PUT /api/facilities/:id`, `PATCH /api/facilities/:id/status` (admin).
- [ ] Halaman `/facilities` (tanpa login, Server Component) + filter + empty state.
- [ ] Halaman `/facilities/[id]` + detail.

**Minggu 3–4**
- [ ] `GET /api/facilities/[id]/availability?date=YYYY-MM-DD` → slot 07.00–20.00 per 30 menit, tandai `available/reason`.
- [ ] Grid slot di detail fasilitas, badge `active/inactive/under_maintenance`.
- [ ] Halaman admin `/admin/facilities` (CRUD).

**Dependensi:** butuh `users` & auth (`proxy.ts`) dari A1. Bisa mulai dengan mock session dulu.

**Minggu 5–6 (bersama A4)**
- [ ] Widget *Kelola Fasilitas* di `app/dashboard/_components/AdminDashboard.tsx`: shortcut CRUD (`/admin/facilities`), badge `active/inactive/under_maintenance` — kolaborasi dengan A4 (A4 punya skeleton, A2 isi bagian ini).

### A3 — Anggota 3: Reservasi (inti aturan bisnis)

**Minggu 4**
- [ ] `POST /api/reservations` — validasi `reservation_date, start_time, end_time, purpose` + `validateSlot()` + `withinOperatingHours()` + cek `facility.status`.
- [ ] Halaman form reservasi di `/facilities/[id]` (Client Component validation + proof via Route Handler).
- [ ] `GET /api/reservations/my` + filter, `GET /api/reservations/[id]` (owner guard).

**Minggu 4–5**
- [ ] `PATCH /api/reservations/[id]/cancel` (owner, sebelum start_time).
- [ ] `GET /api/officer/reservations` (antrian petugas).
- [ ] `PATCH /api/officer/reservations/[id]/approve` — transaksi + `checkConflict()` → 409 jika bentrok.
- [ ] `PATCH /api/officer/reservations/[id]/reject` & `.../cancel` (wajib alasan).
- [ ] Halaman `/reservations` (user) & `/officer/queue` tab Reservasi.

**Minggu 5 (setelah kontrak sidebar A1 siap)**
- [ ] `UserDashboard.tsx` (role `user`): banner sapaan (NIM/prodi), 4 kartu metrik (Reservasi Aktif, Menunggu Persetujuan, Laporan Kerusakan, Riwayat Selesai), *Jadwal Peminjaman Terdekat* + modal batal, *Status Laporan Terkini*, quick action *Pesan Ruang Baru*/*Laporkan Kerusakan* — reuse query `GET /reservations/my`, `GET /reports/my` (FR-DASH-02).

**Aturan emas:** semua validasi slot & konflik di `lib/services/reservationService.ts` — dipakai create **dan** approve.

### A4 — Anggota 4: Laporan, Rekap PDF & Rilis

**Minggu 5**
- [ ] `POST /api/reports` (`request.formData()`, 1 foto, 5MB, mime whitelist, simpan ke `public/uploads`) + `GET /api/reports/my`, `GET /api/reports/[id]`.
- [ ] Halaman form laporan + list laporan user.
- [ ] `GET /api/officer/reports`, `PATCH /api/officer/reports/[id]/status` (new→in_progress→resolved/rejected, resolved wajib notes).
- [ ] `PATCH /api/officer/facilities/[id]/maintenance` (under_maintenance ↔ active) — kolaborasi dengan A2.
- [ ] Halaman `/officer/queue` tab Laporan + detail.

**Minggu 5–6 (setelah kontrak sidebar A1 siap)**
- [ ] `OfficerDashboard.tsx` (role `officer`): counter antrian (`pending` reservasi + `new` laporan), tabel antrean + aksi approve/reject/cancel & proses laporan + tandai maintenance (FR-DASH-01).
- [ ] Widget *Rekap* di `app/dashboard/_components/AdminDashboard.tsx` (bersama A2): preview tabel okupansi & kerusakan + **tombol Export PDF** langsung dari dashboard (reuse `pdfService.ts`, FR-DASH-03).

**Minggu 5–6**
- [ ] `GET /api/admin/recap/occupancy` & `.../damage` + query `from/to/facility_id/location`.
- [ ] `GET .../export` → PDF via `pdfkit` di `lib/services/pdfService.ts` (`runtime = 'nodejs'`, header, tabel, footer halaman).
- [ ] Halaman `/admin/recap` + tombol Export PDF.

**Minggu 6–7**
- [ ] Kumpulkan screenshot tiap fitur (US01–US17) + tulis **file Word** pengumpulan.
- [ ] Siapkan materi demo 10 menit + simulasi tanya jawab.
- [ ] Siapkan zip Drive: source + SQL dari `prisma/migrations/` + README.

---

## 4. Timeline Mingguan (Gantt teks)

```
M1  Setup & ERD        A1 ████████  A2 ████  A3 ░░░░  A4 ░░░░
M2  Auth & Seed        A1 ████████  A2 ████  A3 ░░░░  A4 ██
M3  Fasilitas          A1 ██        A2 ████████  A3 ████  A4 ██
M4  Reservasi          A1 ████      A2 ████  A3 ████████  A4 ████
M5  Laporan&Rekap+Dash A1 ████      A2 ████  A3 ██████  A4 ████████
M6  Integrasi          A1 ████  A2 ████  A3 ████  A4 ████
M7  Dokumen & Rilis    A1 ██    A2 ██    A3 ██    A4 ████████
```

Checkpoint merge ke `develop`: Jumat sore tiap minggu. Tag: `v0.1-auth`, `v0.2-facilities`, `v0.3-reservations`, `v0.4-reports`, `v1.0-uts`.

---

## 5. Alur Harian Tiap Orang

```text
Pagi:  git switch develop && git pull origin develop
       git switch <feature-branch> && git merge develop
Siang: kerjakan 1 task, commit 1 tujuan, push
Sore:  buka PR jika siap, review PR orang lain (maks 24 jam)
```

Aturan:
- 1 commit = 1 tujuan, pesan `feat:/fix:/docs:` (lihat `GIT-WORKFLOW.md`).
- Push minimal 1×/hari (agar terlihat aktif).
- Jangan campur banyak fitur dalam 1 PR.

---

## 6. Cara Menjamin 4 Anggota Punya Commit

- Audit sebelum kumpul: `git shortlog -sne --no-merges` harus menampilkan 4 nama.
- PR tanpa kontribusi nyata ditolak reviewer.
- Commit dummy ("update", "fix") ditolak — harus deskriptif.

---

## 7. Checklist Serah Terima Antar Anggota

- [ ] A1 → A2/A3/A4: kontrak `app/dashboard/page.tsx` (guard) + `DashboardSidebar.tsx` (filter role) + matcher `proxy.ts` — **wajib sebelum isi dashboard role masing-masing**.
- [ ] A1 → A2: `users` table, `proxy.ts` auth, seed — agar A2 bisa guard halaman.
- [ ] A2 → A3: `GET /api/facilities/[id]/availability` — agar form reservasi bisa cek slot.
- [ ] A2 → A4: `facilities` CRUD — agar laporan bisa pilih fasilitas.
- [ ] A3 → A4: `officer queue` tab reservasi — agar A4 bisa tambah tab laporan di halaman yang sama.
- [ ] A4 → A2: skeleton `AdminDashboard.tsx` — agar A2 isi widget *Kelola Fasilitas* bersamaan dengan A4 isi widget *Rekap*.
- [ ] Semua → A4: screenshot (termasuk `/dashboard` per role) & data seed untuk Word.

---

## 8. Jika Anggota Berhalangan

- Branch tidak boleh “terkunci” 1 orang — minimal 1 orang lain bisa lanjutkan (jaga PR tetap kecil & deskriptif).
- Tech Lead (A1) adalah fallback untuk unblock.

---

*Ganti placeholder Anggota 1–4 dengan nama & NIM sebelum mengisi Word pengumpulan. Perbarui branch owner di `CODEOWNERS` saat nama sudah final.*
