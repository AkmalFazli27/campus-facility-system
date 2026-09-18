# Desain Login Full-Page Split 50/50 — KampusSpace

- **Tanggal:** 2026-09-16
- **Status:** Disetujui pemilik (opsi A dari brainstorming visual, 2026-09-16)
- **Sumber kebenaran:** `docs/superpowers/specs/2026-09-16-login-register-design.md` (spesifikasi slider awal — tetap berlaku kecuali yang diubah di sini), `DESIGN.md`, PRD §14–15
- **Lingkup:** Perubahan murni presentasi pada `components/custom/auth/AuthShell.tsx` (+ CSS bila perlu). Tanpa perubahan API, validasi, redirect, copy teks form, maupun perilaku mobile.

## 1. Layout full-page (menggantikan kartu tengah)

- Kontainer `.auth-slider` menjadi full-viewport: `min-h-svh`, lebar penuh, tanpa `max-w-[940px]`, tanpa `rounded-3xl`, tanpa shadow kartu.
- Desktop (`md+`): separuh kiri panel form, separuh kanan panel orange (dan sebaliknya pada mode sign-up). Mekanik animasi tidak berubah — `translateX(100%)` pada form, `translateX(-100%)` + `translateX(50%)` pada overlay — hanya areanya selebar viewport.
- Isi form diratakan tengah vertikal; kolom teks dibatasi `max-w-[440px]` agar keterbacaan terjaga di layar lebar.
- Glow dekoratif di belakang kartu dihapus (tidak terlihat pada layout full-bleed).
- Mobile (`<md`): tidak berubah — satu form tampil + link toggle teks, overlay disembunyikan.

## 2. Susunan transisi (stacking)

- `.overlay-container` diberi `z-index` di atas kedua form (contoh: `z-20`; form aktif `z-[1..5]` seperti sekarang), sehingga selama 0,65 detik transisi hanya kotak orange yang terlihat meluncur — form tidak pernah menumpuk di atasnya.
- Form yang aktif tetap interaktif karena overlay hanya menutupi separuh layar; `pointer-events` mengikuti aturan yang sudah ada (form non-aktif `pointer-events: none`).

## 3. Penghapusan footer

- Footer trust-badge (`Validasi server`, `RBAC terpadu`, `Slot 07.00–20.00`) dihapus total dari `AuthShell`, termasuk konstanta `TRUST_BADGES` dan impor ikon `Clock`, `ShieldCheck`, `Users` yang tidak lagi dipakai.
- Tidak ada pengganti; ruang vertikal yang tersisa dipakai form agar tetap center.

## 4. Yang eksplisit TIDAK berubah

- `SignInForm`, `SignUpForm`, `OverlayPanel`, `lib/auth-ui.ts`, `lib/validations/auth.ts`, kedua `page.tsx`, API, cookie, `proxy.ts`, `?next=`, copy Bahasa Indonesia, banner US15, panel pending, skema warna, easing `0.65s cubic-bezier(0.76,0,0.24,1)`, `prefers-reduced-motion`, perilaku mobile.

## 5. Pengujian penerimaan

- Desktop ≥768px: tidak ada kartu mengambang; form dan panel orange masing-masing tepat separuh viewport; konten form center vertikal.
- Toggle dua arah: selama transisi hanya orange yang terlihat di area gerak; setelah selesai, form tujuan tampil penuh dan bisa diketik/diklik.
- Motif/scroll: form sign-up yang lebih tinggi tetap bisa scroll internal tanpa menggeser panel orange.
- Mobile 360px: tampilan dan toggle sama seperti sebelum perubahan.
- `npm run typecheck`, `npm run lint`, `npm test` hijau; tidak ada impor tak terpakai.
