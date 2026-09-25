import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import {
  findOverlappingRanges,
  serializeReservation,
} from "@/lib/services/reservationService";
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
        status:
          status === "ALL"
            ? { in: ["PENDING", "APPROVED"] }
            : status,
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

    const pendingReservations = reservations.filter(
      (reservation) => reservation.status === "PENDING",
    );
    const approvedCandidates =
      pendingReservations.length === 0
        ? []
        : await db.reservation.findMany({
            where: {
              status: "APPROVED",
              facilityId: {
                in: [...new Set(pendingReservations.map((row) => row.facility.id))],
              },
              reservationDate: {
                in: pendingReservations.map((row) => row.reservationDate),
              },
            },
            select: {
              id: true,
              facilityId: true,
              reservationDate: true,
              startTime: true,
              endTime: true,
            },
          });

    return ok({
      reservations: reservations.map((reservation) => {
        const serialized = serializeReservation(reservation);
        const conflicts =
          reservation.status !== "PENDING"
            ? []
            : findOverlappingRanges(
                serialized.startTime,
                serialized.endTime,
                approvedCandidates
                  .filter(
                    (candidate) =>
                      candidate.facilityId === reservation.facility.id &&
                      candidate.reservationDate.getTime() ===
                        reservation.reservationDate.getTime(),
                  )
                  .map((candidate) => ({
                    id: candidate.id,
                    startTime: candidate.startTime.toISOString().slice(11, 16),
                    endTime: candidate.endTime.toISOString().slice(11, 16),
                  })),
              );

        return { ...serialized, conflicts };
      }),
    });
  } catch (error) {
    console.error("GET /api/officer/reservations failed", error);
    return fail(500, "Gagal mengambil antrian reservasi");
  }
}
