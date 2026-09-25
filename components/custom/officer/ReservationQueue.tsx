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
  formatReservationDateTime,
  RESERVATION_STATUS_META,
  type ReservationDetail,
} from "@/lib/reservation-ui";

// Antrian reservasi petugas (US08-US10): filter + tabel + aksi
// approve/reject/cancel + dialog detail. Dipasang di
// app/officer/queue/page.tsx tab Reservasi.

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
  conflicts: Array<{ id: number; startTime: string; endTime: string }>;
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
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ReservationDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  function openCancel(id: number) {
    setCancelId(id);
    setCancelReason("");
    setCancelError(null);
  }

  function openDetail(id: number) {
    setDetailId(id);
    setDetail(null);
    setDetailError(null);
  }

  useEffect(() => {
    if (detailId === null) return;
    const controller = new AbortController();
    fetch(`/api/reservations/${detailId}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as {
          success: boolean;
          data?: { reservation: ReservationDetail };
          message?: string;
        };
        if (response.status === 401) {
          router.push("/login?next=/officer/queue");
          throw new Error("Sesi telah berakhir");
        }
        if (!response.ok || !body.success || !body.data) {
          throw new Error(body.message ?? "Gagal mengambil detail reservasi");
        }
        return body.data.reservation;
      })
      .then((data) => {
        setDetail(data);
        setDetailError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setDetailError(
          requestError instanceof Error
            ? requestError.message
            : "Terjadi kesalahan saat memuat detail",
        );
      });
    return () => controller.abort();
  }, [detailId, router]);

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

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cancelId === null) return;
    if (!cancelReason.trim()) {
      setCancelError("Alasan pembatalan wajib diisi");
      return;
    }
    setActingId(cancelId);
    try {
      const response = await fetch(`/api/officer/reservations/${cancelId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      const body = (await response.json()) as { success: boolean; message?: string };
      if (response.status === 401) {
        router.push("/login?next=/officer/queue");
        throw new Error("Sesi telah berakhir");
      }
      if (!response.ok || !body.success) {
        throw new Error(body.message ?? "Gagal membatalkan reservasi");
      }
      toast.success("Reservasi dibatalkan petugas");
      setCancelId(null);
      reload();
    } catch (requestError: unknown) {
      setCancelError(
        requestError instanceof Error ? requestError.message : "Gagal membatalkan reservasi",
      );
    } finally {
      setActingId(null);
    }
  }

  const hasFilters =
    applied.status !== "PENDING" || applied.facilityId !== "" || applied.date !== "";
  const conflictCount = items.filter((item) => item.conflicts.length > 0).length;

  return (
    <section className="space-y-6" aria-live="polite">
      <form
        onSubmit={applyFilters}
        className="grid gap-4 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end"
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
        <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
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
            {conflictCount > 0 && (
              <Badge className="border-red-200 bg-red-50 text-red-700">
                {conflictCount} jadwal bentrok
              </Badge>
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-white xl:block">
            <table className="w-full min-w-[960px] text-sm">
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
                  <tr
                    key={item.id}
                    className={
                      item.conflicts.length > 0
                        ? "bg-red-50/60 hover:bg-red-50"
                        : "hover:bg-slate-50/70"
                    }
                  >
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
                      {item.conflicts.length > 0 && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          Bentrok dengan {item.conflicts
                            .map(
                              (conflict) =>
                                `#${conflict.id} (${conflict.startTime}-${conflict.endTime})`,
                            )
                            .join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <Badge className={RESERVATION_STATUS_META[item.status].className}>
                          {RESERVATION_STATUS_META[item.status].label}
                        </Badge>
                        {item.conflicts.length > 0 && (
                          <Badge className="border-red-200 bg-red-50 text-red-700">
                            Jadwal bentrok
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="h-10"
                          onClick={() => openDetail(item.id)}
                        >
                          <Eye aria-hidden /> Detail
                        </Button>
                        {item.status === "PENDING" && (
                          <>
                            <Button
                              className="h-10"
                              disabled={actingId === item.id || item.conflicts.length > 0}
                              title={
                                item.conflicts.length > 0
                                  ? "Tidak dapat disetujui karena jadwal bentrok"
                                  : undefined
                              }
                              onClick={() => handleApprove(item.id)}
                            >
                              {item.conflicts.length > 0
                                ? "Bentrok"
                                : actingId === item.id
                                  ? "Memproses..."
                                  : "Setujui"}
                            </Button>
                            <Button
                              variant="outline"
                              className="h-10 border-red-200 text-red-700 hover:bg-red-50"
                              disabled={actingId === item.id}
                              onClick={() => openReject(item.id)}
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        {item.status === "APPROVED" && (
                          <Button
                            variant="outline"
                            className="h-10 border-red-200 text-red-700 hover:bg-red-50"
                            disabled={actingId === item.id}
                            onClick={() => openCancel(item.id)}
                          >
                            Batalkan
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 xl:hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className={
                  item.conflicts.length > 0
                    ? "space-y-3 rounded-2xl border border-red-200 bg-red-50/60 p-4"
                    : "space-y-3 rounded-2xl border border-sky-100 bg-white p-4"
                }
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-ink-950">{item.facility.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-ink-600">
                      <User className="size-3.5 shrink-0" aria-hidden />
                      <span className="min-w-0 break-words">{item.user.name}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-start gap-1.5 sm:flex-col sm:items-end">
                    <Badge className={RESERVATION_STATUS_META[item.status].className}>
                      {RESERVATION_STATUS_META[item.status].label}
                    </Badge>
                    {item.conflicts.length > 0 && (
                      <Badge className="border-red-200 bg-red-50 text-red-700">
                        Jadwal bentrok
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid gap-1.5 text-sm text-ink-600">
                  <span className="flex min-w-0 items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-sky-500" aria-hidden />
                    <span className="min-w-0 break-words">{item.facility.location}</span>
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
                {item.conflicts.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-white/70 p-3 text-xs text-red-700">
                    <p className="font-semibold">Tidak dapat disetujui</p>
                    <p className="mt-1">
                      Bentrok dengan {item.conflicts
                        .map(
                          (conflict) =>
                            `#${conflict.id} (${conflict.startTime}-${conflict.endTime})`,
                        )
                        .join(", ")}.
                    </p>
                  </div>
                )}
                <p className="line-clamp-2 text-sm leading-6 text-ink-600">{item.purpose}</p>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => openDetail(item.id)}
                  >
                    <Eye aria-hidden /> Lihat detail
                  </Button>
                  {item.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="h-11"
                        disabled={actingId === item.id || item.conflicts.length > 0}
                        title={
                          item.conflicts.length > 0
                            ? "Tidak dapat disetujui karena jadwal bentrok"
                            : undefined
                        }
                        onClick={() => handleApprove(item.id)}
                      >
                        {item.conflicts.length > 0 ? "Bentrok" : "Setujui"}
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
                  {item.status === "APPROVED" && (
                    <Button
                      variant="outline"
                      className="h-11 w-full border-red-200 text-red-700"
                      disabled={actingId === item.id}
                      onClick={() => openCancel(item.id)}
                    >
                      Batalkan reservasi
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={rejectId !== null} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
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

      <Dialog open={cancelId !== null} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Batalkan reservasi #{cancelId}</DialogTitle>
            <DialogDescription>
              Reservasi approved yang dibatalkan butuh alasan (mis. fasilitas
              mendadak tidak layak). Alasan terlihat pemohon.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCancel} className="grid gap-3">
            <Textarea
              aria-label="Alasan pembatalan"
              placeholder="Contoh: AC rusak mendadak, ruangan tidak layak pakai"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-24 bg-white"
            />
            {cancelError && (
              <p role="alert" className="text-xs text-danger">
                {cancelError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCancelId(null)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={actingId !== null}
                className="border-red-200 bg-red-600 text-white hover:bg-red-700"
              >
                {actingId !== null ? "Membatalkan..." : "Batalkan reservasi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailId !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail reservasi #{detailId}</DialogTitle>
            <DialogDescription>
              Informasi lengkap pengajuan untuk keputusan petugas.
            </DialogDescription>
          </DialogHeader>
          {detailError && (
            <p role="alert" className="text-sm text-danger">
              {detailError}
            </p>
          )}
          {!detailError && !detail && (
            <div className="space-y-2" aria-label="Memuat detail">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          )}
          {detail && (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-ink-400">Pemohon</dt>
                <dd className="font-medium text-ink-950">
                  {items.find((i) => i.id === detailId)?.user.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Fasilitas</dt>
                <dd className="font-medium text-ink-950">
                  {detail.facility.name} · {detail.facility.location} (kapasitas{" "}
                  {detail.facility.capacity})
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Jadwal</dt>
                <dd className="font-medium text-ink-950">
                  {formatReservationDate(detail.reservationDate)} ·{" "}
                  <span className="font-mono">
                    {detail.startTime}-{detail.endTime}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-ink-400">Tujuan</dt>
                <dd className="leading-6 text-ink-950">{detail.purpose}</dd>
              </div>
              <div>
                <dt className="text-ink-400">Status</dt>
                <dd>
                  <Badge className={RESERVATION_STATUS_META[detail.status].className}>
                    {RESERVATION_STATUS_META[detail.status].label}
                  </Badge>
                </dd>
              </div>
              {detail.cancellationReason && (
                <div>
                  <dt className="text-ink-400">Alasan pembatalan/penolakan</dt>
                  <dd className="leading-6 text-ink-950">{detail.cancellationReason}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink-400">Diajukan</dt>
                <dd className="text-ink-600">{formatReservationDateTime(detail.createdAt)}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
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
