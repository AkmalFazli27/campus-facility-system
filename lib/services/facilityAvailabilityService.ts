import {
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  SLOT_STEP_MINUTES,
} from "@/lib/helpers/slots";
import { hasOverlap } from "@/lib/services/reservationService";

export type AvailabilitySlot = {
  start: string;
  end: string;
  available: boolean;
  reason: string | null;
};

type FacilityStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

type FacilitySummary = {
  id: number;
  name: string;
  status: FacilityStatus;
};

type ApprovedReservation = {
  startTime: Date;
  endTime: Date;
};

export type FacilityAvailabilityReader = {
  facility: {
    findUnique(args: unknown): Promise<FacilitySummary | null>;
  };
  reservation: {
    findMany(args: unknown): Promise<ApprovedReservation[]>;
  };
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

function formatReservationTime(value: Date): string {
  return value.toISOString().slice(11, 16);
}

function unavailableReason(status: Exclude<FacilityStatus, "ACTIVE">): string {
  return status === "INACTIVE"
    ? "Fasilitas tidak aktif"
    : "Fasilitas sedang dalam perbaikan";
}

export async function getFacilityAvailability(
  database: FacilityAvailabilityReader,
  params: { facilityId: number; reservationDate: Date },
) {
  const facility = await database.facility.findUnique({
    where: { id: params.facilityId },
    select: { id: true, name: true, status: true },
  });

  if (!facility) return null;

  const slots = buildAvailabilitySlots();

  if (facility.status !== "ACTIVE") {
    const reason = unavailableReason(facility.status);
    return {
      facility,
      slots: slots.map((slot) => ({ ...slot, available: false, reason })),
    };
  }

  const approvedReservations = await database.reservation.findMany({
    where: {
      facilityId: facility.id,
      reservationDate: params.reservationDate,
      status: "APPROVED",
    },
    select: { startTime: true, endTime: true },
  });

  return {
    facility,
    slots: slots.map((slot) => {
      const isReserved = approvedReservations.some((reservation) => {
        const startTime = formatReservationTime(reservation.startTime);
        const endTime = formatReservationTime(reservation.endTime);
        return hasOverlap(slot.start, slot.end, startTime, endTime);
      });

      return isReserved
        ? { ...slot, available: false, reason: "Sudah disetujui" }
        : slot;
    }),
  };
}
