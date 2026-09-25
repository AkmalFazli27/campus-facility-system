import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Tag,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detail Laporan Kerusakan | KampusSpace",
  description: "Rincian dan histori penanganan laporan kerusakan fasilitas.",
};

const STATUS_DETAILS = {
  NEW: {
    label: "Menunggu Tindakan",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock,
    desc: "Laporan telah diterima sistem dan sedang mengantre untuk ditinjau oleh petugas.",
  },
  IN_PROGRESS: {
    label: "Sedang Ditangani",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    icon: Wrench,
    desc: "Petugas telah memeriksa laporan dan proses perbaikan sedang berlangsung.",
  },
  RESOLVED: {
    label: "Selesai Diperbaiki",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
    desc: "Perbaikan telah selesai dikerjakan dan diverifikasi oleh petugas sarana prasarana.",
  },
  REJECTED: {
    label: "Laporan Ditolak",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
    icon: XCircle,
    desc: "Laporan ditolak setelah peninjauan dengan alasan yang tercantum di bawah.",
  },
};

export default async function ReportDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/reports");
  }

  const params = await props.params;
  const reportId = Number.parseInt(params.id, 10);
  if (Number.isNaN(reportId)) notFound();

  const report = await db.report.findUnique({
    where: { id: reportId },
    include: {
      facility: true,
      reporter: {
        select: { id: true, name: true, email: true, role: true },
      },
      handler: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!report) notFound();

  if (
    report.reporterId !== user.id &&
    user.role !== "OFFICER" &&
    user.role !== "ADMIN"
  ) {
    redirect("/?error=forbidden");
  }

  const currentStatus = STATUS_DETAILS[report.status];
  const StatusIcon = currentStatus.icon;

  function formatDate(d: Date | null) {
    if (!d) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(d);
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10 sm:py-14">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-950 transition-colors mb-3"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Daftar Laporan
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-semibold text-ink-400">
              Laporan #{report.id}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
              {report.facility.name}
            </h1>
          </div>
          <Badge
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${currentStatus.badgeClass}`}
          >
            <StatusIcon className="size-4" />
            {currentStatus.label}
          </Badge>
        </div>
      </div>

      {/* Status Progress Step Indicator */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-11 items-center justify-center rounded-2xl ${
                  report.status === "RESOLVED"
                    ? "bg-emerald-100 text-emerald-700"
                    : report.status === "REJECTED"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                <StatusIcon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-ink-950 text-sm">
                  {currentStatus.label}
                </p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {currentStatus.desc}
                </p>
              </div>
            </div>

            {report.handledAt && (
              <div className="text-right text-xs text-ink-500 sm:border-l sm:border-slate-200 sm:pl-4">
                <p className="font-medium text-ink-700">Terakhir Diperbarui</p>
                <p>{formatDate(report.handledAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Foto Bukti & Detail Fasilitas */}
        <div className="md:col-span-1 space-y-6">
          {/* Card Foto */}
          <Card className="border-slate-200 overflow-hidden shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                Foto Bukti Fisik
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <Image
                  src={report.photoPath}
                  alt={`Bukti kerusakan ${report.facility.name}`}
                  fill
                  className="object-cover"
                />
              </div>
              <a
                href={report.photoPath}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-center text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Buka Foto Resolusi Asli ↗
              </a>
            </CardContent>
          </Card>

          {/* Card Fasilitas */}
          <Card className="border-slate-200 shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                Informasi Fasilitas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3 text-xs">
              <div>
                <span className="text-ink-400 block">Nama Fasilitas</span>
                <span className="font-semibold text-ink-950">
                  {report.facility.name}
                </span>
              </div>
              <div>
                <span className="text-ink-400 block">Lokasi &amp; Tipe</span>
                <span className="font-medium text-ink-800">
                  {report.facility.location} • {report.facility.type}
                </span>
              </div>
              <div>
                <span className="text-ink-400 block">Kondisi Saat Ini</span>
                <span
                  className={`inline-block mt-0.5 rounded-full px-2 py-0.5 font-semibold text-[10px] ${
                    report.facility.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700"
                      : report.facility.status === "UNDER_MAINTENANCE"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {report.facility.status === "ACTIVE"
                    ? "Aktif / Beroperasi"
                    : report.facility.status === "UNDER_MAINTENANCE"
                    ? "Dalam Perbaikan"
                    : "Tidak Aktif"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Rincian Kerusakan & Tindak Lanjut */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-2xs">
            <CardHeader className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-ink-950">
                  Rincian Kerusakan
                </CardTitle>
                <Badge variant="outline" className="text-xs font-medium">
                  <Tag className="size-3 mr-1 text-slate-400" />
                  {report.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div>
                <span className="text-xs font-semibold text-ink-400 block mb-1">
                  Deskripsi Masalah
                </span>
                <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {report.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="text-ink-400 block">Pelapor</span>
                  <span className="font-semibold text-ink-950 flex items-center gap-1.5 mt-0.5">
                    <User className="size-3.5 text-slate-400" />
                    {report.reporter.name}
                  </span>
                </div>
                <div>
                  <span className="text-ink-400 block">Waktu Laporan Dibuat</span>
                  <span className="font-medium text-ink-800 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="size-3.5 text-slate-400" />
                    {formatDate(report.createdAt)}
                  </span>
                </div>
              </div>

              {/* Catatan Resolusi atau Penolakan */}
              {report.resolutionNotes && (
                <div
                  className={`rounded-2xl border p-4 text-xs space-y-2 ${
                    report.status === "RESOLVED"
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                      : "border-rose-200 bg-rose-50/70 text-rose-950"
                  }`}
                >
                  <p className="font-bold flex items-center gap-2">
                    {report.status === "RESOLVED" ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="size-4 text-rose-600" />
                    )}
                    {report.status === "RESOLVED"
                      ? "Catatan Penyelesaian & Perbaikan"
                      : "Alasan Penolakan Laporan"}
                  </p>
                  <p className="text-sm leading-relaxed pl-6">
                    {report.resolutionNotes}
                  </p>
                  {report.handler && (
                    <p className="text-[11px] text-ink-500 pl-6 pt-1 border-t border-slate-200/50">
                      Ditangani oleh:{" "}
                      <span className="font-semibold text-ink-800">
                        {report.handler.name}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
