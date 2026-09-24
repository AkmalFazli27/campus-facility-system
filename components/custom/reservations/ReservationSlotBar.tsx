"use client";

import { useRef } from "react";
import { isThirtyMinuteSlot } from "@/lib/helpers/slots";
import {
  type AvailabilitySlot,
  unavailableReasonForRange,
} from "@/lib/reservation-ui";
import { cn } from "@/lib/utils";

// Drag bar slot 07:00-20:00 (26 slot @30 menit) untuk ReservationForm.
// Klik-drag memilih rentang; snap otomatis per slot. Keyboard-accessible
// via tombol per slot (Enter/Space memilih 1 slot).

const DAY_START_MIN = 7 * 60;
const SLOT_COUNT = 26;

function toMinutes(t: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function slotLabel(index: number): string {
  const total = DAY_START_MIN + index * 30;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
}

export default function ReservationSlotBar({
  start,
  end,
  slots = [],
  onRangeChange,
  onUnavailableRange,
}: {
  start: string;
  end: string;
  slots?: AvailabilitySlot[];
  onRangeChange: (nextStart: string, nextEnd: string) => void;
  onUnavailableRange?: (reason: string) => void;
}) {
  const dragging = useRef(false);
  const anchor = useRef(0);
  const moved = useRef(false);

  const valid =
    isThirtyMinuteSlot(start) &&
    isThirtyMinuteSlot(end) &&
    start >= "07:00" &&
    end <= "20:00" &&
    start < end;
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const selStart =
    valid && startMin !== null ? (startMin - DAY_START_MIN) / 30 : -1;
  const selEnd = valid && endMin !== null ? (endMin - DAY_START_MIN) / 30 : -1;

  function applyRange(a: number, b: number) {
    const lo = Math.max(0, Math.min(a, b));
    const hi = Math.min(SLOT_COUNT, Math.max(a, b) + 1);
    if (hi <= lo) return;

    const nextStart = slotLabel(lo);
    const nextEnd = slotLabel(hi);
    const unavailableReason = unavailableReasonForRange(nextStart, nextEnd, slots);
    if (unavailableReason) {
      onUnavailableRange?.(unavailableReason);
      return;
    }
    onRangeChange(nextStart, nextEnd);
  }

  function beginDrag(index: number) {
    dragging.current = true;
    moved.current = false;
    anchor.current = index;
    applyRange(index, index);
  }

  function moveDrag(index: number) {
    if (!dragging.current) return;
    if (index !== anchor.current) moved.current = true;
    applyRange(anchor.current, index);
  }

  function endDrag() {
    dragging.current = false;
  }

  // Klik mouse setelah drag diabaikan (rentang sudah benar);
  // klik/Enter keyboard memilih 1 slot.
  function handleClick(index: number) {
    if (moved.current) {
      moved.current = false;
      return;
    }
    applyRange(index, index);
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Pilih slot waktu</p>
        <p className="font-mono text-xs text-ink-600">
          {valid ? `${start}–${end}` : "seret pada bar"}
        </p>
      </div>
      <div
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="flex justify-between text-[10px] text-ink-400" aria-hidden>
          {Array.from({ length: 14 }, (_, h) => (
            <span key={h}>{String(7 + h).padStart(2, "0")}</span>
          ))}
        </div>
        <div
          role="group"
          aria-label="Bar slot waktu 07:00 sampai 20:00"
          className="mt-1 grid grid-cols-[repeat(26,minmax(0,1fr))] gap-0.5 touch-none select-none"
        >
          {Array.from({ length: SLOT_COUNT }, (_, i) => {
            const selected = valid && i >= selStart && i < selEnd;
            const slotStart = slotLabel(i);
            const slotEnd = slotLabel(i + 1);
            const unavailableReason = unavailableReasonForRange(
              slotStart,
              slotEnd,
              slots,
            );
            const unavailable = Boolean(unavailableReason);
            return (
              <button
                key={i}
                type="button"
                aria-label={`Slot ${slotStart} sampai ${slotEnd}${unavailable ? ` tidak tersedia: ${unavailableReason}` : ""}`}
                aria-pressed={selected}
                disabled={unavailable}
                title={unavailableReason ?? undefined}
                onPointerDown={(e) => {
                  e.preventDefault();
                  beginDrag(i);
                }}
                onPointerEnter={() => moveDrag(i)}
                onClick={() => handleClick(i)}
                className={cn(
                  "h-9 rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                  unavailable
                    ? "cursor-not-allowed border-slate-200 bg-slate-200 opacity-80"
                    : selected
                    ? "border-brand-500 bg-brand-500"
                    : "border-border bg-white hover:border-brand-300 hover:bg-brand-50",
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
          </div>
        )}
      </div>
    </div>
  );
}
