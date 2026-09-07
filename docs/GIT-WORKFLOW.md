# Git Workflow — Sistem Reservasi & Pelaporan Fasilitas Kampus

> Repo: GitHub/GitLab (wajib) | Tim: 4 orang | Cabang proteksi: `main`, `develop`
> Pendamping: `docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md` + `docs/PEMBAGIAN-TUGAS-4-ORANG.md`

---

## 1. Aturan Emas

1. **Semua anggota wajib punya commit bermakna** (aturan tugas).
2. Tidak pernah commit langsung ke `main` atau `develop` — selalu via PR.
3. `main` = siap kumpul/demo. `develop` = integrasi harian (harus selalu bisa `npm run dev` di `:3000`).
4. PR kecil (<300 baris), 1 PR = 1 tujuan.
5. Pesan commit jelas, tidak ada `update`, `fix`, `coba`.

---

## 2. Cabang (Branches)

```
main                 ← rilis (protected, butuh PR dari develop + 1 approval)
develop              ← integrasi (protected, butuh PR + 1 approval)
feature/setup
feature/auth
feature/facilities
feature/availability
feature/reservations
feature/reports
feature/recap-pdf
fix/<nama-bug>
docs/submission
```

Buat branch dari `develop`, bukan dari `main`:

```bash
git switch develop
git pull origin develop
git switch -c feature/reservations
```

---

## 3. Alur Kerja Standar (tiap fitur)

```bash
# 0) sekali di awal (tiap anggota)
git clone <repo-url>
cd campus-facility-system
git switch develop
git pull origin develop

# 1) mulai fitur
git switch -c feature/facilities

# 2) kerja — commit kecil & deskriptif
git add -p
git commit -m "feat: add facility availability API per date"
git push -u origin feature/facilities

# 3) buka PR di GitHub: feature/facilities -> develop
#    isi template PR (tujuan, US, cara test, screenshot)

# 4) reviewer (maks 24 jam) memberi komentar -> pemilik perbaiki -> push lagi

# 5) setelah 1 approval + CI hijau -> Squash and Merge -> hapus branch
git switch develop
git pull origin develop
git branch -d feature/facilities
```

**Tiap hari:** `git switch develop && git pull && git switch <branch> && git merge develop` lalu push.

---

## 4. Konvensi Commit

Gunakan Conventional Commits ringan:

```
feat:     fitur baru
fix:      perbaikan bug
refactor: rapikan tanpa ubah perilaku
test:     tambah/perbaiki test
docs:     dokumentasi
chore:    tooling/config/dependency
style:    format
```

Contoh yang **benar**:

```
feat: add user registration flow (pending -> verify)
feat: validate reservation operating hours on server (07-20, 30min)
feat: add officer reservation queue
fix: prevent overlapping approved reservations on approve (409)
test: add reservation conflict tests
docs: add local setup instructions
chore: add report photo upload limits (5MB, jpeg/png/webp)
```

Contoh yang **ditolak reviewer**:

```
update
fix bug
coba
wip
```

---

## 5. Pull Request

### Template PR (buat `.github/pull_request_template.md`)

```markdown
## Tujuan
## User Story (USxx)
## Perubahan
## Cara test manual
## Screenshot / API proof
## Checklist
- [ ] Validasi client + server
- [ ] RBAC diuji
- [ ] Tidak ada secret di diff
- [ ] Migration/seed diperbarui bila perlu
```

### Review

| Pemilik | Reviewer |
|---|---|
| A1 (auth/setup) | A2 |
| A2 (facilities) | A3 |
| A3 (reservations) | A4 |
| A4 (reports/pdf) | A1 |

Reviewer cek: sesuai US, validasi ganda, RBAC, error handling, tidak ada password, test/bukti ada. Komentar harus ditindaklanjuti pemilik PR. Khusus UI: `components/ui/*` hanya boleh berubah via shadcn CLI (bukan edit manual) — PR yang edit manual ditolak.

Merge strategy: **Squash and Merge** (riwayat `develop`/`main` rapi). Jangan `Rebase and Merge` tanpa kesepakatan.

---

## 6. Proteksi Cabang (GitHub)

Settings → Branches → Add rule:

- `main`: Require PR, Require 1 approval, Require status checks (jika ada CI), Dismiss stale approvals, Do not allow bypass.
- `develop`: sama, tapi boleh `Allow force pushes: false`.

Semua anggota adalah collaborator dengan role `Write` (bukan `Admin` kecuali A1).

---

## 7. Menjamin 4 Anggota Punya Commit

```bash
# audit sebelum kumpul
git shortlog -sne --no-merges
git log --oneline --since="1 month ago" --no-merges | head -n 50
```

- Tiap anggota push minimal 1 commit/hari kerja.
- PR besar yang dikerjakan 1 orang tapi di-merge tanpa kontribusi lain **tidak dihitung** — pecah jadi PR kecil per orang.
- Commit harus di branch & PR masing-masing, bukan numpang commit di branch orang.

---

## 8. Rilis & Tag

```bash
# saat siap kumpul/demo (dari develop yang hijau)
git switch main
git merge develop
git tag -a v1.0-uts -m "UTS release 11 Okt 2026"
git push origin main --tags
```

Artefak Drive: zip `source/` + `database/schema.sql` + `database/seed.sql` + `README.md` + `.env.example` (tanpa `.env*`, tanpa `node_modules`, tanpa `.next/`, tanpa `public/uploads/*`).

Versioning: `v0.1-auth`, `v0.2-facilities`, `v0.3-reservations`, `v0.4-reports`, `v1.0-uts`.

---

## 9. .gitignore Minimal

```
node_modules/
.env*
!.env.example
public/uploads/*
!public/uploads/.gitkeep
.next/
out/
*.log
.DS_Store
```

---

## 10. CODEOWNERS (`.github/CODEOWNERS`)

```
*                           @A1
/app/api/*facility*         @A2
/app/**/facilities/**       @A2
/app/admin/facilities/**    @A2
/app/*reservation*          @A3
/app/**/reservations/**     @A3
/app/officer/queue/**       @A3 @A4
/components/ui/**           @A1
/app/*report*               @A4
/lib/services/pdf*          @A4
/config/                    @A1
/lib/db.ts                  @A1
/middleware.ts              @A1
/database/                  @A1
```

Ganti `@A1`–`@A4` dengan username GitHub/GitLab setelah final.

---

## 11. Darurat (Hotfix)

Jika bug ditemukan di `main` menjelang demo:

```bash
git switch -c fix/reservation-conflict-race main
# ... fix ...
git push -u origin fix/reservation-conflict-race
# PR: fix/... -> main (butuh 1 approval) + PR juga ke develop
```

Jangan `git push --force` ke `main`/`develop`.

---

## 12. Checklist Sebelum Kumpul (11 Okt 12.00 WIB)

- [ ] `git shortlog` menampilkan 4 anggota
- [ ] `develop` hijau, `main` = `develop`
- [ ] Tag `v1.0-uts` sudah push
- [ ] Word + Drive + README + akun demo siap (lihat PRD §27–§28)
