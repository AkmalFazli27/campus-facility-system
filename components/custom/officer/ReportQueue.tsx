"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Tag,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type OfficerReport = {
  id: number;
  category: string;
  description: string;
  photoPath: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  resolutionNotes: string | null;
  handledAt: string | null;
  createdAt: string;
  facility: {
    id: number;
    name: string;
    location: string;
    type: string;
    status: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
  };
  reporter: {
    id: number;
    name: string;
    email: string;
    identityNumber?: string | null;
  };
  handler?: {
    id: number;
    name: string;
  } | null;
};

const STATUS_CONFIG = {
  NEW: {
    label: "Laporan Baru",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "Sedang Dikerjakan",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-800",
    icon: Wrench,
  },
  RESOLVED: {
    label: "Selesai",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Ditolak",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-800",
    icon: XCircle,
  },
};

export default function ReportQueue() {
  const [reports, setReports] = useState<OfficerReport[]>([]);
  const [counts, setCounts] = useState({
    NEW: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    REJECTED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("NEW");
  const [search, setSearch] = useState("");

  // Dialog State untuk Resolve / Selesaikan
  const [resolveTarget, setResolveTarget] = useState<OfficerReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog State untuk Reject / Tolak
  const [rejectTarget, setRejectTarget] = useState<OfficerReport | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal Foto Lightbox
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  async function loadReports() {
    try {
      const res = await fetch("/api/officer/reports");
      const json = await res.json();
      if (res.ok && json.success) {
        setReports(json.data.reports);
        setCounts(json.data.counts);
      } else {
        toast.error("Gagal memuat antrian laporan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat memuat laporan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/officer/reports");
        const json = await res.json();
        if (!ignore && res.ok && json.success) {
          setReports(json.data.reports);
          setCounts(json.data.counts);
        }
      } catch {
        // silent fail on initial mount
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleUpdateStatus(
    reportId: number,
    nextStatus: "IN_PROGRESS" | "RESOLVED" | "REJECTED",
    notes?: string
  ) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/officer/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          resolution_notes: notes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui status laporan");
      }

      toast.success(
        nextStatus === "IN_PROGRESS"
          ? "Laporan berhasil ditandai sedang dikerjakan"
          : nextStatus === "RESOLVED"
          ? "Laporan berhasil diselesaikan!"
          : "Laporan berhasil ditolak"
      );

      // Tutup dialog-dialog
      setResolveTarget(null);
      setResolutionNotes("");
      setRejectTarget(null);
      setRejectReason("");

      // Muat ulang antrian
      await loadReports();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengubah status laporan";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleMaintenance(
    facilityId: number,
    currentStatus: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE"
  ) {
    const nextStatus =
      currentStatus === "UNDER_MAINTENANCE" ? "ACTIVE" : "UNDER_MAINTENANCE";
    setActionLoading(true);

    try {
      const res = await fetch(`/api/officer/facilities/${facilityId}/maintenance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal memperbarui status fasilitas");
      }

      toast.success(
        nextStatus === "UNDER_MAINTENANCE"
          ? "Fasilitas ditandai 'Dalam Perbaikan' (pemesanan dinonaktifkan)"
          : "Fasilitas telah diaktifkan kembali"
      );

      await loadReports();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal mengubah status pemeliharaan fasilitas";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  const filteredReports = reports.filter((r) => {
    const matchesTab = selectedTab === "ALL" || r.status === selectedTab;
    const query = search.toLowerCase();
    const matchesSearch =
      r.facility.name.toLowerCase().includes(query) ||
      r.facility.location.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.reporter.name.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  function formatDate(d: string) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(d));
  }

  return (
    <div className="space-y-6">
      {/* Header & Metric Counter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
          {[
            { id: "NEW", label: "Menunggu", count: counts.NEW },
            { id: "IN_PROGRESS", label: "Diproses", count: counts.IN_PROGRESS },
            { id: "RESOLVED", label: "Selesai", count: counts.RESOLVED },
            { id: "REJECTED", label: "Ditolak", count: counts.REJECTED },
            { id: "ALL", label: "Semua", count: reports.length },
          ].map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-500 text-white shadow-xs"
                    : "text-ink-600 hover:bg-slate-100 hover:text-ink-950"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-ink-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
            <Input
              placeholder="Cari pelapor / fasilitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full border-slate-200 bg-white text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadReports}
            disabled={loading}
            className="rounded-full shrink-0"
            title="Muat ulang data"
          >
            <RefreshCw
              className={`size-4 text-ink-500 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Konten Antrian */}
      {loading ? (
        <Card className="border-slate-200 py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-8 animate-spin text-brand-500" />
            <p className="text-sm font-medium text-ink-600">
              Memuat antrian laporan kerusakan...
            </p>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card className="border-slate-200 py-14 text-center shadow-xs">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <p className="text-base font-bold text-ink-950">
              Tidak ada antrian laporan pada filter ini
            </p>
            <p className="text-sm text-ink-500 max-w-md">
              {selectedTab === "NEW"
                ? "Semua laporan kerusakan baru sudah ditindaklanjuti. Kerja bagus!"
                : "Tidak ada laporan yang sesuai dengan kriteria pencarian Anda."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const config = STATUS_CONFIG[report.status];
            const StatusIcon = config.icon;
            const isMaintenance =
              report.facility.status === "UNDER_MAINTENANCE";

            return (
              <Card
                key={report.id}
                className="overflow-hidden border-slate-200 transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Bagian Kiri: Info Fasilitas & Laporan */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${config.badgeClass}`}
                        >
                          <StatusIcon className="size-3.5" />
                          {config.label}
                        </Badge>

                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          <Tag className="size-3 text-slate-400" />
                          {report.category}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isMaintenance
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isMaintenance
                            ? "Fasilitas: Dalam Perbaikan"
                            : "Fasilitas: Aktif"}
                        </span>

                        <span className="text-xs text-ink-400 ml-auto flex items-center gap-1 font-mono">
                          <Calendar className="size-3.5" />
                          {formatDate(report.createdAt)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-ink-950 flex items-center gap-2">
                          <Building2 className="size-4 text-brand-600 shrink-0" />
                          {report.facility.name}
                        </h3>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {report.facility.location} • {report.facility.type}
                        </p>
                      </div>

                      {/* Deskripsi & Pelapor */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
                        {/* Thumbnail Foto */}
                        <div
                          onClick={() => setPreviewPhoto(report.photoPath)}
                          className="group relative size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs"
                        >
                          <Image
                            src={report.photoPath}
                            alt="Bukti fisik"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="size-5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="text-xs leading-relaxed text-ink-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {report.description}
                          </p>
                          <p className="text-xs text-ink-500 flex items-center gap-1.5">
                            <User className="size-3.5 text-slate-400" />
                            Pelapor:{" "}
                            <span className="font-semibold text-ink-800">
                              {report.reporter.name}
                            </span>
                            {report.reporter.identityNumber && (
                              <span className="text-ink-400">
                                ({report.reporter.identityNumber})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Catatan Resolusi bila sudah selesai/ditolak */}
                      {report.resolutionNotes && (
                        <div
                          className={`rounded-xl border p-3 text-xs space-y-1 ${
                            report.status === "RESOLVED"
                              ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                              : "border-rose-200 bg-rose-50/70 text-rose-950"
                          }`}
                        >
                          <p className="font-semibold flex items-center gap-1.5">
                            {report.status === "RESOLVED" ? (
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                            ) : (
                              <AlertCircle className="size-3.5 text-rose-600" />
                            )}
                            {report.status === "RESOLVED"
                              ? "Catatan Perbaikan Selesai:"
                              : "Alasan Penolakan:"}
                          </p>
                          <p className="pl-5 text-ink-800">
                            {report.resolutionNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bagian Kanan: Aksi Petugas */}
                    <div className="flex flex-col gap-2 shrink-0 md:w-52 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 justify-center">
                      {report.status === "NEW" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(report.id, "IN_PROGRESS")
                            }
                            disabled={actionLoading}
                            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                          >
                            <Wrench className="size-3.5 mr-1.5" />
                            Mulai Kerjakan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectTarget(report)}
                            disabled={actionLoading}
                            className="w-full rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                          >
                            <XCircle className="size-3.5 mr-1.5" />
                            Tolak Laporan
                          </Button>
                        </>
                      )}

                      {report.status === "IN_PROGRESS" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setResolveTarget(report);
                              setResolutionNotes("");
                            }}
                            disabled={actionLoading}
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          >
                            <CheckCircle2 className="size-3.5 mr-1.5" />
                            Tandai Selesai
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectTarget(report)}
                            disabled={actionLoading}
                            className="w-full rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                          >
                            <XCircle className="size-3.5 mr-1.5" />
                            Batalkan / Tolak
                          </Button>
                        </>
                      )}

                      {/* Tombol US12: Tandai Fasilitas Maintenance */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleToggleMaintenance(
                            report.facility.id,
                            report.facility.status
                          )
                        }
                        disabled={actionLoading}
                        className={`w-full rounded-xl text-xs font-medium border ${
                          isMaintenance
                            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            : "border-amber-200 text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        {isMaintenance
                          ? "✓ Aktifkan Fasilitas"
                          : "⚠️ Set Pemeliharaan"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Selesaikan Laporan (Wajib Catatan Resolusi) */}
      <Dialog
        open={Boolean(resolveTarget)}
        onOpenChange={(open) => !open && setResolveTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selesaikan Laporan Kerusakan</DialogTitle>
            <DialogDescription>
              Fasilitas: <strong>{resolveTarget?.facility.name}</strong>. Berikan
              catatan perbaikan yang telah dilakukan untuk transparansi kepada
              pelapor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="notes" className="text-xs font-semibold text-ink-950">
              Catatan Resolusi / Tindakan Perbaikan{" "}
              <span className="text-rose-500">* (min. 5 karakter)</span>
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Contoh: Lampu neon 36W telah diganti baru dan saklar telah diperbaiki."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="rounded-xl border-slate-300 text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResolveTarget(null)}
              disabled={actionLoading}
              className="rounded-full text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!resolveTarget) return;
                if (!resolutionNotes.trim() || resolutionNotes.trim().length < 5) {
                  toast.error("Catatan resolusi wajib diisi minimal 5 karakter");
                  return;
                }
                handleUpdateStatus(
                  resolveTarget.id,
                  "RESOLVED",
                  resolutionNotes.trim()
                );
              }}
              disabled={actionLoading}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {actionLoading ? "Menyimpan..." : "Konfirmasi Selesai"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tolak Laporan */}
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertCircle className="size-5" />
              Tolak Laporan Kerusakan
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menolak laporan untuk fasilitas{" "}
              <strong>{rejectTarget?.facility.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label
              htmlFor="reject-reason"
              className="text-xs font-semibold text-ink-950"
            >
              Alasan Penolakan (opsional)
            </Label>
            <Textarea
              id="reject-reason"
              rows={3}
              placeholder="Contoh: Bukan kerusakan fasilitas kampus atau foto tidak relevan."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="rounded-xl border-slate-300 text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={actionLoading}
              className="rounded-full text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!rejectTarget) return;
                handleUpdateStatus(
                  rejectTarget.id,
                  "REJECTED",
                  rejectReason.trim() || "Laporan ditolak oleh petugas"
                );
              }}
              disabled={actionLoading}
              className="rounded-full text-xs font-semibold"
            >
              {actionLoading ? "Memproses..." : "Tolak Laporan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Preview Foto */}
      <Dialog
        open={Boolean(previewPhoto)}
        onOpenChange={(open) => !open && setPreviewPhoto(null)}
      >
        <DialogContent className="max-w-2xl p-2 bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto Bukti Kerusakan</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-black/90 shadow-2xl">
              <Image
                src={previewPhoto}
                alt="Foto bukti kerusakan"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
