import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardClock,
  FileWarning,
  MapPin,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import {
  formatReservationDate,
  RESERVATION_STATUS_META,
} from "@/lib/reservation-ui";
import type { SessionUser } from "@/lib/session";
import {
  isReservationFinished,
  userTypeLabel,
} from "@/lib/user-dashboard";
import { cn } from "@/lib/utils";
import UserDashboardReservationAction from "@/app/dashboard/_components/UserDashboardReservationAction";

const REPORT_STATUS_META = {
  NEW: { label: "Baru", className: "border-amber-200 bg-amber-50 text-amber-700" },
  IN_PROGRESS: {
    label: "Diproses",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  RESOLVED: {
    label: "Selesai",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: { label: "Ditolak", className: "border-red-200 bg-red-50 text-red-700" },
} as const;

function timeKey(value: Date): string {
  return value.toISOString().slice(11, 16);
}

function reportDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export default async function UserDashboard({
  user,
}: {
  user: Pick<SessionUser, "id" | "name" | "userType" | "identityNumber">;
}) {
  const now = new Date();
  const [pendingCount, approvedReservations, completedCount, reportCount, reports] =
    await Promise.all([
      db.reservation.count({ where: { userId: user.id, status: "PENDING" } }),
      db.reservation.findMany({
        where: { userId: user.id, status: "APPROVED" },
        orderBy: [{ reservationDate: "asc" }, { startTime: "asc" }],
        select: {
          id: true,
          reservationDate: true,
          startTime: true,
          endTime: true,
          purpose: true,
          status: true,
          facility: { select: { name: true, location: true } },
        },
      }),
      db.reservation.count({ where: { userId: user.id, status: "COMPLETED" } }),
      db.report.count({ where: { reporterId: user.id } }),
      db.report.findMany({
        where: { reporterId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          category: true,
          description: true,
          status: true,
          resolutionNotes: true,
          createdAt: true,
          facility: { select: { name: true } },
        },
      }),
    ]);

  const upcomingReservations = approvedReservations.filter(
    (reservation) => !isReservationFinished(reservation, now),
  );
  const finishedApproved = approvedReservations.length - upcomingReservations.length;
  const upcoming = upcomingReservations[0] ?? null;
  const metrics = [
    {
      label: "Reservasi aktif",
      value: upcomingReservations.length,
      icon: CalendarCheck2,
      accent: "bg-sky-50 text-sky-700",
    },
    {
      label: "Menunggu persetujuan",
      value: pendingCount,
      icon: ClipboardClock,
      accent: "bg-amber-50 text-amber-700",
    },
    {
      label: "Laporan kerusakan",
      value: reportCount,
      icon: FileWarning,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Riwayat selesai",
      value: completedCount + finishedApproved,
      icon: CheckCircle2,
      accent: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-8 text-white sm:px-8">
        <div className="absolute -top-20 -right-16 size-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-3">
          <Badge className="border-white/15 bg-white/10 text-white">Portal pengguna</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Halo, {user.name}
          </h1>
          <p className="text-sm leading-6 text-slate-300 sm:text-base">
            {user.identityNumber ?? "Nomor identitas belum tersedia"} · {userTypeLabel(user.userType)}
          </p>
          <p className="max-w-xl text-sm leading-6 text-slate-300">
            Pantau jadwal peminjaman dan perkembangan laporan fasilitas kampus dari satu tempat.
          </p>
        </div>
      </section>

      <section aria-label="Ringkasan aktivitas" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-600">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">
                    {metric.value}
                  </p>
                </div>
                <span className={cn("flex size-11 items-center justify-center rounded-2xl", metric.accent)}>
                  <Icon aria-hidden className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Jadwal peminjaman terdekat</CardTitle>
            <CardDescription>Reservasi yang sudah disetujui dan belum selesai.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming ? (
              <div className="space-y-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <Badge className={RESERVATION_STATUS_META.APPROVED.className}>
                      {RESERVATION_STATUS_META.APPROVED.label}
                    </Badge>
                    <h2 className="mt-3 text-xl font-semibold text-ink-950">
                      {upcoming.facility.name}
                    </h2>
                    <p className="mt-1 text-sm text-ink-600">{upcoming.purpose}</p>
                  </div>
                  <UserDashboardReservationAction reservationId={upcoming.id} />
                </div>
                <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-ink-600">
                    <CalendarCheck2 aria-hidden className="size-4 text-brand-600" />
                    {formatReservationDate(upcoming.reservationDate.toISOString().slice(0, 10))}, {timeKey(upcoming.startTime)}-{timeKey(upcoming.endTime)}
                  </p>
                  <p className="flex items-center gap-2 text-ink-600">
                    <MapPin aria-hidden className="size-4 text-brand-600" />
                    {upcoming.facility.location}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4 py-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-ink-400">
                  <CalendarCheck2 aria-hidden className="size-6" />
                </span>
                <div>
                  <p className="font-medium text-ink-950">Belum ada jadwal aktif</p>
                  <p className="mt-1 text-sm text-ink-600">Cari fasilitas dan ajukan waktu peminjaman baru.</p>
                </div>
                <Link href="/facilities" className={cn(buttonVariants(), "bg-brand-500 hover:bg-brand-600")}>
                  Cari fasilitas
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Status laporan terkini</CardTitle>
            <CardDescription>Tiga laporan terakhir yang kamu kirim.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length > 0 ? (
              reports.map((report) => (
                <article key={report.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-950">{report.facility.name}</p>
                      <p className="mt-1 text-xs text-ink-400">{reportDate(report.createdAt)}</p>
                    </div>
                    <Badge className={REPORT_STATUS_META[report.status].className}>
                      {REPORT_STATUS_META[report.status].label}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-600">
                    {report.description}
                  </p>
                  {report.resolutionNotes && (
                    <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
                      {report.resolutionNotes}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <div className="py-6 text-center">
                <FileWarning aria-hidden className="mx-auto size-8 text-ink-400" />
                <p className="mt-3 font-medium text-ink-950">Belum ada laporan</p>
                <p className="mt-1 text-sm text-ink-600">Laporkan fasilitas yang membutuhkan penanganan.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/facilities" className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5 transition-colors hover:border-brand-300">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-500 text-white">
            <Plus aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink-950">Pesan ruang baru</span>
            <span className="mt-1 block text-sm text-ink-600">Lihat fasilitas dan slot yang tersedia.</span>
          </span>
          <ArrowRight aria-hidden className="size-5 text-brand-600 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/reports/new" className="group flex items-center gap-4 rounded-2xl border border-violet-100 bg-violet-50 p-5 transition-colors hover:border-violet-300">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <Building2 aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink-950">Laporkan kerusakan</span>
            <span className="mt-1 block text-sm text-ink-600">Kirim detail kondisi fasilitas kepada petugas.</span>
          </span>
          <ArrowRight aria-hidden className="size-5 text-violet-600 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-ink-600">
        <p className="font-medium text-ink-950">Panduan singkat</p>
        <p className="mt-1">
          Ajukan reservasi pada slot tersedia, tunggu persetujuan petugas, lalu gunakan fasilitas sesuai jadwal. Pembatalan mandiri hanya dapat dilakukan sebelum waktu mulai.
        </p>
      </section>
    </div>
  );
}
