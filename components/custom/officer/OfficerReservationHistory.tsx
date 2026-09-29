"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { CalendarDays, Eye, RotateCcw, Search } from "lucide-react";
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
import {
  formatReservationDate,
  formatReservationDateTime,
  RESERVATION_STATUSES,
  RESERVATION_STATUS_META,
  type ReservationStatusFilter,
} from "@/lib/reservation-ui";

type HistoryItem = {
  id: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: (typeof RESERVATION_STATUSES)[number];
  cancellationReason: string | null;
  createdAt: string;
  processedAt: string | null;
  user: { id: number; name: string; email: string };
  officer: { id: number; name: string } | null;
  facility: { id: number; name: string; type: string; location: string };
};

type Filters = { status: ReservationStatusFilter; from: string; to: string };
type HistoryResponse = {
  success: boolean;
  data?: { reservations: HistoryItem[]; total: number; page: number; pageSize: number };
  message?: string;
};

const EMPTY_FILTERS: Filters = { status: "ALL", from: "", to: "" };

function buildHistoryUrl(filters: Filters, page: number): string {
  const params = new URLSearchParams();
  if (filters.status !== "ALL") params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  params.set("page", String(page));
  return `/api/officer/reservations/history?${params}`;
}

export default function OfficerReservationHistory() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(buildHistoryUrl(applied, page), { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as HistoryResponse;
        if (response.status === 401) {
          router.push("/login?next=/officer/reservations/history");
          throw new Error("Sesi telah berakhir");
        }
        if (!response.ok || !body.success || !body.data) {
          throw new Error(body.message ?? "Gagal mengambil riwayat peminjaman");
        }
        return body.data;
      })
      .then((data) => {
        setItems(data.reservations);
        setTotal(data.total);
        setPageSize(data.pageSize);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setError(requestError instanceof Error ? requestError.message : "Gagal memuat riwayat");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [applied, page, reloadKey, router]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filters.from && filters.to && filters.from > filters.to) {
      setFilterError("Tanggal awal tidak boleh setelah tanggal akhir");
      return;
    }
    setFilterError(null);
    setIsLoading(true);
    setPage(1);
    setApplied({ ...filters });
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
    setFilterError(null);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }

  function changePage(next: number) {
    setSelected(null);
    setIsLoading(true);
    setPage(next);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = applied.status !== "ALL" || applied.from !== "" || applied.to !== "";

  return (
    <section className="space-y-6" aria-live="polite">
      <form
        onSubmit={applyFilters}
        className="grid gap-4 rounded-3xl border border-sky-100 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end"
      >
        <div className="grid gap-2">
          <Label htmlFor="history-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(status) => setFilters({ ...filters, status: status as ReservationStatusFilter })}
          >
            <SelectTrigger id="history-status" className="h-11 w-full bg-white">
              <SelectValue>
                {(value) => value === "ALL"
                  ? "Semua status"
                  : RESERVATION_STATUS_META[value as HistoryItem["status"]].label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua status</SelectItem>
              {RESERVATION_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {RESERVATION_STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="history-from">Tanggal pakai dari</Label>
          <Input
            id="history-from"
            type="date"
            className="h-11 bg-white"
            value={filters.from}
            aria-invalid={Boolean(filterError)}
            onChange={(event) => setFilters({ ...filters, from: event.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="history-to">Tanggal pakai sampai</Label>
          <Input
            id="history-to"
            type="date"
            className="h-11 bg-white"
            value={filters.to}
            aria-invalid={Boolean(filterError)}
            onChange={(event) => setFilters({ ...filters, to: event.target.value })}
          />
        </div>
        <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
          <Button type="submit" className="h-11 flex-1"><Search aria-hidden /> Terapkan</Button>
          <Button type="button" variant="outline" size="icon" className="size-11"
            aria-label="Reset filter riwayat" onClick={resetFilters}>
            <RotateCcw aria-hidden />
          </Button>
        </div>
        {filterError && <p role="alert" className="text-sm text-danger sm:col-span-2 xl:col-span-4">{filterError}</p>}
      </form>

      {isLoading && <div className="space-y-3" aria-label="Memuat riwayat">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>}

      {!isLoading && error && (
        <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-semibold">Riwayat belum dapat dimuat</p>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" variant="outline" onClick={() => {
            setIsLoading(true);
            setReloadKey((key) => key + 1);
          }}>Coba lagi</Button>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-sky-200 bg-sky-50/50 px-6 py-12 text-center">
          <CalendarDays aria-hidden className="mx-auto size-10 text-sky-500" />
          <h2 className="mt-4 text-xl font-semibold text-ink-950">
            {hasFilters ? "Tidak ada riwayat sesuai filter" : "Belum ada reservasi"}
          </h2>
          <p className="mt-2 text-sm text-ink-600">Pengajuan dari seluruh pemohon akan muncul di sini.</p>
          {hasFilters && <Button className="mt-4" variant="outline" onClick={resetFilters}>Reset filter</Button>}
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <>
          <div>
            <h2 className="text-xl font-semibold text-ink-950">Semua reservasi</h2>
            <p className="text-sm text-ink-600">{total} pengajuan · terbaru lebih dulu</p>
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-white lg:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-slate-50 text-left text-ink-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Pemohon</th>
                  <th className="px-4 py-3 font-medium">Fasilitas</th>
                  <th className="px-4 py-3 font-medium">Jadwal</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Diajukan</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 font-medium text-ink-950">{item.user.name}</td>
                    <td className="px-4 py-4 text-ink-600">{item.facility.name}</td>
                    <td className="px-4 py-4 text-ink-600">
                      {formatReservationDate(item.reservationDate)}
                      <span className="block font-mono text-xs">{item.startTime}–{item.endTime}</span>
                    </td>
                    <td className="px-4 py-4"><Badge className={RESERVATION_STATUS_META[item.status].className}>
                      {RESERVATION_STATUS_META[item.status].label}
                    </Badge></td>
                    <td className="px-4 py-4 text-ink-600">{formatReservationDateTime(item.createdAt)} WIB</td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" onClick={() => setSelected(item)}><Eye aria-hidden /> Detail</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 lg:hidden">
            {items.map((item) => (
              <div key={item.id} className="space-y-3 rounded-2xl border border-sky-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink-950">{item.facility.name}</p>
                    <p className="text-sm text-ink-600">{item.user.name}</p>
                  </div>
                  <Badge className={RESERVATION_STATUS_META[item.status].className}>
                    {RESERVATION_STATUS_META[item.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-ink-600">
                  {formatReservationDate(item.reservationDate)} · {item.startTime}–{item.endTime}
                </p>
                <p className="text-xs text-ink-500">Diajukan {formatReservationDateTime(item.createdAt)} WIB</p>
                <Button variant="outline" className="w-full" onClick={() => setSelected(item)}>
                  <Eye aria-hidden /> Lihat detail
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <nav aria-label="Halaman riwayat" className="flex items-center justify-between gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => changePage(page - 1)}>Sebelumnya</Button>
          <span className="text-sm text-ink-600">Halaman {page} dari {totalPages}</span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Berikutnya</Button>
        </nav>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail reservasi #{selected?.id}</DialogTitle>
            <DialogDescription>Informasi pengajuan dan keputusan peminjaman.</DialogDescription>
          </DialogHeader>
          {selected && (
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-ink-500">Pemohon</dt><dd className="font-medium text-ink-950">
                {selected.user.name} · {selected.user.email}
              </dd></div>
              <div><dt className="text-ink-500">Fasilitas</dt><dd className="font-medium text-ink-950">
                {selected.facility.name} · {selected.facility.type} · {selected.facility.location}
              </dd></div>
              <div><dt className="text-ink-500">Jadwal peminjaman</dt><dd className="font-medium text-ink-950">
                {formatReservationDate(selected.reservationDate)} · {selected.startTime}–{selected.endTime} WIB
              </dd></div>
              <div><dt className="text-ink-500">Tujuan</dt><dd className="whitespace-pre-wrap text-ink-950">{selected.purpose}</dd></div>
              <div><dt className="text-ink-500">Status</dt><dd><Badge className={RESERVATION_STATUS_META[selected.status].className}>
                {RESERVATION_STATUS_META[selected.status].label}
              </Badge></dd></div>
              {selected.cancellationReason && (
                <div><dt className="text-ink-500">Alasan pembatalan/penolakan</dt>
                  <dd className="whitespace-pre-wrap text-ink-950">{selected.cancellationReason}</dd></div>
              )}
              <div><dt className="text-ink-500">Diajukan</dt><dd className="text-ink-950">
                {formatReservationDateTime(selected.createdAt)} WIB
              </dd></div>
              {selected.processedAt && (
                <div><dt className="text-ink-500">Diproses</dt><dd className="text-ink-950">
                  {formatReservationDateTime(selected.processedAt)} WIB
                </dd></div>
              )}
              {selected.officer && (
                <div><dt className="text-ink-500">Petugas pemroses</dt><dd className="text-ink-950">
                  {selected.officer.name}
                </dd></div>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
