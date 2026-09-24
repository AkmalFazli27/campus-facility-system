import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { serializeReservation } from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import { officerQueueQuerySchema } from "@/lib/validations/reservation";

export const runtime = "nodejs";

// US08 / FR-DASH-01 (parsial): antrian reservasi untuk petugas.
// Default menampilkan PENDING terlama dulu (yang butuh aksi).
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail(403, "Akses ditolak");
  }

  const searchParams = new URL(request.url).searchParams;
  const parsed = officerQueueQuerySchema.safeParse({
    status: searchParams.get("status") || undefined,
    facility_id: searchParams.get("facility_id") || undefined,
    date: searchParams.get("date") || undefined,
  });

  if (!parsed.success) {
    return fail(
      422,
      "Filter antrian tidak valid",
      parsed.error.flatten().fieldErrors,
    );
  }

  const status = parsed.data.status ?? "PENDING";

  try {
    const reservations = await db.reservation.findMany({
      where: {
        status,
        ...(parsed.data.facility_id
          ? { facilityId: parsed.data.facility_id }
          : {}),
        ...(parsed.data.date
          ? {
              reservationDate: new Date(
                `${parsed.data.date}T00:00:00.000Z`,
              ),
            }
          : {}),
      },
      orderBy: [
        { reservationDate: "asc" },
        { startTime: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        reservationDate: true,
        startTime: true,
        endTime: true,
        purpose: true,
        status: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        facility: {
          select: { id: true, name: true, type: true, location: true },
        },
      },
    });

    return ok({ reservations: reservations.map(serializeReservation) });
  } catch (error) {
    console.error("GET /api/officer/reservations failed", error);
    return fail(500, "Gagal mengambil antrian reservasi");
  }
}
