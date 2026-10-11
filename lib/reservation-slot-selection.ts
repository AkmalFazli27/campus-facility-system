import {
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  SLOT_STEP_MINUTES,
} from "@/lib/helpers/slots";
import {
  type AvailabilitySlot,
  unavailableReasonForRange,
} from "@/lib/reservation-ui";

export const RESERVATION_SLOT_COUNT =
  (DAY_END_MINUTES - DAY_START_MINUTES) / SLOT_STEP_MINUTES;

export function slotLabel(index: number): string {
  const total = DAY_START_MINUTES + index * SLOT_STEP_MINUTES;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

type SlotChoice =
  | { kind: "selected"; anchor: number | null; start: string; end: string }
  | { kind: "unavailable"; anchor: number | null; reason: string };

// Klik pertama langsung menghasilkan rentang 30 menit; klik kedua memilih
// slot terakhir (inklusif). Klik berikutnya memulai pilihan baru.
export function chooseReservationSlot(
  anchor: number | null,
  index: number,
  slots: AvailabilitySlot[],
): SlotChoice {
  if (
    !Number.isInteger(index) || index < 0 || index >= RESERVATION_SLOT_COUNT ||
    (anchor !== null && (!Number.isInteger(anchor) || anchor < 0 || anchor >= RESERVATION_SLOT_COUNT))
  ) {
    return { kind: "unavailable", anchor, reason: "Slot waktu tidak valid" };
  }

  const first = anchor === null ? index : Math.min(anchor, index);
  const last = anchor === null ? index : Math.max(anchor, index);
  const start = slotLabel(first);
  const end = slotLabel(last + 1);
  const reason = unavailableReasonForRange(start, end, slots);
  if (reason) return { kind: "unavailable", anchor, reason };

  return { kind: "selected", anchor: anchor === null ? index : null, start, end };
}
