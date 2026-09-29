import {
  AlertTriangle,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReservationQueue from "@/components/custom/officer/ReservationQueue";
import ReportQueue from "@/components/custom/officer/ReportQueue";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function OfficerDashboard({
  user,
}: {
  user: Pick<SessionUser, "id" | "name">;
}) {
  const [
    pendingReservationsCount,
    newReportsCount,
    inProgressReportsCount,
    maintenanceFacilitiesCount,
  ] = await Promise.all([
    db.reservation.count({ where: { status: "PENDING" } }),
    db.report.count({ where: { status: "NEW" } }),
    db.report.count({ where: { status: "IN_PROGRESS" } }),
    db.facility.count({ where: { status: "UNDER_MAINTENANCE" } }),
  ]);

  const metrics = [
    {
      label: "Reservasi Menunggu",
      value: pendingReservationsCount,
      subtext: pendingReservationsCount > 0 ? "Menunggu persetujuan" : "Antrian bersih",
      icon: Clock,
      accent: pendingReservationsCount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Laporan Kerusakan Baru",
      value: newReportsCount,
      subtext: newReportsCount > 0 ? "Butuh peninjauan" : "Tidak ada laporan baru",
      icon: AlertTriangle,
      accent: newReportsCount > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Sedang Dikerjakan",
      value: inProgressReportsCount,
      subtext: "Proses perbaikan berjalan",
      icon: Wrench,
      accent: "bg-sky-50 text-sky-700",
    },
    {
      label: "Dalam Pemeliharaan",
      value: maintenanceFacilitiesCount,
      subtext: "Fasilitas dinonaktifkan",
      icon: CheckCircle2,
      accent: maintenanceFacilitiesCount > 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Sapaan Petugas */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white sm:px-8">
        <div className="absolute -top-20 -right-16 size-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-3">
          <Badge className="border-white/15 bg-white/10 text-white">
            Ruang Kerja Petugas
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Halo, {user.name}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-300">
            Proses persetujuan peminjaman ruang, periksa jadwal bentrok, dan tangani laporan kerusakan fasilitas dari satu tempat.
          </p>
        </div>
      </section>

      {/* 4 Counter Kartu Metrik Antrian */}
      <section aria-label="Ringkasan antrian petugas" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Tab Antrian Kerja: Reservasi & Laporan Kerusakan */}
      <Tabs defaultValue="reservasi" className="flex flex-col gap-6">
        <TabsList
          aria-label="Pilih jenis antrian"
          className="grid h-auto w-full grid-cols-2 gap-3 rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-auto"
        >
          <TabsTrigger
            value="reservasi"
            className="group h-auto min-h-14 w-full justify-start rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm hover:border-sky-200 hover:bg-sky-50/50 sm:min-h-16 sm:px-4 data-active:border-sky-300 data-active:bg-sky-50 data-active:text-sky-950 data-active:shadow-md"
          >
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 group-data-active:bg-sky-600 group-data-active:text-white sm:flex">
              <CalendarCheck2 aria-hidden className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink-950">
                Antrian Reservasi ({pendingReservationsCount})
              </span>
              <span className="mt-0.5 hidden text-xs font-normal leading-5 whitespace-normal text-ink-500 sm:block">
                Setujui, tolak, dan verifikasi anti-bentrok jadwal.
              </span>
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="laporan"
            className="group h-auto min-h-14 w-full justify-start rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm hover:border-sky-200 hover:bg-sky-50/50 sm:min-h-16 sm:px-4 data-active:border-sky-300 data-active:bg-sky-50 data-active:text-sky-950 data-active:shadow-md"
          >
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 group-data-active:bg-sky-600 group-data-active:text-white sm:flex">
              <ClipboardList aria-hidden className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink-950">
                Antrian Laporan Kerusakan ({newReportsCount})
              </span>
              <span className="mt-0.5 hidden text-xs font-normal leading-5 whitespace-normal text-ink-500 sm:block">
                Tindak lanjuti perbaikan dan kelola status pemeliharaan fasilitas.
              </span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservasi" className="min-w-0 w-full">
          <ReservationQueue />
        </TabsContent>

        <TabsContent value="laporan" className="min-w-0 w-full">
          <ReportQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}
