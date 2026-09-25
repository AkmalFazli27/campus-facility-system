import type { Prisma, PrismaClient } from "@prisma/client";
import { checkConflict, validateSlot } from "@/lib/services/reservationService";

const approvedReservationSelect = {
  id: true,
  reservationDate: true,
  startTime: true,
  endTime: true,
  purpose: true,
  status: true,
  cancellationReason: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true } },
  facility: {
    select: { id: true, name: true, type: true, location: true },
  },
} satisfies Prisma.ReservationSelect;

type ApprovedReservation = Prisma.ReservationGetPayload<{
  select: typeof approvedReservationSelect;
}>;

export type ApprovalResult =
  | { kind: "not-found" }
  | { kind: "not-pending" }
  | { kind: "facility-unavailable" }
  | { kind: "invalid-slot"; message: string }
  | { kind: "conflict" }
  | { kind: "approved"; reservation: ApprovedReservation };

export type RejectionResult =
  | { kind: "not-found" }
  | { kind: "not-pending" }
  | { kind: "rejected"; reservation: ApprovedReservation };

type TransactionHost = Pick<PrismaClient, "$transaction">;

function toHHmm(value: Date): string {
  return value.toISOString().slice(11, 16);
}

export async function approveReservation(
  database: TransactionHost,
  reservationId: number,
  officerId: number,
): Promise<ApprovalResult> {
  return database.$transaction(async (tx) => {
    const lockedReservations = await tx.$queryRaw<Array<{ facilityId: number }>>`
      SELECT facility_id AS facilityId
      FROM reservations
      WHERE id = ${reservationId}
      FOR UPDATE
    `;
    const lockedReservation = lockedReservations[0];
    if (!lockedReservation) return { kind: "not-found" };

    // Semua approval pada fasilitas yang sama harus menunggu lock ini.
    await tx.$queryRaw`
      SELECT id
      FROM facilities
      WHERE id = ${lockedReservation.facilityId}
      FOR UPDATE
    `;

    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        reservationDate: true,
        startTime: true,
        endTime: true,
        status: true,
        facility: { select: { id: true, status: true } },
      },
    });
    if (!reservation) return { kind: "not-found" };
    if (reservation.status !== "PENDING") return { kind: "not-pending" };
    if (reservation.facility.status !== "ACTIVE") {
      return { kind: "facility-unavailable" };
    }

    const startTime = toHHmm(reservation.startTime);
    const endTime = toHHmm(reservation.endTime);
    const slot = validateSlot(startTime, endTime);
    if (!slot.valid) return { kind: "invalid-slot", message: slot.message };

    const conflict = await checkConflict(tx, {
      facilityId: reservation.facility.id,
      reservationDate: reservation.reservationDate,
      startTime,
      endTime,
      excludeId: reservation.id,
    });
    if (conflict) return { kind: "conflict" };

    const updated = await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "APPROVED",
        cancellationReason: null,
        processedBy: officerId,
        processedAt: new Date(),
      },
      select: approvedReservationSelect,
    });

    return { kind: "approved", reservation: updated };
  });
}

export async function rejectReservation(
  database: TransactionHost,
  reservationId: number,
  officerId: number,
  reason: string,
): Promise<RejectionResult> {
  return database.$transaction(async (tx) => {
    const decision = await tx.reservation.updateMany({
      where: { id: reservationId, status: "PENDING" },
      data: {
        status: "REJECTED",
        cancellationReason: reason,
        processedBy: officerId,
        processedAt: new Date(),
      },
    });

    if (decision.count === 0) {
      const exists = await tx.reservation.findUnique({
        where: { id: reservationId },
        select: { id: true },
      });
      return exists ? { kind: "not-pending" } : { kind: "not-found" };
    }

    const updated = await tx.reservation.findUnique({
      where: { id: reservationId },
      select: approvedReservationSelect,
    });
    if (!updated) return { kind: "not-found" };
    return { kind: "rejected", reservation: updated };
  });
}
