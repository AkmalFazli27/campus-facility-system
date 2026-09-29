"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileQuestion,
  HelpCircle,
  MapPin,
  Search,
  Tag,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type ReportItem = {
  id: number;
  category: string;
  description: string;
  photoPath: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  resolutionNotes: string | null;
  createdAt: string | Date;
  facility: {
    id: number;
    name: string;
    location: string;
    type: string;
  };
  handler?: {
    id: number;
    name: string;
  } | null;
};

interface ReportListProps {
  initialReports: ReportItem[];
}

const STATUS_CONFIG = {
  NEW: {
    label: "Menunggu Tindakan",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "Sedang Diproses",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    icon: HelpCircle,
  },
  RESOLVED: {
    label: "Selesai Diperbaiki",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Ditolak",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
    icon: XCircle,
  },
};

export default function ReportList({ initialReports }: ReportListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const filtered = initialReports.filter((report) => {
    const matchesStatus =
      selectedStatus === "ALL" || report.status === selectedStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      report.facility.name.toLowerCase().includes(query) ||
      report.facility.location.toLowerCase().includes(query) ||
      report.category.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    ALL: initialReports.length,
    NEW: initialReports.filter((r) => r.status === "NEW").length,
    IN_PROGRESS: initialReports.filter((r) => r.status === "IN_PROGRESS").length,
    RESOLVED: initialReports.filter((r) => r.status === "RESOLVED").length,
    REJECTED: initialReports.filter((r) => r.status === "REJECTED").length,
  };

  function formatDate(d: string | Date) {
    const date = typeof d === "string" ? new Date(d) : d;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(date);
  }

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
          {[
            { id: "ALL", label: "Semua", count: counts.ALL },
            { id: "NEW", label: "Menunggu", count: counts.NEW },
            { id: "IN_PROGRESS", label: "Diproses", count: counts.IN_PROGRESS },
            { id: "RESOLVED", label: "Selesai", count: counts.RESOLVED },
            { id: "REJECTED", label: "Ditolak", count: counts.REJECTED },
          ].map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
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

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
          <Input
            placeholder="Cari fasilitas / kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full border-slate-200 bg-white text-xs"
          />
        </div>
      </div>

      {/* Report Cards Grid / List */}
      {filtered.length === 0 ? (
        <Card className="border-slate-200 py-12 text-center shadow-xs">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <FileQuestion className="size-7" />
            </div>
            <p className="text-base font-semibold text-ink-950">
              Tidak ada laporan kerusakan ditemukan
            </p>
            <p className="text-sm text-ink-500 max-w-sm">
              {searchQuery || selectedStatus !== "ALL"
                ? "Coba sesuaikan kata kunci pencarian atau filter status Anda."
                : "Anda belum pernah mengajukan laporan kerusakan fasilitas kampus."}
            </p>
            <Link
              href="/reports/new"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-600"
            >
              Laporkan Kerusakan Baru
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((report) => {
            const config = STATUS_CONFIG[report.status];
            const StatusIcon = config.icon;

            return (
              <Card
                key={report.id}
                className="overflow-hidden border-slate-200 transition-all hover:border-slate-300 hover:shadow-md flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Header Card: Status & Tanggal */}
                  <div className="flex items-start justify-between gap-3">
                    <Badge
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${config.badgeClass}`}
                    >
                      <StatusIcon className="size-3.5" />
                      {config.label}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <Calendar className="size-3.5" />
                      {formatDate(report.createdAt)}
                    </span>
                  </div>

                  {/* Fasilitas & Kategori */}
                  <div>
                    <h3 className="text-lg font-bold text-ink-950 flex items-center gap-2">
                      <Building2 className="size-4 text-brand-600 shrink-0" />
                      <span className="truncate">{report.facility.name}</span>
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
                      <MapPin className="size-3.5 text-slate-400" />
                      {report.facility.location} • {report.facility.type}
                    </p>
                  </div>

                  {/* Thumbnail & Deskripsi */}
                  <div className="flex gap-4 items-start">
                    <div
                      onClick={() => setPreviewPhoto(report.photoPath)}
                      className="group relative size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      <Image
                        src={report.photoPath}
                        alt="Bukti kerusakan"
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="size-5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 mb-1.5">
                        <Tag className="size-3" />
                        {report.category}
                      </div>
                      <p className="text-xs text-ink-600 line-clamp-3 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  {/* Resolution Notes bila ada */}
                  {report.status === "RESOLVED" && report.resolutionNotes && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        Catatan Penyelesaian Petugas:
                      </p>
                      <p className="leading-relaxed pl-5 text-emerald-950">
                        {report.resolutionNotes}
                      </p>
                    </div>
                  )}

                  {report.status === "REJECTED" && report.resolutionNotes && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5 text-rose-800">
                        <AlertCircle className="size-3.5 text-rose-600" />
                        Alasan Penolakan:
                      </p>
                      <p className="leading-relaxed pl-5 text-rose-950">
                        {report.resolutionNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Card */}
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-ink-400 font-mono">
                    ID #{report.id}
                  </span>
                  <Link
                    href={`/reports/${report.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Lihat Detail
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Lightbox Foto Bukti */}
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
                alt="Foto bukti kerusakan resolusi penuh"
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
