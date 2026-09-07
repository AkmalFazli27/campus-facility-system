# Catatan Mapping `views/` (ketentuan tugas)

Ketentuan tugas mewajibkan folder `/views`. Pada arsitektur Next.js App Router,
"views" diwujudkan sebagai `app/**/page.tsx` + `components/`:

| Konsep tugas | Lokasi Next.js |
|---|---|
| Tampilan (HTML) | `app/**/page.tsx`, `components/ui/*`, `components/custom/*` |
| Template email | `views/emails/` (di folder ini) |

Folder ini dipertahankan agar pemeriksaan literal
`/public`, `/app`, `/views`, `/config` terpenuhi.
