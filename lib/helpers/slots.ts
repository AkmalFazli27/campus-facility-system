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
