// Helper slot waktu reservasi (PRD §7.1) — satu sumber kebenaran untuk
// Client Component (UX) dan Route Handler (otoritatif).

export function isThirtyMinuteSlot(t: string): boolean {
  return /^(?:[01]\d|2[0-3]):(?:00|30)$/.test(t);
}

export function withinOperatingHours(start: string, end: string): boolean {
  return (
    isThirtyMinuteSlot(start) &&
    isThirtyMinuteSlot(end) &&
    start >= "07:00" &&
    end <= "20:00" &&
    start < end
  );
}

// Durasi reservasi (fitur: pilih durasi kelipatan 30 menit, maks full day 07:00-20:00).
// Helper murni dipakai stepper/drag bar di form dan bisa dipakai server kelak.

export const SLOT_STEP_MINUTES = 30;
export const DAY_START_MINUTES = 7 * 60; // 07:00
export const DAY_END_MINUTES = 20 * 60; // 20:00

export function isValidDuration(durationMinutes: number): boolean {
  return (
    Number.isInteger(durationMinutes) &&
    durationMinutes >= SLOT_STEP_MINUTES &&
    durationMinutes % SLOT_STEP_MINUTES === 0
  );
}

function toMinutes(t: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function toHHmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Hitung end dari start + durasi. Null bila start bukan slot valid,
// durasi tidak valid, atau hasil keluar jam operasional.
export function addDuration(start: string, durationMinutes: number): string | null {
  if (!isThirtyMinuteSlot(start) || !isValidDuration(durationMinutes)) return null;
  const startMin = toMinutes(start);
  if (startMin === null) return null;
  if (startMin < DAY_START_MINUTES || startMin >= DAY_END_MINUTES) return null;
  const endMin = startMin + durationMinutes;
  if (endMin > DAY_END_MINUTES) return null;
  return toHHmm(endMin);
}

// Selisih menit end - start. Null bila format jam tidak valid.
export function durationBetween(start: string, end: string): number | null {
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  if (startMin === null || endMin === null) return null;
  return endMin - startMin;
}
