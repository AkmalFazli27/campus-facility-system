# Folder `database/`

Sumber kebenaran skema adalah `prisma/schema.prisma`, dan riwayat SQL berversi
ada di `prisma/migrations/` (wajib di-commit).

Saat rilis (`v1.0-uts`), salin file `.sql` yang dibutuhkan dari
`prisma/migrations/` ke arsip Drive sesuai PRD §27 (tidak perlu menduplikasinya
di folder ini selama pengembangan).
