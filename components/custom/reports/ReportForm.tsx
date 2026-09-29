"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_CATEGORIES } from "@/lib/validations/report";

type FacilityOption = {
  id: number;
  name: string;
  location: string;
  type: string;
};

interface ReportFormProps {
  facilities: FacilityOption[];
  preselectedFacilityId?: number;
}

export default function ReportForm({
  facilities,
  preselectedFacilityId,
}: ReportFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [facilityId, setFacilityId] = useState<string>(
    preselectedFacilityId ? String(preselectedFacilityId) : ""
  );
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleFileChange(file: File | undefined | null) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Format file harus JPG, PNG, atau WEBP",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: "Ukuran foto maksimal 5 MB",
      }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });

    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  function removePhoto() {
    setPhotoFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!facilityId) {
      newErrors.facilityId = "Silakan pilih fasilitas yang rusak";
    }
    if (!category) {
      newErrors.category = "Silakan pilih kategori kerusakan";
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Deskripsi kerusakan minimal 10 karakter";
    }
    if (!photoFile) {
      newErrors.photo = "Foto bukti fisik kerusakan wajib diunggah";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Harap periksa kembali form pelaporan Anda");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("facility_id", facilityId);
      formData.append("category", category);
      formData.append("description", description.trim());
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal membuat laporan");
      }

      toast.success("Laporan kerusakan berhasil dikirim!", {
        description: "Petugas akan segera meninjau dan menindaklanjuti laporan Anda.",
      });

      router.push("/reports");
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengirim laporan";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="space-y-6 pt-6">
          {/* Pilih Fasilitas */}
          <div className="space-y-2">
            <Label htmlFor="facility_id" className="text-sm font-semibold text-ink-950">
              Pilih Fasilitas / Ruangan <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="facility_id"
                value={facilityId}
                onChange={(e) => {
                  setFacilityId(e.target.value);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.facilityId;
                    return next;
                  });
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink-950 shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              >
                <option value="">-- Pilih Fasilitas Kampus --</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.location} • {fac.type})
                  </option>
                ))}
              </select>
            </div>
            {errors.facilityId && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="size-3.5" />
                {errors.facilityId}
              </p>
            )}
          </div>

          {/* Kategori Kerusakan */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-ink-950">
              Kategori Kerusakan <span className="text-rose-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {REPORT_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.category;
                        return next;
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-brand-500 text-white shadow-xs"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-ink-950"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="size-3.5" />}
                    {cat}
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="size-3.5" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Deskripsi Kerusakan */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description" className="text-sm font-semibold text-ink-950">
                Deskripsi Kerusakan <span className="text-rose-500">*</span>
              </Label>
              <span className="text-xs text-ink-400">
                {description.length}/2000 karakter
              </span>
            </div>
            <Textarea
              id="description"
              rows={4}
              placeholder="Jelaskan secara rinci kerusakan yang terjadi, misalnya: 'Lampu utama sisi kiri berkedip terus dan stop kontak baris ketiga mati total...'"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim().length >= 10) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.description;
                    return next;
                  });
                }
              }}
              className="resize-y rounded-xl border-slate-300 focus-visible:ring-brand-500/20"
            />
            {errors.description && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="size-3.5" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Upload Foto Bukti */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-ink-950">
              Foto Bukti Kerusakan <span className="text-rose-500">*</span>
            </Label>
            <p className="text-xs text-ink-500">
              Unggah 1 foto jelas yang menampilkan bagian yang rusak (JPG, PNG, atau WEBP maks 5 MB).
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange(e.dataTransfer.files?.[0]);
                }}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-xs group-hover:text-brand-600 group-hover:shadow-sm">
                  <Upload className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-950">
                    Klik untuk memilih foto atau seret ke sini
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    JPG, PNG, atau WEBP hingga 5 MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <Image
                    src={previewUrl}
                    alt="Preview foto kerusakan"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-ink-950 truncate">
                    {photoFile?.name}
                  </p>
                  <p className="text-xs text-ink-500">
                    {photoFile ? (photoFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 className="size-3" /> Siap diunggah
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removePhoto}
                  className="rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Hapus foto"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}

            {errors.photo && (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                <AlertCircle className="size-3.5" />
                {errors.photo}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-full"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-brand-500 hover:bg-brand-600 text-white min-w-32"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Laporan"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
