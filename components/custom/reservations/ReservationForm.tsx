"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addDuration,
  durationBetween,
  SLOT_STEP_MINUTES,
} from "@/lib/helpers/slots";
import { validateSlot } from "@/lib/services/reservationService";
import { createReservationSchema } from "@/lib/validations/reservation";

// Form reservasi inti (US03): input manual start/end + stepper durasi ±30 menit.
// Dipasang A2 di app/facilities/[id]/page.tsx dalam section id="reservasi":
//   <ReservationForm facilityId={facility.id} bookable={facility.status === "ACTIVE"} />
// Drag bar slot menyusul di commit terpisah.

function todayLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatDurationId(totalMinutes: number | null): string {
  if (totalMinutes === null || totalMinutes <= 0) return "—";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}

export default function ReservationForm({
  facilityId,
  bookable,
  defaultDate = "",
}: {
  facilityId: number;
  bookable: boolean;
  defaultDate?: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    date?: string;
    time?: string;
    purpose?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const duration = durationBetween(start, end);

  function stepDuration(delta: number) {
    const current = durationBetween(start, end) ?? SLOT_STEP_MINUTES;
    const next = addDuration(start, current + delta);
    if (next) {
      setEnd(next);
      setFieldErrors((prev) => ({ ...prev, time: undefined }));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookable) return;

    const parsed = createReservationSchema.safeParse({
      facility_id: facilityId,
      reservation_date: date,
      start_time: start,
      end_time: end,
      purpose,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        date: flat.reservation_date?.[0],
        time: flat.start_time?.[0] ?? flat.end_time?.[0],
        purpose: flat.purpose?.[0],
      });
      toast.error("Periksa kembali data reservasi");
      return;
    }

    const slot = validateSlot(parsed.data.start_time, parsed.data.end_time);
    if (!slot.valid) {
      setFieldErrors({ time: slot.message });
      toast.error("Periksa kembali jam reservasi");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push(`/login?next=/facilities/${facilityId}`);
        return;
      }
      if (!response.ok) {
        const message: string = payload?.message ?? "Gagal membuat reservasi";
        const apiErrors = payload?.error as
          | Record<string, string[] | undefined>
          | undefined;
        setFieldErrors({
          date: apiErrors?.reservation_date?.[0],
          time:
            apiErrors?.start_time?.[0] ??
            apiErrors?.end_time?.[0] ??
            (response.status === 422 ? message : undefined),
          purpose: apiErrors?.purpose?.[0],
        });
        toast.error(message);
        return;
      }
      toast.success("Reservasi terkirim, menunggu persetujuan petugas");
      router.push("/reservations");
    } catch {
      toast.error("Tidak dapat menghubungi server");
    } finally {
      setSubmitting(false);
    }
  }

  if (!bookable) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"
      >
        <p className="font-medium">Fasilitas ini sedang tidak dapat dipesan.</p>
        <p className="mt-1 text-sm">
          Reservasi baru akan ditolak server selama status tidak aktif.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="resv-date">Tanggal peminjaman</Label>
        <Input
          id="resv-date"
          type="date"
          required
          min={todayLocal()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={Boolean(fieldErrors.date)}
          className="h-11 bg-white"
        />
        {fieldErrors.date && (
          <p role="alert" className="text-xs text-danger">
            {fieldErrors.date}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="resv-start">Jam mulai</Label>
          <Input
            id="resv-start"
            type="time"
            required
            step={SLOT_STEP_MINUTES * 60}
            min="07:00"
            max="20:00"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            aria-invalid={Boolean(fieldErrors.time)}
            className="h-11 bg-white"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="resv-end">Jam selesai</Label>
          <Input
            id="resv-end"
            type="time"
            required
            step={SLOT_STEP_MINUTES * 60}
            min="07:00"
            max="20:00"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            aria-invalid={Boolean(fieldErrors.time)}
            className="h-11 bg-white"
          />
        </div>
      </div>
      {fieldErrors.time && (
        <p role="alert" className="-mt-2 text-xs text-danger">
          {fieldErrors.time}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-slate-50 px-4 py-3">
        <p className="text-sm text-ink-600">
          Durasi:{" "}
          <strong className="text-ink-950">{formatDurationId(duration)}</strong>
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9"
            aria-label="Kurangi durasi 30 menit"
            onClick={() => stepDuration(-SLOT_STEP_MINUTES)}
          >
            <Minus aria-hidden className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9"
            aria-label="Tambah durasi 30 menit"
            onClick={() => stepDuration(SLOT_STEP_MINUTES)}
          >
            <Plus aria-hidden className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="resv-purpose">Tujuan peminjaman</Label>
        <Textarea
          id="resv-purpose"
          required
          placeholder="Contoh: Rapat kerja divisi, praktikum kelas A"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          aria-invalid={Boolean(fieldErrors.purpose)}
          className="min-h-24 bg-white"
        />
        {fieldErrors.purpose && (
          <p role="alert" className="text-xs text-danger">
            {fieldErrors.purpose}
          </p>
        )}
      </div>

      <p className="text-xs leading-5 text-ink-400">
        Jam operasional 07:00–20:00 dengan kelipatan 30 menit. Pengajuan
        berstatus menunggu persetujuan petugas.
      </p>

      <Button
        type="submit"
        disabled={submitting}
        className="h-11 bg-brand-500 hover:bg-brand-600"
      >
        {submitting ? "Mengirim..." : "Ajukan reservasi"}
      </Button>
    </form>
  );
}
