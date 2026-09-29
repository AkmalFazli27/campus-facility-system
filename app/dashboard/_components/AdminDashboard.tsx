import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck2,
  FileSpreadsheet,
  Layers,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
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
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  getDamageRecap,
  getOccupancyRecap,
} from "@/lib/services/recapService";
import AdminDashboardExportButton from "@/components/custom/admin/AdminDashboardExportButton";

export default async function AdminDashboard({
  user,
}: {
  user: Pick<SessionUser, "id" | "name">;
}) {
  const [
    activeFacilitiesCount,
    maintenanceFacilitiesCount,
    inactiveFacilitiesCount,
    pendingUsersCount,
    approvedReservationsCount,
    activeReportsCount,
    occupancyRecap,
    damageRecap,
  ] = await Promise.all([
    db.facility.count({ where: { status: "ACTIVE" } }),
    db.facility.count({ where: { status: "UNDER_MAINTENANCE" } }),
    db.facility.count({ where: { status: "INACTIVE" } }),
    db.user.count({ where: { accountStatus: "PENDING" } }),
    db.reservation.count({ where: { status: "APPROVED" } }),
    db.report.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    getOccupancyRecap({}),
    getDamageRecap({}),
  ]);

  const totalFacilities =
    activeFacilitiesCount + maintenanceFacilitiesCount + inactiveFacilitiesCount;

  const metrics = [
    {
      label: "Total Fasilitas",
      value: totalFacilities,
      subtext: `${activeFacilitiesCount} aktif · ${maintenanceFacilitiesCount} perbaikan`,
      icon: Building2,
      accent: "bg-sky-50 text-sky-700",
    },
    {
      label: "Verifikasi Pengguna",
      value: pendingUsersCount,
      subtext: pendingUsersCount > 0 ? "Memerlukan persetujuan" : "Semua akun terverifikasi",
      icon: UserCheck,
      accent: pendingUsersCount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Reservasi Berjalan",
      value: approvedReservationsCount,
      subtext: `${occupancyRecap.summary.averageOccupancy}% rata-rata okupansi`,
      icon: CalendarCheck2,
      accent: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Laporan Kerusakan Aktif",
      value: activeReportsCount,
      subtext: activeReportsCount > 0 ? "Perlu penanganan petugas" : "Tidak ada aduan aktif",
      icon: AlertTriangle,
      accent: activeReportsCount > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Banner Sapaan */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white sm:px-8">
        <div className="absolute -top-20 -right-16 size-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-3">
          <Badge className="border-white/15 bg-white/10 text-white">
            Ruang Kerja Administrator
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Selamat Datang, {user.name}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-300">
            Pusat kendali operasional fasilitas, master data sarana prasarana, verifikasi civitas kampus, dan ekspor laporan resmi.
          </p>
        </div>
      </section>

      {/* Ringkasan Metrik 4 Kartu */}
      <section aria-label="Ringkasan aktivitas admin" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-xs font-medium text-ink-600">{metric.label}</p>
                  <p className="mt-1.5 text-3xl font-bold tracking-tight text-ink-950">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-400">{metric.subtext}</p>
                </div>
                <span className={cn("flex size-11 items-center justify-center rounded-2xl", metric.accent)}>
                  <Icon aria-hidden className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Grid: Widget Kelola Fasilitas (A2) + Widget Rekap & Export (A4) */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Widget 1: Kelola Fasilitas (A2 shortcut + status) */}
        <Card className="border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-ink-950 flex items-center gap-2">
                  <Building2 className="size-4 text-brand-600" />
                  Kelola Data Fasilitas
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Master data ruang kelas, lab, aula, dan status operasional.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                US16 &amp; FR-FAC-01
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-5 flex-1">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-center">
                <span className="size-2 rounded-full bg-emerald-500 inline-block mb-1" />
                <p className="text-xl font-bold text-emerald-950">{activeFacilitiesCount}</p>
                <p className="text-[11px] font-semibold text-emerald-700">Fasilitas Aktif</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 text-center">
                <span className="size-2 rounded-full bg-amber-500 inline-block mb-1" />
                <p className="text-xl font-bold text-amber-950">{maintenanceFacilitiesCount}</p>
                <p className="text-[11px] font-semibold text-amber-700">Dalam Perbaikan</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                <span className="size-2 rounded-full bg-slate-400 inline-block mb-1" />
                <p className="text-xl font-bold text-slate-800">{inactiveFacilitiesCount}</p>
                <p className="text-[11px] font-semibold text-slate-600">Nonaktif</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-ink-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <p className="font-semibold text-ink-900 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-brand-600" />
                Aturan Pengelolaan:
              </p>
              <p>
                Fasilitas dalam status <em>under_maintenance</em> atau <em>inactive</em> secara otomatis tidak dapat dipesan pada kalender civitas kampus.
              </p>
            </div>
          </CardContent>
          <div className="border-t border-slate-100 p-4 bg-slate-50/50 rounded-b-xl flex items-center justify-between">
            <Link
              href="/admin/facilities"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold"
              )}
            >
              <Settings className="size-3.5 mr-1.5" />
              Kelola Master Fasilitas
            </Link>
            <Link
              href="/facilities"
              className="text-xs font-semibold text-ink-600 hover:text-ink-950"
            >
              Buka Katalog Publik ↗
            </Link>
          </div>
        </Card>

        {/* Widget 2: Rekapitulasi & Export PDF (A4 - FR-DASH-03) */}
        <Card className="border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-ink-950 flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-emerald-600" />
                  Rekap Admin &amp; Ekspor PDF
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Statistik pemakaian ruang dan unduh dokumen resmi.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                US17 &amp; FR-DASH-03
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 flex-1">
            {/* Quick Stats */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-ink-500 block">Rata-rata Okupansi</span>
                <span className="font-bold text-ink-950 text-base">
                  {occupancyRecap.summary.averageOccupancy}%
                </span>
              </div>
              <div>
                <span className="text-ink-500 block">Slot Terpakai</span>
                <span className="font-bold text-brand-600 text-base">
                  {occupancyRecap.summary.totalUsedSlots} slot
                </span>
              </div>
              <div>
                <span className="text-ink-500 block">Total Kerusakan</span>
                <span className="font-bold text-rose-600 text-base">
                  {damageRecap.summary.totalReports} aduan
                </span>
              </div>
            </div>

            {/* Direct Export Buttons (FR-DASH-03) */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-700">
                Ekspor Cepat Dokumen PDF:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <AdminDashboardExportButton
                  type="occupancy"
                  label="Ekspor PDF Okupansi"
                  className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-ink-800"
                />
                <AdminDashboardExportButton
                  type="damage"
                  label="Ekspor PDF Kerusakan"
                  className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-ink-800"
                />
              </div>
            </div>
          </CardContent>
          <div className="border-t border-slate-100 p-4 bg-slate-50/50 rounded-b-xl flex items-center justify-between">
            <Link
              href="/admin/recap"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              )}
            >
              <Layers className="size-3.5 mr-1.5" />
              Buka Rekap Lengkap
            </Link>
            <span className="text-[11px] text-ink-400">PDFKit Engine Active</span>
          </div>
        </Card>
      </div>

      {/* Widget Preview Okupansi Fasilitas Teratas (FR-DASH-03) */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between p-5">
          <div>
            <CardTitle className="text-base font-bold text-ink-950">
              Preview Utilisasi Fasilitas Bulan Ini
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Fasilitas dengan tingkat reservasi aktif dan jam penggunaan tertinggi.
            </CardDescription>
          </div>
          <Link
            href="/admin/recap"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Lihat semua fasilitas <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-ink-600 font-semibold">
                  <th className="py-3 px-4">Nama Fasilitas</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Slot Terpakai</th>
                  <th className="py-3 px-4 text-right">Tingkat Okupansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {occupancyRecap.items.slice(0, 5).map((item) => (
                  <tr key={item.facilityId} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-ink-950">
                      {item.facilityName}
                    </td>
                    <td className="py-3 px-4 text-ink-600">{item.location}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "UNDER_MAINTENANCE"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.status === "ACTIVE"
                          ? "Aktif"
                          : item.status === "UNDER_MAINTENANCE"
                          ? "Perbaikan"
                          : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-ink-900">
                      {item.usedSlots} / {item.totalOperatingSlots}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-brand-600">
                        {item.occupancyRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pintasan Aksi Cepat Admin */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/users"
          className="group flex items-center gap-4 rounded-2xl border border-sky-100 bg-sky-50 p-5 transition-colors hover:border-sky-300"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-600 text-white">
            <Users aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink-950">
              Verifikasi Pendaftaran Civitas
            </span>
            <span className="mt-1 block text-sm text-ink-600">
              {pendingUsersCount} pengguna baru menunggu persetujuan akun.
            </span>
          </span>
          <ArrowRight
            aria-hidden
            className="size-5 text-sky-600 transition-transform group-hover:translate-x-1"
          />
        </Link>

        <Link
          href="/admin/recap"
          className="group flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 transition-colors hover:border-emerald-300"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <FileSpreadsheet aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink-950">
              Laporan &amp; Rekapitulasi Lengkap
            </span>
            <span className="mt-1 block text-sm text-ink-600">
              Filter tanggal, lihat histori kerusakan, dan cetak PDF.
            </span>
          </span>
          <ArrowRight
            aria-hidden
            className="size-5 text-emerald-600 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </section>
    </div>
  );
}
