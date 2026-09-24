import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import {
  isPastStart,
  serializeReservation,
} from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import {
  cancelReservationSchema,
  reservationIdSchema,
} from "@/lib/validations/reservation";

export const runtime = "nodejs";

// US04 / FR-RSV-03: pemilik membatalkan reservasi sendiri sebelum start_time.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "USER") return fail(403, "Akses ditolak");

  const { id: rawId } = await context.params;
  const parsedId = reservationIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID reservasi tidak valid");

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsedBody = cancelReservationSchema.safeParse(body);
  if (!parsedBody.success) {
    return fail(
      422,
      "Data pembatalan tidak valid",
      parsedBody.error.flatten().fieldErrors,
    );
  }

  try {
    const reservation = await db.reservation.findUnique({
      where: { id: parsedId.data },
      select: {
        id: true,
        userId: true,
        reservationDate: true,
        startTime: true,
        endTime: true,
        purpose: true,
        status: true,
        createdAt: true,
        facility: { select: { id: true, name: true, type: true, location: true } },
      },
    });

    if (!reservation) return fail(404, "Reservasi tidak ditemukan");
    if (reservation.userId !== user.id) {
      return fail(403, "Anda tidak memiliki akses ke reservasi ini");
    }
    if (reservation.status !== "PENDING" && reservation.status !== "APPROVED") {
      return fail(422, "Hanya reservasi pending atau approved yang bisa dibatalkan");
    }

    const dateKey = reservation.reservationDate.toISOString().slice(0, 10);
    const startKey = reservation.startTime.toISOString().slice(11, 16);
    if (isPastStart(dateKey, startKey)) {
      return fail(422, "Reservasi sudah lewat waktu mulai dan tidak bisa dibatalkan");
    }

    const { userId: _owner, ...rest } = reservation;
    void _owner;
    const updated = await db.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CANCELLED_BY_USER",
        cancellationReason: parsedBody.data.reason || null,
      },
      select: {
        id: true,
        reservationDate: true,
        startTime: true,
        endTime: true,
        purpose: true,
        status: true,
        cancellationReason: true,
        createdAt: true,
        facility: { select: { id: true, name: true, type: true, location: true } },
      },
    });

    void rest;
    return ok({ reservation: serializeReservation(updated) });
  } catch (error) {
    console.error(`PATCH /api/reservations/${parsedId.data}/cancel failed`, error);
    return fail(500, "Gagal membatalkan reservasi");
  }
}
