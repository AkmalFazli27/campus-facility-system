# KampusSpace Design System

## Status and Scope

- **Status:** Approved visual direction, ready for implementation planning.
- **Product name:** KampusSpace, temporary until campus identity is confirmed.
- **Source of truth:** `docs/PRD-Sistem-Reservasi-Pelaporan-Fasilitas-Kampus.md`.
- **Visual reference:** `docs/landing-page-ref.html`, used for inspiration only.
- **Scope:** Landing, public facility catalog, authenticated user pages, officer queue, and admin pages.
- **Out of scope:** Final logo, campus branding, SSO, QR tickets, ratings, payments, external calendar integration, and native mobile screens.

The visual direction combines **Warm Civic** and **Operations First**:

- Public pages feel warm, approachable, and discovery-oriented.
- Authenticated workspaces are dense, scannable, and task-oriented.
- Availability slots connect both experiences and are the product's signature interaction.

## Product Principles

1. **Find first, act second.** Users understand availability before signing in or completing a form.
2. **Status is information.** Availability, reservation, report, account, and facility status are always understandable.
3. **One product, different density.** Public and operational layouts differ, but tokens, controls, status language, and wordmark remain shared.
4. **Server rules are reflected in UI.** Client validation improves UX but never replaces server validation.
5. **Every state has a next step.** Loading, empty, error, and success states explain what happened and what to do next.
6. **No invented promises.** Do not show SSO, QR tickets, ratings, instant approval, review counts, or response-time claims unless supported by the PRD and backend.

## Brand and Voice

### Wordmark

Use `KampusSpace` as a replaceable text wordmark. `Kampus` uses the primary ink color and `Space` uses brand orange. Do not depend on a campus seal or external image for the MVP.

### Copy

- Use Bahasa Indonesia throughout the product.
- Prefer direct, calm, helpful language.
- Use sentence case for headings and buttons.
- Use action-oriented titles: `Cari fasilitas`, `Reservasi saya`, and `Antrian petugas`.
- Avoid unsupported claims. Use `Reservasi berhasil diajukan. Menunggu persetujuan petugas.` rather than implying instant approval.

## Design Tokens

Define shared tokens in `app/globals.css` and consume semantic tokens through the existing Tailwind/shadcn CSS-variable setup.

### Colors

| Token | Value | Usage |
|---|---|---|
| `brand-50` | `#FFF7ED` | Warm highlights and selected public surfaces |
| `brand-100` | `#FFEDD5` | Soft borders and icon backgrounds |
| `brand-500` | `#F97316` | Primary CTA, active navigation, selected slot |
| `brand-600` | `#EA580C` | Hover and strong brand text |
| `brand-700` | `#C2410C` | High-contrast brand text |
| `ink-950` | `#172033` | Headings and primary text |
| `ink-600` | `#475569` | Body text |
| `ink-400` | `#94A3B8` | Metadata, placeholders, disabled copy |
| `canvas-public` | `#FAFAF7` | Public background |
| `canvas-app` | `#F8FAFC` | Authenticated workspace background |
| `surface` | `#FFFFFF` | Cards, panels, dialogs, inputs |
| `success` | `#16A34A` | Available, active, resolved |
| `warning` | `#D97706` | Pending, limited, in progress |
| `danger` | `#DC2626` | Rejected, unavailable, destructive error |
| `info` | `#0284C7` | New and neutral information |

Status always includes a text label and, where useful, an icon or shape. Color alone must not communicate critical state.

| Domain state | Visual meaning |
|---|---|
| `active`, `available` | Success |
| `pending` | Warning |
| `approved` | Info or success |
| `rejected` | Danger |
| `under_maintenance` | Warning with maintenance icon |
| `inactive` | Neutral/slate |
| `new` | Info |
| `in_progress` | Warning |
| `resolved` | Success |

### Typography

Use the existing Geist Sans and Geist Mono setup from `app/layout.tsx`. Do not introduce Newsreader as a required runtime font; the reference's editorial feeling comes from hierarchy and spacing.

| Style | Size / line height | Usage |
|---|---|---|
| Display | `56 / 64px` | Desktop landing hero |
| H1 | `36 / 44px` | Primary page title |
| H2 | `28 / 36px` | Major section title |
| H3 | `20 / 28px` | Card and panel title |
| Body large | `16 / 26px` | Lead text and public explanations |
| Body | `14 / 22px` | Application content and tables |
| Caption | `12 / 18px` | Metadata and helper text |
| Overline | `11 / 16px` | Short context labels |
| Mono | `12-14px` | IDs, times, and technical data |

### Spacing, radius, and elevation

Use a 4px base scale: `4` icon gap, `8` compact gap, `12` input/badge padding, `16` card padding, `24` group gap, `32` panel padding, `48` section gap, and `64+` hero spacing.

- Inputs and buttons: `10px` radius.
- Application cards: `14px` radius.
- Public cards: `20-24px` radius.
- Hero panels: `28-32px` radius.
- Badges: `9999px` radius.
- Dialogs: `20px` radius.
- Prefer borders over shadows. Use warm hover shadows on public cards and medium neutral shadows for dialogs/popovers.

## Layout Shells

### Public shell

Used by `/`, `/facilities`, and `/facilities/[id]`.

- Maximum content width: `1200px`.
- Horizontal padding: `16px` mobile, `24px` tablet, `32px` desktop.
- Landing header may be floating and rounded; catalog header is simpler and persistent.
- Warm canvas, subtle gradients, rounded cards, and facility imagery are allowed.
- Primary CTAs: `Lihat fasilitas` and `Cek ketersediaan`.

### Application shell

Used by user, officer, and admin routes.

- Desktop sidebar: `240-256px`.
- Topbar: `64px`.
- Main content max width: `1280px`.
- Workspace background: `canvas-app`.
- Tablet may collapse the sidebar to an icon rail.
- Mobile uses a drawer and topbar with menu trigger, page title, and account menu.

| Role | Navigation |
|---|---|
| User | Cari fasilitas, Reservasi saya, Laporan saya |
| Officer | Antrian, Reservasi, Laporan, Fasilitas dalam perbaikan |
| Admin | Ringkasan, Fasilitas, Pengguna, Rekap |

## Component Architecture

- `components/ui`: shadcn primitives and accessible low-level controls.
- `components/custom`: reusable KampusSpace domain components.
- `app/**/page.tsx`: page composition and data loading, not duplicated visual patterns.

Recommended custom components:

- `AppShell`, `PublicHeader`, `PageHeader`
- `StatusBadge`, `MetricCard`, `ConfirmDialog`
- `FacilityCard`, `FacilityFilters`, `AvailabilityGrid`
- `ReservationForm`, `ReservationCard`, `ReservationTable`
- `ReportForm`, `ReportCard`, `ReportTable`
- `QueueItem`, `DataTableToolbar`

Each component has one clear responsibility and accepts semantic data/status props. Domain components must not reach into unrelated database concerns.

## Page Patterns

### `/`

Public header, practical hero, quick availability search, benefit summary, facility preview, reservation/report workflow cards, how-it-works section, final CTA, and footer. Do not include unsupported SSO, QR, rating, or instant-approval claims.

### `/facilities`

Page header `Cari fasilitas`; filters for type, location, capacity, and date; facility grid on desktop and stacked cards on mobile; availability visible without login; empty state offers filter reset.

### `/facilities/[id]`

Breadcrumb, facility summary, type/location/capacity/description/status, maintenance banner when relevant, date selector, `AvailabilityGrid`, and actions `Ajukan reservasi` and `Laporkan masalah`. Unauthenticated users see a login prompt at the action point.

### `/reservations`

Header `Reservasi saya`, status summary, status filter, desktop table/mobile cards, permission-aware detail and cancel actions. Cancel is shown only for the owner before `start_time` and permitted statuses.

### `/reports`

Header `Laporan saya`, CTA `Buat laporan`, status filter, list with facility/category/date/status, and detail timeline with resolution notes when resolved.

### `/officer/queue`

Header `Antrian petugas`, counters, tabs `Reservasi` and `Laporan`, default actionable items, detail panel/dialog, required reasons for reject/cancel, and messaging that approval conflict validation happens server-side.

### `/admin/facilities`

Header `Kelola fasilitas`, add CTA, status/type filters, desktop table/mobile cards, create/edit dialog, and confirmation for deactivation while preserving history.

### `/admin/users`

Header `Kelola pengguna`, pending/active/inactive tabs, create user/officer CTA, verify/reject/deactivate actions, and visible role/account status.

### `/admin/recap`

Header `Rekap fasilitas`, period/facility/location/category filters, occupancy/damage tabs, preview table, Export PDF CTA, and visible active filters.

## AvailabilityGrid

This is KampusSpace's signature interaction.

- Generate fixed 30-minute slots from `07:00` through `20:00`.
- Available: light success surface, success border, label `Tersedia`.
- Occupied: muted surface, label `Tidak tersedia`.
- Maintenance/inactive: disable the complete grid and show a banner.
- Selected range: 2px brand border and visible focus ring.
- Mobile may scroll horizontally; date, legend, and selection summary remain visible.
- Public availability never reveals requester name or purpose.
- Form order is always facility, date, start time, end time, purpose.

## State Patterns

### Loading

Use geometry-preserving skeletons. Mutation buttons show `Menyimpan...`, `Memproses...`, or `Mengunduh...`. Avoid a full-page spinner when only one panel loads.

### Empty

Explain the condition and offer a next action: `Belum ada reservasi` with `Cari fasilitas`, `Belum ada laporan` with `Buat laporan`, and `Tidak ada fasilitas yang cocok` with `Reset filter`. Empty is not error.

### Error

Page errors include title, safe explanation, and `Coba lagi`. Form errors appear beside fields. Business messages include `Slot ini baru saja digunakan. Pilih slot lain.`, `Fasilitas sedang dalam perbaikan.`, and `Anda tidak memiliki akses untuk melakukan tindakan ini.` Critical errors must not exist only in a toast.

### Success

Show a toast for lightweight confirmation, update the visible list/detail, and show a result summary for important submissions. Example: `Reservasi berhasil diajukan` and `Menunggu persetujuan`.

## Critical Interaction Flows

### Reservation

Select facility, date, 30-minute range, and purpose; show a summary; submit; server revalidates time, facility status, and conflict rules; show `pending` result and link to `Reservasi saya`.

### User cancellation

Open an owned reservation; show cancel only when allowed; confirm consequences; server checks ownership and `start_time`; update to `cancelled_by_user`.

### Officer approval

Open pending item; review facility/date/time/purpose; select `Setujui`; server checks conflict; keep context visible on conflict; update to `approved` on success.

### Damage report

Select facility and category; enter description; upload one photo; client validates for feedback; server validates MIME and max 5 MB; create as `new`; show status timeline.

## Responsive and Accessibility Rules

- Preserve important information on mobile.
- Convert complex tables to cards or stacked rows.
- Keep primary actions sticky on long mobile forms when useful.
- Minimum touch target: `44px`.
- Every input has a visible label and every dialog has title, description, close behavior, and Escape support.
- Focus rings remain visible.
- Status uses text plus color/icon/shape.
- Decorative icons use `aria-hidden`; functional icons have accessible labels.
- Maintain WCAG AA contrast.

## Implementation Guardrails

- Add shared tokens before page-specific styling.
- Reuse existing UI primitives and follow the repository process for new shadcn components.
- Keep public and application shells separate but share buttons, inputs, typography, status badges, and wordmark.
- Keep status values aligned with PRD enums; do not invent backend behavior through UI labels.
- Use the real operating hours `07:00-20:00` and 30-minute slots in all examples.
- When the reference conflicts with the PRD, the PRD wins.

## Acceptance Checklist

- [ ] One replaceable KampusSpace wordmark is used everywhere.
- [ ] Public pages follow Warm Civic rules.
- [ ] Authenticated pages follow Operations First rules.
- [ ] Colors, spacing, radius, and typography use shared tokens.
- [ ] Availability uses 30-minute slots from `07:00` to `20:00`.
- [ ] Statuses have text labels and are not color-only.
- [ ] Required pages have loading, empty, error, and success states.
- [ ] Desktop and mobile layouts preserve the primary task.
- [ ] Unsupported reference claims are not presented as features.
- [ ] Forms and destructive actions use accessible labels and confirmation patterns.
