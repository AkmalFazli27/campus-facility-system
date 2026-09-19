# Desain Login + Register (`/login`, `/register`) — KampusSpace

- **Tanggal:** 2026-09-16
- **Status:** Disetujui pemilik (pendekatan shared-slider + 2 route, tanpa NIM, tanpa demo switcher, adaptasi DESIGN.md)
- **Sumber kebenaran:** `docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md` (§4, §7.6, §8 US15, §13, §14–§17, §28), `DESIGN.md`, `PRODUCT.md`
- **Referensi visual (inspirasi saja):** `docs/login-register-ref.html` (animasi dual-slider + overlay)
- **Keputusan terkunci terkait:** grill 2026-09-16 — shared slider dipakai 2 route; field NIM/NIP di-drop; demo quick switcher dihapus total; styling ikut DESIGN.md (Geist + lucide + token brand)
- **Perubahan 2026-09-19:** identitas dibutuhkan untuk verifikasi US15; hak tetap USER.

Saat referensi bertentangan dengan PRD, PRD menang. Saat bertentangan dengan `DESIGN.md`, `DESIGN.md` menang.

## 1. Tujuan & alur

Halaman auth adalah pintu masuk civitas (PRD §11: login → reservasi/lapor; §15: `/login`, `/register`, `/pending-verification`). Satu tugas: pengguna login/No? — login yang sudah `active` masuk, pendaftar baru diarahkan ke `/pending-verification` (US15: `pending` tidak bisa login sampai `active`).

Alur:

1. Pengunjung tanpa login klik Masuk/Daftar (atau `proxy.ts` redirect ke `/login?next=<tujuan>`).
2. Mode sign-in: isi email + sandi → sukses redirect ke `next` (aman) atau `/`; akun `pending` ditolak 403 dengan arahan ke `/pending-verification`.
3. Mode sign-up: isi nama + email + sandi + konfirmasi + centang ketentuan → sukses 201 (`account_status=pending`) → `/pending-verification`.
4. Toggle Masuk ⇄ Daftar menganimasikan slider 0.65s dan memperbarui URL tanpa remount.

## 2. Keputusan desain (hasil grill, mengikat)

| Topik | Keputusan | Alasan |
|---|---|---|
| Struktur route | Satu komponen `AuthShell` dipakai `/login` (`initialMode=sign-in`) dan `/register` (`initialMode=sign-up`); toggle update URL via `history.replaceState` | Deep-link, `?next=` proxy, dan IA PRD §14–15 tetap jalan; animasi tidak terputus remount |
| NIM/NIP | Wajib per tipe (MAHASISWA 9-16, DOSEN wajib 18, TENDIK opsional-bila-diisi 18, alfanumerik) | Identitas dibutuhkan untuk verifikasi US15; hak tetap USER |
| Demo quick switcher | Hapus total | Password hardcoded di client membocorkan kredensial; seed §28 tetap untuk demo manual |
| Font & ikon | Geist (existing) + `lucide-react`; tanpa Newsreader/Material Symbols | `DESIGN.md` melarang Newsreader sebagai font runtime; `components.json` mengunci `iconLibrary: lucide` |
| Warna | Token existing `--brand-500/600/700`, `ink-*`, `surface`, `success/warning/danger` | Gradien referensi `#F97316→#EA580C→#C2410C` sudah sama dengan token; tanpa `tailwind.config.js` (Tailwind v4 CSS-first) |
| Klaim terlarang | Hapus badge `SSO Terpadu`, link `Lupa Sandi?`, checkbox `Ingat sesi`, klaim `SLA real-time`/`Terenkripsi` | SSO & lupa-sandi out of scope PRD §5; cookie httpOnly 7 hari fixed di server sehingga checkbox tidak punya efek |
| Animasi | Port 1:1 durasi+easing referensi (`0.65s cubic-bezier(0.76,0,0.24,1)`, class `right-panel-active`), di-scope `.auth-slider`, plus `prefers-reduced-motion` | Animasi adalah inti permintaan; scoping mencegah bocor ke halaman lain |
| Redirect sukses | Tetap `next` (aman) → `/`; belum role-based | Minim scope; role-based (`admin→/admin/recap` dst.) dicatat sebagai follow-up |
| API | Sertakan `userType` + `identityNumber` di register/login/me/admin | Login/me mengembalikan identitas agar UI tahu dosen/mahasiswa; kontrak §13 diperluas, rate-limit + RBAC tetap |

## 3. Isi halaman

### 3.1 Kerangka `AuthShell` (kedua route)

- Kanvas `bg-canvas-public` + glow dekoratif (`brand-500/20`, blur-3xl, `aria-hidden`).
- Kartu `max-w-[940px] min-h-[640px] bg-surface rounded-3xl border shadow-xl overflow-hidden`, `flex-col` di mobile, `md:block` + 2 form absolute `md:w-1/2` di desktop.
- Klasse `right-panel-active` bila mode sign-up.
- Mobile (`<md`): overlay disembunyikan; hanya 1 form tampil + link toggle teks di bawah form.
- Header tiap form: wordmark `Kampus` (`ink-950`) + `Space` (`brand-500`) link `/`, + badge (`Portal civitas` / `Registrasi baru`).
- Footer trust (tanpa klaim palsu): `ShieldCheck Validasi server`, `Users RBAC terpadu`, `Clock Slot 07.00–20.00`.

### 3.2 Form sign-in

- Field: Email institusi (`Mail`), Kata sandi (`Lock` + tombol `Eye`/`EyeOff` ber-`aria-label`).
- Copy: H1 `Selamat datang kembali`, sub `Portal reservasi ruangan, fasilitas, dan pelaporan insiden.`
- Validasi client via `loginSchema` (inline per field); server otoritatif tetap.
- Loading `Memverifikasi...` + `disabled`; error 401/403/429 dipetakan ke pesan Indonesia; 403 pending menampilkan panel peringatan + link `/pending-verification`.
- Sukses: toast + `router.push(next aman)` + `router.refresh()`.

### 3.3 Form sign-up

- Field: Nama lengkap (`User`), Email institusi (`Mail`), Tipe civitas (Mahasiswa/Dosen/Tendik) + Nomor identitas NIM/NIP, Kata sandi + Konfirmasi (`Lock`, masing-masing show/hide), checkbox ketentuan (`required`).
- Banner US15 (`warning` token): `Akun registrasi mandiri berstatus pending dan memerlukan validasi admin sebelum hak peminjaman aktif.`
- Copy: H2 `Daftar akun civitas`, sub `Pengajuan akses portal reservasi ruangan dan fasilitas kampus.`
- Validasi client via `registerClientSchema` (= `registerSchema` + `confirmPassword` cocok + `agreeTerms=true`); yang dikirim ke API `{name,email,password,userType,identityNumber}`.
- Sukses 201: toast + `router.push('/pending-verification')`; 409: error inline di email atau nomor identitas.

### 3.4 Overlay (desktop saja)

- Gradien `from-brand-500 via-brand-600 to-brand-700`, motif radial dots + 2 blur circle (`aria-hidden`).
- Kanan (mode sign-in): ikon `GraduationCap`, `Halo, civitas akademika!`, CTA `Daftar akun baru` (`ArrowRight`).
- Kiri (mode sign-up): ikon `LockOpen`, `Sudah punya akun kampus?`, CTA `Masuk ke portal` (`ArrowLeft`).
- Tombol `border-white/90 hover:bg-white hover:text-brand-700 active:scale-95`, `pointer-events-auto`.

## 4. Komponen (`components/custom/auth/`)

`AuthShell` (state mode + URL sync + layout + footer), `SignInForm`, `SignUpForm`, `OverlayPanel`. Aturan: satu tanggung jawab per file; komponen domain tidak menyentuh DB; halaman (`app/(auth)/*/page.tsx`) hanya wrapper Server Component.

## 5. Data flow & state

- Server: `login/page.tsx` baca `searchParams.next` → oper ke `AuthShell`; `register/page.tsx` tanpa param.
- Client: `mode` lokal; toggle → `setMode` + `history.replaceState(buildAuthToggleHref(...))` (pertahankan `?next=` saat kembali ke `/login`).
- Mutasi: `fetch /api/auth/login|register` (JSON); cookie httpOnly di-set server; tidak ada token di localStorage.
- State wajib: loading per tombol, empty tidak ada (form selalu terisi penuh), error inline + toast + panel khusus pending, sukses toast + redirect.

## 6. Pengujian penerimaan

- Slide dua arah mulus 0.65s desktop; refresh di `/register` tetap sign-up; back/forward tidak merusak state.
- Mobile 360px: 1 form + toggle link, overlay hilang, tanpa overflow.
- Validasi: email salah, sandi <8/huruf saja, konfirmasi beda, terms kosong → inline error; bypass client via curl tetap 4xx dari server.
- `pending@example.com` login → 403 + arahan `/pending-verification`; register duplikat → 409.
- `typecheck`, `lint`, `build` hijau; tidak ada string `SSO`, `KampusSecure2025`, `Newsreader`, `material-symbols`, `Lupa Sandi` di diff.
- Aksesibilitas: label tiap input, `aria-label` toggle sandi, focus ring, target ≥44px, `prefers-reduced-motion` mematikan slide, kontras AA.

## 7. Di luar lingkup

Lupa sandi, ingat-saya, SSO, perubahan API/auth/cookie, redirect role-based, pemisahan public/application shell penuh.
