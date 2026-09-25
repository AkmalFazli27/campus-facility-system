import { fail, ok } from "@/lib/http";
import { getFacilityById } from "@/lib/services/facilityService";
import { facilityIdSchema } from "@/lib/validations/facility";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const parsedId = facilityIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID fasilitas tidak valid");

  try {
    const facility = await getFacilityById(parsedId.data);
    if (!facility) return fail(404, "Fasilitas tidak ditemukan");

    return ok({ facility });
  } catch (error) {
    console.error(`GET /api/facilities/${parsedId.data} failed`, error);
    return fail(500, "Gagal mengambil detail fasilitas");
  }
}
