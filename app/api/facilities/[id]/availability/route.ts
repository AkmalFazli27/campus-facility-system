import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getFacilityAvailability } from "@/lib/services/facilityAvailabilityService";
import {
  availabilityQuerySchema,
  facilityIdSchema,
} from "@/lib/validations/facility";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const parsedId = facilityIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID fasilitas tidak valid");

  const searchParams = new URL(request.url).searchParams;
  const parsedQuery = availabilityQuerySchema.safeParse({
    date: searchParams.get("date") ?? undefined,
  });
  if (!parsedQuery.success) {
    return fail(
      400,
      "Parameter availability tidak valid",
      parsedQuery.error.flatten().fieldErrors,
    );
  }

  const reservationDate = new Date(`${parsedQuery.data.date}T00:00:00.000Z`);

  try {
    const availability = await getFacilityAvailability(db, {
      facilityId: parsedId.data,
      reservationDate,
    });

    if (!availability) return fail(404, "Fasilitas tidak ditemukan");

    return ok({
      facility: availability.facility,
      date: parsedQuery.data.date,
      slots: availability.slots,
    });
  } catch (error) {
    console.error(`GET /api/facilities/${parsedId.data}/availability failed`, error);
    return fail(500, "Gagal mengambil ketersediaan fasilitas");
  }
}
