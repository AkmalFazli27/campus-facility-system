import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializeReservation } from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import { listReservationsQuerySchema } from "@/lib/validations/reservation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "USER") return fail(403, "Akses ditolak");

  const searchParams = new URL(request.url).searchParams;
  const parsed = listReservationsQuerySchema.safeParse({
    status: searchParams.get("status") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });

  if (!parsed.success) {
    return fail(
      422,
      "Filter reservasi tidak valid",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const reservations = await db.reservation.findMany({
      where: {
        userId: user.id,
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.from || parsed.data.to
          ? {
              reservationDate: {
                ...(parsed.data.from
                  ? { gte: new Date(`${parsed.data.from}T00:00:00.000Z`) }
                  : {}),
                ...(parsed.data.to
                  ? { lte: new Date(`${parsed.data.to}T00:00:00.000Z`) }
                  : {}),
              },
            }
          : {}),
      },
      orderBy: [
        { reservationDate: "desc" },
        { startTime: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        reservationDate: true,
        startTime: true,
        endTime: true,
        purpose: true,
        status: true,
        cancellationReason: true,
        createdAt: true,
        facility: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
          },
        },
      },
    });

    return ok({ reservations: reservations.map(serializeReservation) });
  } catch (error) {
    console.error("GET /api/reservations/my failed", error);
    return fail(500, "Gagal mengambil riwayat reservasi");
  }
}
