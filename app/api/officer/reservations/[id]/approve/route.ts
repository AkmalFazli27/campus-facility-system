import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import {
  hasOverlap,
  serializeReservation,
  validateSlot,
} from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import { reservationIdSchema } from "@/lib/validations/reservation";

export const runtime = "nodejs";

function toHHmm(value: Date): string {
  return value.toISOString().slice(11, 16);
}

// US09 / FR-RSV-04: petugas menyetujui reservasi PENDING.
// Cek konflik di dalam transaksi: bentrok dengan APPROVED lain
// di fasilitas+tanggal yang overlap → 409.
export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail(403, "Akses ditolak");
  }

  const { id: rawId } = await context.params;
  const parsedId = reservationIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID reservasi tidak valid");

  try {
    const reservation = await db.reservation.findUnique({
      where: { id: parsedId.data },
      select: {
        id: true,
        reservationDate: true,
        startTime: true,
        endTime: true,
        status: true,
        facility: { select: { id: true, status: true } },
      },
    });

    if (!reservation) return fail(404, "Reservasi tidak ditemukan");
    if (reservation.status !== "PENDING") {
      return fail(422, "Hanya reservasi pending yang bisa disetujui");
    }
    if (reservation.facility.status !== "ACTIVE") {
      return fail(422, "Fasilitas sedang tidak aktif atau dalam perbaikan");
    }

    const startKey = toHHmm(reservation.startTime);
    const endKey = toHHmm(reservation.endTime);
    const slot = validateSlot(startKey, endKey);
    if (!slot.valid) return fail(422, slot.message);

    const updated = await db.$transaction(async (tx) => {
      const existing = await tx.reservation.findMany({
        where: {
          facilityId: reservation.facility.id,
          reservationDate: reservation.reservationDate,
          status: "APPROVED",
          id: { not: reservation.id },
        },
        select: { startTime: true, endTime: true },
      });

      const conflict = existing.some((row) =>
        hasOverlap(startKey, endKey, toHHmm(row.startTime), toHHmm(row.endTime)),
      );
      if (conflict) return null;

      return tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: "APPROVED",
          cancellationReason: null,
          processedBy: user.id,
          processedAt: new Date(),
        },
        select: {
          id: true,
          reservationDate: true,
          startTime: true,
          endTime: true,
          purpose: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          facility: {
            select: { id: true, name: true, type: true, location: true },
          },
        },
      });
    });

    if (!updated) {
      return fail(409, "Jadwal bentrok dengan reservasi lain yang sudah disetujui");
    }

    return ok({ reservation: serializeReservation(updated) });
  } catch (error) {
    console.error(`PATCH /api/officer/reservations/${parsedId.data}/approve failed`, error);
    return fail(500, "Gagal menyetujui reservasi");
  }
}
