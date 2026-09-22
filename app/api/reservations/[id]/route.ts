import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializeReservation } from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import { reservationIdSchema } from "@/lib/validations/reservation";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");

  const { id: rawId } = await context.params;
  const parsedId = reservationIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID reservasi tidak valid");

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
        cancellationReason: true,
        processedAt: true,
        createdAt: true,
        updatedAt: true,
        facility: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
            capacity: true,
            status: true,
          },
        },
      },
    });

    if (!reservation) return fail(404, "Reservasi tidak ditemukan");

    const { userId, ...visibleReservation } = reservation;
    if (user.role === "USER" && userId !== user.id) {
      return fail(403, "Anda tidak memiliki akses ke reservasi ini");
    }

    return ok({ reservation: serializeReservation(visibleReservation) });
  } catch (error) {
    console.error(`GET /api/reservations/${parsedId.data} failed`, error);
    return fail(500, "Gagal mengambil detail reservasi");
  }
}
