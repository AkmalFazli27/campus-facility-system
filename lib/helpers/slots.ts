// Helper slot waktu reservasi (PRD §7.1) — satu sumber kebenaran untuk
// Client Component (UX) dan Route Handler (otoritatif).

export function isThirtyMinuteSlot(t: string): boolean {
  // t = "HH:mm"
  const [h, m] = t.split(":").map(Number);
  return (m === 0 || m === 30) && h >= 7 && h <= 20;
}

export function withinOperatingHours(start: string, end: string): boolean {
  return start >= "07:00" && end <= "20:00" && start < end;
}
