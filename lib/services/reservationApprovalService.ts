import type { Prisma, PrismaClient } from "@prisma/client";
import { isPendingReservationExpired } from "@/lib/services/reservationExpiryService";
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
  | { kind: "expired" }
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
  now: () => Date = () => new Date(),
): Promise<ApprovalResult> {
  return database.$transaction(async (tx) => {
    const target = await tx.reservation.findUnique({
      where: { id: reservationId },
      select: { facilityId: true },
    });
    if (!target) return { kind: "not-found" };

    // Kunci fasilitas dahulu agar dua approval tidak saling menunggu baris
    // reservasi masing-masing saat menolak pending yang bertabrakan.
    await tx.$queryRaw`
      SELECT id
      FROM facilities
      WHERE id = ${target.facilityId}
      FOR UPDATE
    `;
    await tx.$queryRaw`
      SELECT id
      FROM reservations
      WHERE id = ${reservationId}
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
    if (isPendingReservationExpired(reservation.reservationDate, now())) {
      return { kind: "expired" };
    }
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

    const decisionTime = now();
    if (isPendingReservationExpired(reservation.reservationDate, decisionTime)) {
      return { kind: "expired" };
    }

    const updated = await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "APPROVED",
        cancellationReason: null,
        processedBy: officerId,
        processedAt: decisionTime,
      },
      select: approvedReservationSelect,
    });

    // Hanya pengajuan PENDING pada fasilitas/tanggal yang sama dan benar-benar
    // overlap yang ditolak otomatis. Slot yang bersentuhan di tepi tetap bisa diproses.
    await tx.reservation.updateMany({
      where: {
        id: { not: reservation.id },
        facilityId: reservation.facility.id,
        reservationDate: reservation.reservationDate,
        status: "PENDING",
        startTime: { lt: reservation.endTime },
        endTime: { gt: reservation.startTime },
      },
      data: {
        status: "REJECTED",
        cancellationReason: `Ditolak otomatis karena jadwal bentrok dengan reservasi #${reservation.id} yang telah disetujui`,
        processedBy: null,
        processedAt: decisionTime,
      },
    });

    return { kind: "approved", reservation: updated };
  }, { isolationLevel: "ReadCommitted" });
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
