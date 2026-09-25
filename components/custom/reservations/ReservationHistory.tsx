"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, startTransition, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Eye,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import ReservationDetailDialog from "@/components/custom/reservations/ReservationDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  buildReservationHistoryUrl,
  formatReservationDate,
  RESERVATION_STATUS_META,
  RESERVATION_STATUSES,
  type ReservationFilters,
  type ReservationStatusFilter,
  type ReservationSummary,
} from "@/lib/reservation-ui";
import { cn } from "@/lib/utils";

type ReservationsResponse = {
  success: boolean;
  data?: { reservations: ReservationSummary[] };
  message?: string;
};

const EMPTY_FILTERS: ReservationFilters = { status: "ALL", from: "", to: "" };

export default function ReservationHistory() {
  const router = useRouter();
  const [filters, setFilters] = useState<ReservationFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ReservationFilters>(EMPTY_FILTERS);
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(buildReservationHistoryUrl(appliedFilters), { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as ReservationsResponse;
        if (response.status === 401) {
          router.push("/login?next=/reservations");
          throw new Error("Sesi telah berakhir");
        }
        if (!response.ok || !body.success) {
          throw new Error(body.message ?? "Gagal mengambil riwayat reservasi");
        }
        return body.data?.reservations ?? [];
      })
      .then((data) => {
        setReservations(data);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Terjadi kesalahan saat memuat reservasi",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [appliedFilters, reloadKey, router]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filters.from && filters.to && filters.from > filters.to) {
      setFilterError("Tanggal awal tidak boleh setelah tanggal akhir");
      return;
    }

    setFilterError(null);
    setError(null);
    setIsLoading(true);
    startTransition(() => setAppliedFilters({ ...filters }));
  }

  function resetFilters() {
    setFilterError(null);
    setError(null);
    setIsLoading(true);
    setFilters(EMPTY_FILTERS);
    startTransition(() => setAppliedFilters(EMPTY_FILTERS));
  }

  function retry() {
    setError(null);
    setIsLoading(true);
    setReloadKey((value) => value + 1);
  }

  function isCancellable(status: ReservationSummary["status"]) {
    return status === "PENDING" || status === "APPROVED";
  }

  async function handleCancel(id: number) {
    if (!window.confirm("Batalkan reservasi ini? Aksi ini tidak bisa dibatalkan.")) return;
    setCancellingId(id);
    setCancelError(null);
    try {
      const response = await fetch(`/api/reservations/${id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await response.json()) as { success: boolean; message?: string };
      if (response.status === 401) {
        router.push("/login?next=/reservations");
        throw new Error("Sesi telah berakhir");
      }
      if (!response.ok || !body.success) {
        throw new Error(body.message ?? "Gagal membatalkan reservasi");
      }
      setSelectedReservationId(null);
      setReloadKey((value) => value + 1);
    } catch (requestError: unknown) {
      setCancelError(
        requestError instanceof Error
          ? requestError.message
          : "Terjadi kesalahan saat membatalkan reservasi",
      );
    } finally {
      setCancellingId(null);
    }
  }

  const hasFilters =
    appliedFilters.status !== "ALL" || appliedFilters.from !== "" || appliedFilters.to !== "";

  return (
    <section className="space-y-6" aria-live="polite">
      <form
        onSubmit={applyFilters}
        className="grid gap-4 rounded-3xl border border-brand-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_auto] lg:items-end"
      >
        <div className="grid gap-2">
          <Label htmlFor="reservation-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value as ReservationStatusFilter })
            }
          >
            <SelectTrigger id="reservation-status" className="h-11 w-full bg-white">
              <SelectValue>
                {(value) =>
                  value === "ALL"
                    ? "Semua status"
                    : RESERVATION_STATUS_META[value as keyof typeof RESERVATION_STATUS_META]
                        .label
                }
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
          <Label htmlFor="reservation-from">Tanggal awal</Label>
          <Input
            id="reservation-from"
            type="date"
            className="h-11 bg-white"
            value={filters.from}
            aria-invalid={Boolean(filterError)}
            onChange={(event) => setFilters({ ...filters, from: event.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reservation-to">Tanggal akhir</Label>
          <Input
            id="reservation-to"
            type="date"
            className="h-11 bg-white"
            value={filters.to}
            aria-invalid={Boolean(filterError)}
            onChange={(event) => setFilters({ ...filters, to: event.target.value })}
          />
        </div>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <Button type="submit" className="h-11 flex-1 bg-brand-500 hover:bg-brand-600">
            <Search aria-hidden /> Terapkan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            aria-label="Reset filter reservasi"
            onClick={resetFilters}
          >
            <RotateCcw aria-hidden />
          </Button>
        </div>

        {filterError && (
          <p className="text-sm text-danger sm:col-span-2 lg:col-span-4" role="alert">
            {filterError}
          </p>
        )}
      </form>

      {isLoading && <ReservationListSkeleton />}

      {!isLoading && error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="font-semibold">Riwayat reservasi belum dapat dimuat</h2>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4 h-11" variant="outline" onClick={retry}>
            Coba lagi
          </Button>
        </div>
      )}

      {!isLoading && !error && reservations.length === 0 && (
        <div className="rounded-3xl border border-dashed border-brand-100 bg-brand-50/50 px-6 py-12 text-center">
          <CalendarDays className="mx-auto size-10 text-brand-500" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-ink-950">
            {hasFilters ? "Tidak ada reservasi yang sesuai filter" : "Belum ada reservasi"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600">
            {hasFilters
              ? "Ubah rentang tanggal atau status untuk melihat reservasi lainnya."
              : "Reservasi yang kamu ajukan akan muncul di sini beserta status persetujuannya."}
          </p>
          {hasFilters ? (
            <Button className="mt-5 h-11" variant="outline" onClick={resetFilters}>
              Reset filter
            </Button>
          ) : (
            <Link
              href="/facilities"
              className={cn(buttonVariants(), "mt-5 h-11 bg-brand-500 hover:bg-brand-600")}
            >
              Cari fasilitas
            </Link>
          )}
        </div>
      )}

      {!isLoading && !error && reservations.length > 0 && (
        <>
          {cancelError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              {cancelError}
            </div>
          )}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink-950">Daftar reservasi</h2>
              <p className="text-sm text-ink-600">{reservations.length} reservasi ditemukan</p>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-border bg-white md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-ink-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Fasilitas</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-slate-50/70">
                    <td className="max-w-72 px-4 py-4">
                      <p className="font-medium text-ink-950">{reservation.facility.name}</p>
                      <p className="truncate text-xs text-ink-600">{reservation.purpose}</p>
                    </td>
                    <td className="px-4 py-4 text-ink-600">
                      {formatReservationDate(reservation.reservationDate)}
                    </td>
                    <td className="px-4 py-4 font-mono text-ink-600">
                      {reservation.startTime}-{reservation.endTime}
                    </td>
                    <td className="px-4 py-4">
                      <ReservationStatusBadge status={reservation.status} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="h-11"
                          onClick={() => setSelectedReservationId(reservation.id)}
                        >
                          <Eye aria-hidden /> Lihat detail
                        </Button>
                        {isCancellable(reservation.status) && (
                          <Button
                            variant="outline"
                            className="h-11 border-red-200 text-red-700 hover:bg-red-50"
                            disabled={cancellingId === reservation.id}
                            onClick={() => handleCancel(reservation.id)}
                          >
                            {cancellingId === reservation.id ? "Membatalkan..." : "Batal"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="border-brand-100 bg-white">
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-950">{reservation.facility.name}</p>
                      <p className="mt-1 text-sm capitalize text-ink-600">
                        {reservation.facility.type}
                      </p>
                    </div>
                    <ReservationStatusBadge status={reservation.status} />
                  </div>
                  <div className="grid gap-2 text-sm text-ink-600">
                    <span className="flex items-center gap-2">
                      <MapPin className="size-4 text-brand-500" aria-hidden />
                      {reservation.facility.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-brand-500" aria-hidden />
                      {formatReservationDate(reservation.reservationDate)}
                    </span>
                    <span className="flex items-center gap-2 font-mono">
                      <Clock3 className="size-4 text-brand-500" aria-hidden />
                      {reservation.startTime}-{reservation.endTime}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-ink-600">
                    {reservation.purpose}
                  </p>
                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      className="h-11 w-full"
                      onClick={() => setSelectedReservationId(reservation.id)}
                    >
                      <Eye aria-hidden /> Lihat detail
                    </Button>
                    {isCancellable(reservation.status) && (
                      <Button
                        variant="outline"
                        className="h-11 w-full border-red-200 text-red-700"
                        disabled={cancellingId === reservation.id}
                        onClick={() => handleCancel(reservation.id)}
                      >
                        {cancellingId === reservation.id ? "Membatalkan..." : "Batalkan reservasi"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <ReservationDetailDialog
        reservationId={selectedReservationId}
        onClose={() => setSelectedReservationId(null)}
        onCancelled={() => {
          setSelectedReservationId(null);
          setReloadKey((value) => value + 1);
        }}
      />
    </section>
  );
}

function ReservationStatusBadge({ status }: { status: ReservationSummary["status"] }) {
  const meta = RESERVATION_STATUS_META[status];
  return <Badge className={meta.className}>{meta.label}</Badge>;
}

function ReservationListSkeleton() {
  return (
    <div className="space-y-4" aria-label="Memuat riwayat reservasi">
      <div className="hidden overflow-hidden rounded-2xl border bg-white p-4 md:grid md:gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
      <div className="grid gap-4 md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
