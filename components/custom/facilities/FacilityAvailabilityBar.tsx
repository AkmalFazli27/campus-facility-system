import type { FacilityAvailabilitySummary } from "@/lib/facilities/types";

export default function FacilityAvailabilityBar({
  availability,
}: {
  availability: FacilityAvailabilitySummary;
}) {
  return (
    <div
      className="min-w-0"
      role="img"
      aria-label={`Ketersediaan ${availability.date}: ${availability.availableSlots} dari ${availability.totalSlots} slot tersedia`}
    >
      <div className="flex justify-between text-[10px] text-ink-400" aria-hidden>
        <span>07:00</span>
        <span>20:00</span>
      </div>
      <div className="mt-1 grid grid-cols-[repeat(26,minmax(0,1fr))] gap-0.5">
        {availability.slots.map((slot) => (
          <span
            key={slot.start}
            title={`${slot.start}-${slot.end}: ${slot.available ? "Tersedia" : slot.reason ?? "Tidak tersedia"}`}
            aria-hidden
            className={`h-5 min-w-0 rounded-sm border ${
              slot.available
                ? "border-brand-200 bg-white"
                : "border-slate-300 bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-brand-200 bg-white" aria-hidden />
          Tersedia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-slate-300 bg-slate-200" aria-hidden />
          Tidak tersedia
        </span>
      </div>
    </div>
  );
}
