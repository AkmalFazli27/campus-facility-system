import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { facilityIdSchema, updateFacilityStatusSchema } from "@/lib/validations/facility";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "ADMIN" && user.role !== "OFFICER") {
    return fail(403, "Akses ditolak: Hanya untuk admin dan petugas");
  }

  const { id: rawId } = await context.params;
  const parsedId = facilityIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID fasilitas tidak valid");
  const facilityId = parsedId.data;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = updateFacilityStatusSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Status fasilitas tidak valid", parsed.error.flatten().fieldErrors);
  }

  try {
    const existing = await db.facility.findUnique({
      where: { id: facilityId },
    });
    if (!existing) return fail(404, "Fasilitas tidak ditemukan");

    const facility = await db.facility.update({
      where: { id: facilityId },
      data: { status: parsed.data.status },
    });

    return ok({ facility });
  } catch (error) {
    console.error(`PATCH /api/facilities/${facilityId}/status failed`, error);
    return fail(500, "Gagal mengubah status fasilitas");
  }
}
