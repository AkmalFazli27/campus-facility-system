import {
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  SLOT_STEP_MINUTES,
} from "@/lib/helpers/slots";

export type AvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
  reason: string | null;
};

function toHHmm(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function buildAvailabilitySlots(): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];

  for (
    let startMinutes = DAY_START_MINUTES;
    startMinutes < DAY_END_MINUTES;
    startMinutes += SLOT_STEP_MINUTES
  ) {
    slots.push({
      start: toHHmm(startMinutes),
      end: toHHmm(startMinutes + SLOT_STEP_MINUTES),
      available: true,
      reason: null,
    });
  }

  return slots;
}
