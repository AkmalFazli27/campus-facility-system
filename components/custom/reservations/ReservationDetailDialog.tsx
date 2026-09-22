"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatReservationDate,
  formatReservationDateTime,
  RESERVATION_STATUS_META,
  type ReservationDetail,
} from "@/lib/reservation-ui";

type DetailResponse = {
  success: boolean;
  data?: { reservation: ReservationDetail };
  message?: string;
};

const FACILITY_STATUS_LABEL = {
  ACTIVE: "Aktif",
  INACTIVE: "Tidak aktif",
  UNDER_MAINTENANCE: "Dalam perbaikan",
} as const;

export default function ReservationDetailDialog({
  reservationId,
  onClose,
}: {
  reservationId: number | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (reservationId === null) return;

    const controller = new AbortController();
    fetch(`/api/reservations/${reservationId}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as DetailResponse;
        if (response.status === 401) {
          router.push("/login?next=/reservations");
          throw new Error("Sesi telah berakhir");
        }
        if (!response.ok || !body.success || !body.data) {
          throw new Error(body.message ?? "Gagal mengambil detail reservasi");
        }
        return body.data.reservation;
      })
      .then((data) => {
        setReservation(data);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Terjadi kesalahan saat memuat detail",
        );
      });

    return () => controller.abort();
  }, [reservationId, reloadKey, router]);

  function handleOpenChange(open: boolean) {
    if (open) return;
    setReservation(null);
    setError(null);
    onClose();
  }

  function retry() {
    setReservation(null);
    setError(null);
    setReloadKey((value) => value + 1);
  }

  const isLoading = reservationId !== null && reservation === null && error === null;

  return (
    <Dialog open={reservationId !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detail reservasi</DialogTitle>
          <DialogDescription>
            Informasi fasilitas, jadwal, tujuan, dan status pengajuan reservasi.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <DetailSkeleton />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-medium">Detail reservasi belum dapat dimuat.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button className="mt-4 h-11" variant="outline" onClick={retry}>
              Coba lagi
            </Button>
          </div>
        )}

        {!isLoading && !error && reservation && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                  Reservasi #{reservation.id}
                </p>
                <p className="mt-1 font-semibold text-ink-950">{reservation.facility.name}</p>
              </div>
              <Badge className={RESERVATION_STATUS_META[reservation.status].className}>
                {RESERVATION_STATUS_META[reservation.status].label}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem icon={Building2} label="Tipe fasilitas" value={reservation.facility.type} />
              <DetailItem icon={MapPin} label="Lokasi" value={reservation.facility.location} />
              <DetailItem
                icon={Users}
                label="Kapasitas"
                value={`${reservation.facility.capacity} orang`}
              />
              <DetailItem
                icon={Building2}
                label="Status fasilitas"
                value={FACILITY_STATUS_LABEL[reservation.facility.status]}
              />
              <DetailItem
                icon={CalendarDays}
                label="Tanggal penggunaan"
                value={formatReservationDate(reservation.reservationDate)}
              />
              <DetailItem
                icon={Clock3}
                label="Waktu"
                value={`${reservation.startTime}-${reservation.endTime}`}
                mono
              />
            </div>

            <div className="rounded-2xl border p-4">
              <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">Tujuan</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-950">
                {reservation.purpose}
              </p>
            </div>

            {reservation.cancellationReason && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                <p className="text-xs font-medium tracking-wide uppercase">Alasan pembatalan</p>
                <p className="mt-2 text-sm leading-6">{reservation.cancellationReason}</p>
              </div>
            )}

            <dl className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-400">Diajukan</dt>
                <dd className="mt-1 text-ink-950">
                  {formatReservationDateTime(reservation.createdAt)} WIB
                </dd>
              </div>
              {reservation.processedAt && (
                <div>
                  <dt className="text-ink-400">Diproses</dt>
                  <dd className="mt-1 text-ink-950">
                    {formatReservationDateTime(reservation.processedAt)} WIB
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-400">{label}</p>
        <p className={`mt-1 truncate text-sm font-medium capitalize text-ink-950 ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-label="Memuat detail reservasi">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
    </div>
  );
}
