import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import {
  checkConflict,
  validateSlot,
} from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import { createReservationSchema } from "@/lib/validations/reservation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "USER") return fail(403, "Akses ditolak");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = createReservationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      422,
      "Data reservasi tidak valid",
      parsed.error.flatten().fieldErrors,
    );
  }

  const slot = validateSlot(parsed.data.start_time, parsed.data.end_time);
  if (!slot.valid) return fail(422, slot.message);

  try {
    const facility = await db.facility.findUnique({
      where: { id: parsed.data.facility_id },
      select: { id: true, name: true, status: true },
    });

    if (!facility) return fail(404, "Fasilitas tidak ditemukan");
    if (facility.status !== "ACTIVE") {
      return fail(
        422,
        "Fasilitas tidak dapat dipesan karena sedang tidak aktif atau dalam perbaikan",
      );
    }

    const reservationDate = new Date(
      `${parsed.data.reservation_date}T00:00:00.000Z`,
    );
    const conflict = await checkConflict(db, {
      facilityId: facility.id,
      reservationDate,
      startTime: parsed.data.start_time,
      endTime: parsed.data.end_time,
    });

    if (conflict) {
      return fail(
        409,
        "Jadwal bentrok dengan reservasi lain yang sudah disetujui",
      );
    }

    const reservation = await db.reservation.create({
      data: {
        userId: user.id,
        facilityId: facility.id,
        reservationDate,
        startTime: new Date(`1970-01-01T${parsed.data.start_time}:00.000Z`),
        endTime: new Date(`1970-01-01T${parsed.data.end_time}:00.000Z`),
        purpose: parsed.data.purpose,
        status: "PENDING",
      },
      select: {
        id: true,
        facilityId: true,
        purpose: true,
        status: true,
        createdAt: true,
      },
    });

    return ok(
      {
        reservation: {
          ...reservation,
          facility: { id: facility.id, name: facility.name },
          reservationDate: parsed.data.reservation_date,
          startTime: parsed.data.start_time,
          endTime: parsed.data.end_time,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/reservations failed", error);
    return fail(500, "Gagal membuat reservasi");
  }
}
