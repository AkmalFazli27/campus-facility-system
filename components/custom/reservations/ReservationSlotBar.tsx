"use client";

import { useState } from "react";
import { DAY_START_MINUTES, isThirtyMinuteSlot, SLOT_STEP_MINUTES } from "@/lib/helpers/slots";
import {
  chooseReservationSlot,
  RESERVATION_SLOT_COUNT,
  slotLabel,
} from "@/lib/reservation-slot-selection";
import { type AvailabilitySlot, unavailableReasonForRange } from "@/lib/reservation-ui";
import { cn } from "@/lib/utils";

// Dua klik pada slot: klik pertama = awal (langsung 30 menit), klik kedua =
// slot terakhir yang dipakai. Tombol juga mendukung Enter/Space dan sentuhan.

function toMinutes(t: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export default function ReservationSlotBar({
  start,
  end,
  slots = [],
  disabled = false,
  onRangeChange,
  onUnavailableRange,
}: {
  start: string;
  end: string;
  slots?: AvailabilitySlot[];
  disabled?: boolean;
  onRangeChange: (nextStart: string, nextEnd: string) => void;
  onUnavailableRange?: (reason: string) => void;
}) {
  const [anchor, setAnchor] = useState<number | null>(null);

  const valid =
    isThirtyMinuteSlot(start) &&
    isThirtyMinuteSlot(end) &&
    start >= "07:00" &&
    end <= "20:00" &&
    start < end;
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const selStart = valid && startMin !== null ? (startMin - DAY_START_MINUTES) / SLOT_STEP_MINUTES : -1;
  const selEnd = valid && endMin !== null ? (endMin - DAY_START_MINUTES) / SLOT_STEP_MINUTES : -1;

  function handleClick(index: number) {
    const choice = chooseReservationSlot(anchor, index, slots);
    if (choice.kind === "unavailable") {
      onUnavailableRange?.(choice.reason);
    } else {
      onRangeChange(choice.start, choice.end);
      setAnchor(choice.anchor);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Pilih slot waktu</p>
        {valid && <p className="font-mono text-xs text-ink-600">{start}–{end}</p>}
      </div>
      <div>
        <div className="flex justify-between text-[10px] text-ink-400" aria-hidden>
          {Array.from({ length: 14 }, (_, h) => (
            <span key={h}>{String(7 + h).padStart(2, "0")}</span>
          ))}
        </div>
        <div
          role="group"
          aria-label="Pilih rentang slot waktu 07:00 sampai 20:00"
          className="mt-1 grid grid-cols-[repeat(26,minmax(0,1fr))] gap-0.5 select-none"
        >
          {Array.from({ length: RESERVATION_SLOT_COUNT }, (_, i) => {
            const selected = valid && i >= selStart && i < selEnd;
            const slotStart = slotLabel(i);
            const slotEnd = slotLabel(i + 1);
            const unavailableReason = unavailableReasonForRange(slotStart, slotEnd, slots);
            const unavailable = Boolean(unavailableReason);
            return (
              <button
                key={i}
                type="button"
                aria-label={`Slot ${slotStart} sampai ${slotEnd}${unavailable ? ` tidak tersedia: ${unavailableReason}` : anchor === null ? ", pilih waktu mulai" : ", pilih waktu selesai"}`}
                aria-pressed={selected}
                disabled={disabled || unavailable}
                title={unavailableReason ?? undefined}
                onClick={() => handleClick(i)}
                className={cn(
                  "h-9 rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                  unavailable
                    ? "cursor-not-allowed border-slate-200 bg-slate-200 opacity-80"
                    : selected
                    ? "border-brand-500 bg-brand-500"
                    : "border-border bg-white hover:border-brand-300 hover:bg-brand-50",
                  anchor === i && "ring-2 ring-brand-700 ring-offset-1",
                )}
              />
            );
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-ink-400" aria-hidden>
          <span>07:00</span>
          <span>20:00</span>
        </div>
        {slots.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-white ring-1 ring-border" />
              Tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-slate-200 ring-1 ring-slate-300" />
              Tidak tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-brand-500" />
              Rentang dipilih
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
