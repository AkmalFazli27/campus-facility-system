import { isThirtyMinuteSlot, withinOperatingHours } from "@/lib/helpers/slots";

export type SlotValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateSlot(
  startTime: string,
  endTime: string,
): SlotValidationResult {
  if (!isThirtyMinuteSlot(startTime) || !isThirtyMinuteSlot(endTime)) {
    return {
      valid: false,
      message: "Waktu harus menggunakan format HH:mm dan slot 30 menit",
    };
  }

  if (startTime >= endTime) {
    return {
      valid: false,
      message: "Waktu selesai harus setelah waktu mulai",
    };
  }

  if (!withinOperatingHours(startTime, endTime)) {
    return {
      valid: false,
      message: "Waktu reservasi harus berada antara 07:00 dan 20:00",
    };
  }

  return { valid: true };
}

export function hasOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function findOverlappingRanges<
  T extends { startTime: string; endTime: string },
>(startTime: string, endTime: string, ranges: T[]): T[] {
  return ranges.filter((range) =>
    hasOverlap(startTime, endTime, range.startTime, range.endTime),
  );
}

function toHHmm(value: Date): string {
  return value.toISOString().slice(11, 16);
}

type ConflictReader = {
  reservation: {
    findMany: (args: unknown) => Promise<Array<{ startTime: Date; endTime: Date }>>;
  };
};

export async function checkConflict(
  database: ConflictReader,
  params: {
    facilityId: number;
    reservationDate: Date;
    startTime: string;
    endTime: string;
    excludeId?: number;
  },
): Promise<boolean> {
  const existing = await database.reservation.findMany({
    where: {
      facilityId: params.facilityId,
      reservationDate: params.reservationDate,
      status: "APPROVED",
      ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
    },
    select: { startTime: true, endTime: true },
  });

  return (
    findOverlappingRanges(
      params.startTime,
      params.endTime,
      existing.map((row) => ({
        startTime: toHHmm(row.startTime),
        endTime: toHHmm(row.endTime),
      })),
    ).length > 0
  );
}

// Input HH:mm dianggap waktu WIB (PRD §7). Dipakai cancel user: tolak jika sudah lewat start.
export function isPastStart(
  reservationDate: string,
  startTime: string,
  now: Date = new Date(),
): boolean {
  const start = new Date(`${reservationDate}T${startTime}:00+07:00`);
  if (Number.isNaN(start.getTime())) return true;
  return now >= start;
}

export function serializeReservation<
  T extends {
    reservationDate: Date;
    startTime: Date;
    endTime: Date;
  },
>(reservation: T) {
  return {
    ...reservation,
    reservationDate: reservation.reservationDate.toISOString().slice(0, 10),
    startTime: reservation.startTime.toISOString().slice(11, 16),
    endTime: reservation.endTime.toISOString().slice(11, 16),
  };
}
