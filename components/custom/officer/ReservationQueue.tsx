"use client";

import { useRouter } from "next/navigation";
import { FormEvent, startTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Clock3, Eye, MapPin, RotateCcw, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  formatReservationDate,
  RESERVATION_STATUS_META,
} from "@/lib/reservation-ui";

// Antrian reservasi petugas (US08/US09): filter + tabel + aksi approve/reject.
// Dipasang di app/officer/queue/page.tsx tab Reservasi. Cancel approved + detail
// menyusul di commit berikutnya.

type QueueStatus = "PENDING" | "APPROVED";
type QueueStatusFilter = QueueStatus | "ALL";

type QueueItem = {
  id: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: QueueStatus;
  createdAt: string;
  user: { id: number; name: string; email: string };
  facility: { id: number; name: string; type: string; location: string };
};

type QueueResponse = {
  success: boolean;
  data?: { reservations: QueueItem[] };
  message?: string;
};

type Filters = { status: QueueStatusFilter; facilityId: string; date: string };
const EMPTY_FILTERS: Filters = { status: "PENDING", facilityId: "", date: "" };

function buildQueueUrl(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.facilityId) params.set("facility_id", filters.facilityId);
  if (filters.date) params.set("date", filters.date);
  const query = params.toString();
  return query ? `/api/officer/reservations?${query}` : "/api/officer/reservations";
}

export default function ReservationQueue() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(buildQueueUrl(applied), { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as QueueResponse;
        if (response.status === 401) {
          router.push("/login?next=/officer/queue");
          throw new Error("Sesi telah berakhir");
        }
        if (response.status === 403) throw new Error("Hanya petugas yang bisa mengakses antrian");
        if (!response.ok || !body.success) {
          throw new Error(body.message ?? "Gagal mengambil antrian reservasi");
        }
        return body.data?.reservations ?? [];
      })
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Terjadi kesalahan saat memuat antrian",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [applied, reloadKey, router]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    startTransition(() => setApplied({ ...filters }));
  }

  function resetFilters() {
    setError(null);
    setIsLoading(true);
    setFilters(EMPTY_FILTERS);
    startTransition(() => setApplied(EMPTY_FILTERS));
  }

  function reload() {
    setError(null);
    setIsLoading(true);
    setReloadKey((v) => v + 1);
  }

  async function handleApprove(id: number) {
    if (!window.confirm("Setujui reservasi ini? Pastikan tidak bentrok.")) return;
    setActingId(id);
    try {
      const response = await fetch(`/api/officer/reservations/${id}/approve`, {
        method: "PATCH",
      });
      const body = (await response.json()) as { success: boolean; message?: string };
      if (response.status === 401) {
        router.push("/login?next=/officer/queue");
        throw new Error("Sesi telah berakhir");
      }
      if (!response.ok || !body.success) {
        throw new Error(body.message ?? "Gagal menyetujui reservasi");
      }
      toast.success("Reservasi disetujui");
      reload();
    } catch (requestError: unknown) {
      toast.error(
        requestError instanceof Error ? requestError.message : "Gagal menyetujui reservasi",
      );
    } finally {
      setActingId(null);
    }
  }

  function openReject(id: number) {
    setRejectId(id);
    setRejectReason("");
    setRejectError(null);
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rejectId === null) return;
    if (!rejectReason.trim()) {
      setRejectError("Alasan penolakan wajib diisi");
      return;
    }
    setActingId(rejectId);
    try {
      const response = await fetch(`/api/officer/reservations/${rejectId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const body = (await response.json()) as { success: boolean; message?: string };
      if (response.status === 401) {
        router.push("/login?next=/officer/queue");
        throw new Error("Sesi telah berakhir");
      }
      if (!response.ok || !body.success) {
        throw new Error(body.message ?? "Gagal menolak reservasi");
      }
      toast.success("Reservasi ditolak");
      setRejectId(null);
      reload();
    } catch (requestError: unknown) {
      setRejectError(
        requestError instanceof Error ? requestError.message : "Gagal menolak reservasi",
      );
    } finally {
      setActingId(null);
    }
  }

  const hasFilters =
    applied.status !== "PENDING" || applied.facilityId !== "" || applied.date !== "";

  return (
    <section className="space-y-6" aria-live="polite">
      <form
        onSubmit={applyFilters}
        className="grid gap-4 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
      >
        <div className="grid gap-2">
          <Label htmlFor="queue-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value as QueueStatusFilter })}
          >
            <SelectTrigger id="queue-status" className="h-11 w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="ALL">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="queue-facility">ID fasilitas</Label>
          <Input
            id="queue-facility"
            type="number"
            min={1}
            placeholder="Semua"
            className="h-11 bg-white"
            value={filters.facilityId}
            onChange={(e) => setFilters({ ...filters, facilityId: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="queue-date">Tanggal</Label>
          <Input
            id="queue-date"
            type="date"
            className="h-11 bg-white"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </div>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <Button type="submit" className="h-11 flex-1">
            Terapkan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            aria-label="Reset filter antrian"
            onClick={resetFilters}
          >
            <RotateCcw aria-hidden />
          </Button>
        </div>
      </form>

      {isLoading && <QueueSkeleton />}

      {!isLoading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="font-semibold">Antrian belum dapat dimuat</h2>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4 h-11" variant="outline" onClick={reload}>
            Coba lagi
          </Button>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50/50 px-6 py-12 text-center">
          <CalendarDays className="mx-auto size-10 text-sky-500" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-ink-950">
            {hasFilters ? "Tidak ada antrian yang sesuai filter" : "Antrian kosong"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">
            {hasFilters
              ? "Ubah filter untuk melihat antrian lainnya."
              : "Semua pengajuan reservasi sudah diproses."}
          </p>
          {hasFilters && (
            <Button className="mt-5 h-11" variant="outline" onClick={resetFilters}>
              Reset filter
            </Button>
          )}
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink-950">Daftar antrian</h2>
              <p className="text-sm text-ink-600">{items.length} pengajuan ditemukan</p>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-border bg-white md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-ink-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Pemohon</th>
                  <th className="px-4 py-3 font-medium">Fasilitas</th>
                  <th className="px-4 py-3 font-medium">Jadwal</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="max-w-56 px-4 py-4">
                      <p className="font-medium text-ink-950">{item.user.name}</p>
                      <p className="truncate text-xs text-ink-600">{item.user.email}</p>
                    </td>
                    <td className="max-w-64 px-4 py-4">
                      <p className="font-medium text-ink-950">{item.facility.name}</p>
                      <p className="truncate text-xs text-ink-600">{item.purpose}</p>
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      <p>{formatReservationDate(item.reservationDate)}</p>
                      <p className="font-mono text-xs">
                        {item.startTime}-{item.endTime}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={RESERVATION_STATUS_META[item.status].className}>
                        {RESERVATION_STATUS_META[item.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {item.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            className="h-10"
                            disabled={actingId === item.id}
                            onClick={() => handleApprove(item.id)}
                          >
                            {actingId === item.id ? "Memproses..." : "Setujui"}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 border-red-200 text-red-700 hover:bg-red-50"
                            disabled={actingId === item.id}
                            onClick={() => openReject(item.id)}
                          >
                            Tolak
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-400">Sudah diproses</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {items.map((item) => (
              <div key={item.id} className="space-y-3 rounded-2xl border border-sky-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-950">{item.facility.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-ink-600">
                      <User className="size-3.5" aria-hidden /> {item.user.name}
                    </p>
                  </div>
                  <Badge className={RESERVATION_STATUS_META[item.status].className}>
                    {RESERVATION_STATUS_META[item.status].label}
                  </Badge>
                </div>
                <div className="grid gap-1.5 text-sm text-ink-600">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-sky-500" aria-hidden />
                    {item.facility.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-sky-500" aria-hidden />
                    {formatReservationDate(item.reservationDate)}
                  </span>
                  <span className="flex items-center gap-2 font-mono">
                    <Clock3 className="size-4 text-sky-500" aria-hidden />
                    {item.startTime}-{item.endTime}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-ink-600">{item.purpose}</p>
                {item.status === "PENDING" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="h-11"
                      disabled={actingId === item.id}
                      onClick={() => handleApprove(item.id)}
                    >
                      Setujui
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 border-red-200 text-red-700"
                      disabled={actingId === item.id}
                      onClick={() => openReject(item.id)}
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={rejectId !== null} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak reservasi #{rejectId}</DialogTitle>
            <DialogDescription>
              Alasan wajib diisi dan akan terlihat pemohon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReject} className="grid gap-3">
            <Textarea
              aria-label="Alasan penolakan"
              placeholder="Contoh: Ruangan dipakai kegiatan fakultas"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-24 bg-white"
            />
            {rejectError && (
              <p role="alert" className="text-xs text-danger">
                {rejectError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRejectId(null)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={actingId !== null}
                className="border-red-200 bg-red-600 text-white hover:bg-red-700"
              >
                {actingId !== null ? "Menolak..." : "Tolak reservasi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <p className="flex items-center gap-2 text-xs text-ink-400">
        <Eye aria-hidden className="size-3.5" /> Detail reservasi + cancel approved menyusul
        commit berikutnya.
      </p>
    </section>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-4" aria-label="Memuat antrian">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}
