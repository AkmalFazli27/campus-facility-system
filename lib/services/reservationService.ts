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
