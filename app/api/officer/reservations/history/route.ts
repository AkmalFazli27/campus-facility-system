import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { expirePendingReservations } from "@/lib/services/reservationExpiryService";
import { serializeReservation } from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import { officerHistoryQuerySchema } from "@/lib/validations/reservation";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail(403, "Akses ditolak");
  }

  const params = new URL(request.url).searchParams;
  const parsed = officerHistoryQuerySchema.safeParse({
    status: params.get("status") || undefined,
    from: params.get("from") || undefined,
    to: params.get("to") || undefined,
    page: params.get("page") || undefined,
  });
  if (!parsed.success) {
    return fail(422, "Filter riwayat tidak valid", parsed.error.flatten().fieldErrors);
  }

  const { status, from, to, page = 1 } = parsed.data;
  const where: Prisma.ReservationWhereInput = {
    ...(status ? { status } : {}),
    ...(from || to
      ? {
          reservationDate: {
            ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
            ...(to ? { lte: new Date(`${to}T00:00:00.000Z`) } : {}),
          },
        }
      : {}),
  };

  try {
    await expirePendingReservations(db);
    const [reservations, total] = await Promise.all([
      db.reservation.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          reservationDate: true,
          startTime: true,
          endTime: true,
          purpose: true,
          status: true,
          cancellationReason: true,
          createdAt: true,
          processedAt: true,
          user: { select: { id: true, name: true, email: true } },
          officer: { select: { id: true, name: true } },
          facility: { select: { id: true, name: true, type: true, location: true } },
        },
      }),
      db.reservation.count({ where }),
    ]);

    return ok({
      reservations: reservations.map(serializeReservation),
      total,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (error) {
    console.error("GET /api/officer/reservations/history failed", error);
    return fail(500, "Gagal mengambil riwayat reservasi");
  }
}
