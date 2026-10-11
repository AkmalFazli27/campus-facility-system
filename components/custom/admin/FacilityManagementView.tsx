"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Edit2,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type AdminFacility = {
  id: number;
  name: string;
  type: string;
  location: string;
  capacity: number;
  description: string | null;
  status: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
  createdAt?: Date | string;
};

export default function FacilityManagementView({
  initialFacilities,
}: {
  initialFacilities: AdminFacility[];
}) {
  const router = useRouter();
  const [facilities, setFacilities] = useState<AdminFacility[]>(initialFacilities);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<AdminFacility | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCapacity, setFormCapacity] = useState<number | string>(30);
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE">("ACTIVE");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Unique facility types for filter
  const types = Array.from(new Set(facilities.map((f) => f.type))).filter(Boolean);

  // Metrics
  const activeCount = facilities.filter((f) => f.status === "ACTIVE").length;
  const maintenanceCount = facilities.filter((f) => f.status === "UNDER_MAINTENANCE").length;
  const inactiveCount = facilities.filter((f) => f.status === "INACTIVE").length;

  function resetForm() {
    setFormName("");
    setFormType("");
    setFormLocation("");
    setFormCapacity(30);
    setFormDescription("");
    setFormStatus("ACTIVE");
    setEditingFacility(null);
  }

  function openCreateModal() {
    resetForm();
    setIsCreateOpen(true);
  }

  function openEditModal(facility: AdminFacility) {
    setEditingFacility(facility);
    setFormName(facility.name);
    setFormType(facility.type);
    setFormLocation(facility.location);
    setFormCapacity(facility.capacity);
    setFormDescription(facility.description || "");
    setFormStatus(facility.status);
    setIsCreateOpen(true);
  }

  async function handleSubmitFacility(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formName.trim()) return toast.error("Nama fasilitas wajib diisi");
    if (!formType.trim()) return toast.error("Tipe fasilitas wajib diisi");
    if (!formLocation.trim()) return toast.error("Lokasi fasilitas wajib diisi");
    const capNum = Number(formCapacity);
    if (isNaN(capNum) || capNum < 0) return toast.error("Kapasitas harus berupa angka positif");

    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        type: formType.trim(),
        location: formLocation.trim(),
        capacity: capNum,
        description: formDescription.trim() || undefined,
        status: formStatus,
      };

      if (editingFacility) {
        // Edit existing
        const res = await fetch(`/api/facilities/${editingFacility.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memperbarui fasilitas");

        toast.success(`Fasilitas "${payload.name}" berhasil diperbarui!`);
        setFacilities((prev) =>
          prev.map((f) => (f.id === editingFacility.id ? data.data.facility : f))
        );
      } else {
        // Create new
        const res = await fetch("/api/facilities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal membuat fasilitas baru");

        toast.success(`Fasilitas "${payload.name}" berhasil ditambahkan!`);
        setFacilities((prev) => [data.data.facility, ...prev]);
      }

      setIsCreateOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(
    facility: AdminFacility,
    newStatus: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE"
  ) {
    if (facility.status === newStatus || processingId) return;
    setProcessingId(facility.id);
    try {
      const res = await fetch(`/api/facilities/${facility.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengubah status fasilitas");

      toast.success(
        `Status ${facility.name} diubah menjadi ${
          newStatus === "ACTIVE"
            ? "Aktif"
            : newStatus === "UNDER_MAINTENANCE"
            ? "Perbaikan"
            : "Nonaktif"
        }`
      );
      setFacilities((prev) =>
        prev.map((f) => (f.id === facility.id ? { ...f, status: newStatus } : f))
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(facility: AdminFacility) {
    if (
      !confirm(
        `Apakah Anda yakin ingin menonaktifkan atau menghapus fasilitas "${facility.name}"?`
      )
    ) {
      return;
    }

    setProcessingId(facility.id);
    try {
      const res = await fetch(`/api/facilities/${facility.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memproses penghapusan");

      toast.success(data.data?.message || "Fasilitas berhasil dinonaktifkan/dihapus");
      if (data.data?.facility) {
        setFacilities((prev) =>
          prev.map((f) => (f.id === facility.id ? data.data.facility : f))
        );
      } else {
        setFacilities((prev) => prev.filter((f) => f.id !== facility.id));
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredFacilities = facilities.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q);
    const matchType = !typeFilter || f.type === typeFilter;
    const matchStatus = !statusFilter || f.status === statusFilter;
    return matchQuery && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-500">Total Fasilitas</p>
              <p className="text-2xl font-bold text-ink-950 mt-1">
                {facilities.length}
              </p>
              <p className="text-[11px] text-ink-400 mt-0.5">Master sarana prasarana</p>
            </div>
            <div className="size-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-500">Fasilitas Aktif</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {activeCount}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                Dapat dipesan civitas
              </p>
            </div>
            <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-500">Dalam Perbaikan</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {maintenanceCount}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                Terkunci dari reservasi
              </p>
            </div>
            <div className="size-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-ink-500">Nonaktif</p>
              <p className="text-2xl font-bold text-slate-700 mt-1">
                {inactiveCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Riwayat tetap aman
              </p>
            </div>
            <div className="size-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <ShieldAlert className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Action Bar */}
      <Card className="border-slate-200 shadow-2xs p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
              <Input
                placeholder="Cari nama atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
              />
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Semua Tipe Fasilitas</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Semua Status Operasional</option>
                <option value="ACTIVE">Aktif (ACTIVE)</option>
                <option value="UNDER_MAINTENANCE">Perbaikan (MAINTENANCE)</option>
                <option value="INACTIVE">Nonaktif (INACTIVE)</option>
              </select>
            </div>
          </div>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 shadow-sm shrink-0"
          >
            <Plus className="size-4 mr-1.5" />
            Tambah Fasilitas Baru
          </Button>
        </div>
      </Card>

      {/* Facilities Table Card */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-ink-950 flex items-center gap-2">
              <Building2 className="size-4 text-brand-600" />
              Master Data Fasilitas Kampus
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Kelola status ruang kelas, laboratorium, dan aula. Fasilitas nonaktif atau dalam perbaikan otomatis tidak dapat dipesan civitas.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {filteredFacilities.length} Fasilitas
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-ink-600 font-semibold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Fasilitas</th>
                  <th className="py-3.5 px-4">Tipe</th>
                  <th className="py-3.5 px-4">Lokasi Gedung</th>
                  <th className="py-3.5 px-4 text-center">Kapasitas</th>
                  <th className="py-3.5 px-4 text-center">Status Operasional</th>
                  <th className="py-3.5 px-4 text-center">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFacilities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-400">
                      Tidak ada fasilitas yang sesuai dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredFacilities.map((f, idx) => {
                    const isProcessing = processingId === f.id;

                    return (
                      <tr
                        key={f.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-ink-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-sm text-ink-950 block">
                              {f.name}
                            </span>
                            {f.description && (
                              <span className="text-[11px] text-ink-500 line-clamp-1">
                                {f.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {f.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-ink-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3 text-ink-400" />
                            {f.location}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-ink-800">
                          {f.capacity} org
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={f.status}
                            disabled={isProcessing}
                            onChange={(e) =>
                              handleStatusChange(
                                f,
                                e.target.value as "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE"
                              )
                            }
                            className={cn(
                              "h-7 rounded-lg px-2 text-[11px] font-semibold border shadow-2xs cursor-pointer focus:outline-none",
                              f.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : f.status === "UNDER_MAINTENANCE"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            <option value="ACTIVE">Aktif (ACTIVE)</option>
                            <option value="UNDER_MAINTENANCE">Perbaikan (MAINTENANCE)</option>
                            <option value="INACTIVE">Nonaktif (INACTIVE)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(f)}
                              className="size-8 p-0 rounded-lg text-ink-600 hover:bg-slate-100 hover:text-ink-950"
                              title="Edit Fasilitas"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Link
                              href={`/facilities/${f.id}`}
                              target="_blank"
                              className="size-8 inline-flex items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50"
                              title="Lihat Ketersediaan Publik"
                            >
                              <ExternalLink className="size-3.5" />
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(f)}
                              disabled={isProcessing}
                              className="size-8 p-0 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              title="Hapus atau Nonaktifkan"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal / Dialog Tambah & Edit Fasilitas */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-ink-950">
                  {editingFacility ? "Edit Data Fasilitas" : "Tambah Fasilitas Baru"}
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">
                  Lengkapi data sarana prasarana untuk dipublikasikan pada sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="size-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-slate-100 hover:text-ink-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFacility} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="facility-name" className="text-xs font-semibold text-ink-700">
                  Nama Fasilitas
                </Label>
                <Input
                  id="facility-name"
                  placeholder="Contoh: Ruang Seminar A, Lab Komputer 3"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="facility-type" className="text-xs font-semibold text-ink-700">
                    Tipe / Kategori
                  </Label>
                  <Input
                    id="facility-type"
                    placeholder="Contoh: Ruang Kelas, Lab, Aula"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="facility-capacity" className="text-xs font-semibold text-ink-700">
                    Kapasitas (Orang)
                  </Label>
                  <Input
                    id="facility-capacity"
                    type="number"
                    min="0"
                    placeholder="30"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facility-loc" className="text-xs font-semibold text-ink-700">
                  Lokasi Gedung / Ruang
                </Label>
                <Input
                  id="facility-loc"
                  placeholder="Contoh: Gedung Dekanat, Lantai 3"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facility-status" className="text-xs font-semibold text-ink-700">
                  Status Operasional Awal
                </Label>
                <select
                  id="facility-status"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(
                      e.target.value as "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE"
                    )
                  }
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ACTIVE">Aktif (Dapat Dipesan)</option>
                  <option value="UNDER_MAINTENANCE">Dalam Perbaikan (Terkunci)</option>
                  <option value="INACTIVE">Nonaktif (Disembunyikan)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facility-desc" className="text-xs font-semibold text-ink-700">
                  Deskripsi &amp; Sarana Pendukung (Opsional)
                </Label>
                <textarea
                  id="facility-desc"
                  rows={3}
                  placeholder="Contoh: Dilengkapi proyektor 4K, 40 PC Core i7, AC sentral, dan whiteboard."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-9 rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 shadow-sm"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingFacility
                    ? "Simpan Perubahan"
                    : "Tambahkan Fasilitas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
