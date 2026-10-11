"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  Tag,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { REPORT_CATEGORIES } from "@/lib/validations/report";
import type {
  OccupancyRecapResult,
  DamageRecapResult,
} from "@/lib/services/recapService";

type FacilityOption = {
  id: number;
  name: string;
  location: string;
  type: string;
};

export default function RecapAdminView({
  initialOccupancy,
  initialDamage,
  facilities,
}: {
  initialOccupancy: OccupancyRecapResult;
  initialDamage: DamageRecapResult;
  facilities: FacilityOption[];
}) {
  const [activeTab, setActiveTab] = useState<"occupancy" | "damage">("occupancy");

  // Filters State
  const [from, setFrom] = useState(initialOccupancy.period.from);
  const [to, setTo] = useState(initialOccupancy.period.to);
  const [facilityId, setFacilityId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  // Data State
  const [occupancyData, setOccupancyData] =
    useState<OccupancyRecapResult>(initialOccupancy);
  const [damageData, setDamageData] = useState<DamageRecapResult>(initialDamage);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Search in table
  const [tableSearch, setTableSearch] = useState("");

  async function applyFilter() {
    setLoading(true);
    try {
      const occParams = new URLSearchParams();
      if (from) occParams.set("from", from);
      if (to) occParams.set("to", to);
      if (facilityId) occParams.set("facility_id", facilityId);
      if (location) occParams.set("location", location);

      const dmgParams = new URLSearchParams(occParams);
      if (category) dmgParams.set("category", category);

      const [occRes, dmgRes] = await Promise.all([
        fetch(`/api/admin/recap/occupancy?${occParams.toString()}`),
        fetch(`/api/admin/recap/damage?${dmgParams.toString()}`),
      ]);

      const [occJson, dmgJson] = await Promise.all([
        occRes.json(),
        dmgRes.json(),
      ]);

      if (occRes.ok && occJson.success) {
        setOccupancyData(occJson.data);
      } else {
        toast.error("Gagal memuat rekap okupansi");
      }

      if (dmgRes.ok && dmgJson.success) {
        setDamageData(dmgJson.data);
      } else {
        toast.error("Gagal memuat rekap kerusakan");
      }

      toast.success("Data rekapitulasi berhasil diperbarui");
    } catch {
      toast.error("Terjadi kesalahan jaringan saat memfilter data");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFrom(initialOccupancy.period.from);
    setTo(initialOccupancy.period.to);
    setFacilityId("");
    setLocation("");
    setCategory("");
    setOccupancyData(initialOccupancy);
    setDamageData(initialDamage);
  }

  async function handleExportPdf() {
    setExporting(true);
    try {
      const isOcc = activeTab === "occupancy";
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (facilityId) params.set("facility_id", facilityId);
      if (location) params.set("location", location);
      if (!isOcc && category) params.set("category", category);

      const endpoint = isOcc
        ? `/api/admin/recap/occupancy/export?${params.toString()}`
        : `/api/admin/recap/damage/export?${params.toString()}`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error("Gagal mengunduh dokumen PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = isOcc
        ? `rekap-okupansi-${from}-sd-${to}.pdf`
        : `rekap-kerusakan-${from}-sd-${to}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `Laporan PDF ${
          isOcc ? "Okupansi" : "Kerusakan"
        } berhasil diunduh!`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat unduh PDF";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  }

  // Filtered rows for search bar inside table
  const filteredOccupancyItems = occupancyData.items.filter((item) => {
    const q = tableSearch.toLowerCase();
    return (
      item.facilityName.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  const filteredDamageItems = damageData.items.filter((item) => {
    const q = tableSearch.toLowerCase();
    return (
      item.facilityName.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.topCategory.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4 pt-5 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-ink-950 flex items-center gap-2">
              <Filter className="size-4 text-brand-600" />
              Filter Periode &amp; Parameter Rekap
            </CardTitle>
            <span className="text-xs text-ink-500">
              {occupancyData.period.dayCount} hari kalender
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date-from" className="text-xs font-semibold text-ink-700">
                Dari Tanggal
              </Label>
              <Input
                id="date-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date-to" className="text-xs font-semibold text-ink-700">
                Sampai Tanggal
              </Label>
              <Input
                id="date-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="facility-sel" className="text-xs font-semibold text-ink-700">
                Fasilitas
              </Label>
              <select
                id="facility-sel"
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Semua Fasilitas ({facilities.length})</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-filter" className="text-xs font-semibold text-ink-700">
                Cari Lokasi / Gedung
              </Label>
              <Input
                id="loc-filter"
                placeholder="Contoh: Gedung A, Lantai 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
              />
            </div>

            {activeTab === "damage" && (
              <div className="space-y-1.5 sm:col-span-2 md:col-span-4">
                <Label htmlFor="cat-sel" className="text-xs font-semibold text-ink-700">
                  Filter Kategori Kerusakan
                </Label>
                <select
                  id="cat-sel"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 w-full sm:w-72 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Semua Kategori</option>
                  {REPORT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={applyFilter}
                disabled={loading}
                className="h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-3.5 mr-1.5" />
                    Terapkan Filter
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="h-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium px-4 shadow-2xs"
              >
                Reset
              </Button>
            </div>

            {/* Export PDF Button */}
            <Button
              size="sm"
              onClick={handleExportPdf}
              disabled={exporting || loading}
              className="h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 shadow-sm"
            >
              {exporting ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin text-brand-400" />
                  Membuat Dokumen PDF...
                </>
              ) : (
                <>
                  <Download className="size-3.5 mr-1.5 text-brand-400" />
                  Ekspor PDF ({activeTab === "occupancy" ? "Okupansi" : "Kerusakan"})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="inline-flex w-full sm:w-auto rounded-2xl bg-slate-100 p-1 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("occupancy")}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "occupancy"
                ? "bg-white text-ink-950 shadow-xs"
                : "text-ink-600 hover:text-ink-950"
            )}
          >
            <Layers className="size-3.5 text-brand-600" />
            Okupansi Fasilitas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("damage")}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "damage"
                ? "bg-white text-ink-950 shadow-xs"
                : "text-ink-600 hover:text-ink-950"
            )}
          >
            <Wrench className="size-3.5 text-rose-600" />
            Kerusakan &amp; Servis
          </button>
        </div>

        {/* Quick Search within current tab */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
          <Input
            placeholder="Cari tabel di bawah..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="h-9 pl-9 rounded-full border-slate-200 bg-white text-xs shadow-2xs"
          />
        </div>
      </div>

      {activeTab === "occupancy" ? (
        <div className="w-full space-y-6">
          {/* 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Total Fasilitas</p>
                  <p className="text-2xl font-bold text-ink-950 mt-1">
                    {occupancyData.summary.totalFacilities}
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">Ruang &amp; alat terdata</p>
                </div>
                <div className="size-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Building2 className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Reservasi Disetujui</p>
                  <p className="text-2xl font-bold text-ink-950 mt-1">
                    {occupancyData.summary.totalReservations}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Kegiatan berjalan</p>
                </div>
                <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Slot Waktu Terpakai</p>
                  <p className="text-2xl font-bold text-ink-950 mt-1">
                    {occupancyData.summary.totalUsedSlots}{" "}
                    <span className="text-sm font-normal text-ink-500">
                      / {occupancyData.summary.totalOperatingSlots}
                    </span>
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">30 menit per slot</p>
                </div>
                <div className="size-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Rata-rata Okupansi</p>
                  <p className="text-2xl font-bold text-brand-600 mt-1">
                    {occupancyData.summary.averageOccupancy}%
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">
                    {occupancyData.period.dayCount} hari periode terpilih
                  </p>
                </div>
                <div className="size-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Calendar className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="border-slate-200 overflow-hidden shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-ink-950">
                  Tabel Rincian Okupansi Fasilitas
                </CardTitle>
                <p className="text-xs text-ink-500 mt-0.5">
                  Rumus: Total Slot Terpakai (Approved) dibagi Total Slot Operasional (07:00–20:00).
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                {filteredOccupancyItems.length} Fasilitas
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-ink-600 font-semibold">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Fasilitas</th>
                      <th className="py-3 px-4">Lokasi</th>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4 text-center">Kapasitas Slot</th>
                      <th className="py-3 px-4 text-center">Terpakai</th>
                      <th className="py-3 px-4 text-right">Tingkat Okupansi</th>
                      <th className="py-3 px-4 text-center">Reservasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOccupancyItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-ink-400">
                          Tidak ada fasilitas yang sesuai dengan pencarian
                        </td>
                      </tr>
                    ) : (
                      filteredOccupancyItems.map((item, idx) => (
                        <tr
                          key={item.facilityId}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-mono text-ink-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-semibold text-ink-950">
                            {item.facilityName}
                          </td>
                          <td className="py-3 px-4 text-ink-600">
                            {item.location}
                          </td>
                          <td className="py-3 px-4 text-ink-600">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-ink-600">
                            {item.totalOperatingSlots}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-ink-950">
                            {item.usedSlots}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.occupancyRate >= 60
                                      ? "bg-rose-500"
                                      : item.occupancyRate >= 30
                                      ? "bg-brand-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(100, item.occupancyRate)}%`,
                                  }}
                                />
                              </div>
                              <span className="font-bold text-ink-950 w-12 text-right">
                                {item.occupancyRate}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-ink-800">
                            {item.reservationCount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full space-y-6">
          {/* 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Total Laporan Kerusakan</p>
                  <p className="text-2xl font-bold text-ink-950 mt-1">
                    {damageData.summary.totalReports}
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">Semua aduan masuk</p>
                </div>
                <div className="size-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <AlertTriangle className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Selesai Diperbaiki</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {damageData.summary.resolvedReports}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Resolusi tuntas</p>
                </div>
                <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Dalam Pengerjaan</p>
                  <p className="text-2xl font-bold text-sky-600 mt-1">
                    {damageData.summary.inProgressReports}
                  </p>
                  <p className="text-[11px] text-sky-700 mt-0.5 font-medium">Sedang ditangani</p>
                </div>
                <div className="size-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Wrench className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-2xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500">Kategori Terbanyak</p>
                  <p className="text-base font-bold text-rose-600 mt-1 truncate max-w-[150px]">
                    {damageData.summary.topCategory || "-"}
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">Perlu perhatian prioritas</p>
                </div>
                <div className="size-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Tag className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="border-slate-200 overflow-hidden shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-ink-950">
                  Frekuensi Kerusakan per Fasilitas &amp; Lokasi
                </CardTitle>
                <p className="text-xs text-ink-500 mt-0.5">
                  Rincian status laporan perbaikan dan kategori kerusakan paling sering dialami.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                {filteredDamageItems.length} Fasilitas
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-ink-600 font-semibold">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Fasilitas</th>
                      <th className="py-3 px-4">Lokasi</th>
                      <th className="py-3 px-4 text-center">
                        <span className="text-amber-700">Baru</span>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <span className="text-sky-700">Diproses</span>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <span className="text-emerald-700">Selesai</span>
                      </th>
                      <th className="py-3 px-4 text-center">
                        <span className="text-rose-700">Ditolak</span>
                      </th>
                      <th className="py-3 px-4 text-center">Total Aduan</th>
                      <th className="py-3 px-4">Kategori Terbanyak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDamageItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-ink-400">
                          Tidak ada laporan yang sesuai dengan kriteria filter
                        </td>
                      </tr>
                    ) : (
                      filteredDamageItems.map((item, idx) => (
                        <tr
                          key={item.facilityId}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-mono text-ink-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-semibold text-ink-950">
                            {item.facilityName}
                          </td>
                          <td className="py-3 px-4 text-ink-600">
                            {item.location}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-amber-700">
                            {item.newCount}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-sky-700">
                            {item.inProgressCount}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-emerald-700">
                            {item.resolvedCount}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-rose-700">
                            {item.rejectedCount}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-ink-950">
                            {item.totalCount}
                          </td>
                          <td className="py-3 px-4">
                            {item.topCategory !== "-" ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100">
                                <Tag className="size-3" />
                                {item.topCategory}
                              </span>
                            ) : (
                              <span className="text-ink-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
