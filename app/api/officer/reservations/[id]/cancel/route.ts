import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializeReservation } from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import {
  officerDecisionSchema,
  reservationIdSchema,
} from "@/lib/validations/reservation";

export const runtime = "nodejs";

// US10 / FR-RSV-05: petugas membatalkan reservasi APPROVED (wajib alasan,
// mis. fasilitas mendadak tidak layak).
export async function PATCH(
  request: Request,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsedBody = officerDecisionSchema.safeParse(body);
  if (!parsedBody.success) {
    return fail(
      422,
      "Alasan pembatalan wajib diisi",
      parsedBody.error.flatten().fieldErrors,
    );
  }

  try {
    const reservation = await db.reservation.findUnique({
      where: { id: parsedId.data },
      select: { id: true, status: true },
    });

    if (!reservation) return fail(404, "Reservasi tidak ditemukan");
    if (reservation.status !== "APPROVED") {
      return fail(422, "Hanya reservasi approved yang bisa dibatalkan petugas");
    }

    const updated = await db.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CANCELLED_BY_OFFICER",
        cancellationReason: parsedBody.data.reason,
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
        cancellationReason: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        facility: {
          select: { id: true, name: true, type: true, location: true },
        },
      },
    });

    return ok({ reservation: serializeReservation(updated) });
  } catch (error) {
    console.error(`PATCH /api/officer/reservations/${parsedId.data}/cancel failed`, error);
    return fail(500, "Gagal membatalkan reservasi");
  }
}
