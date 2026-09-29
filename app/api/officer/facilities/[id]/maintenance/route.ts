import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { createAuditLog } from "@/lib/services/reportService";
import { toggleFacilityMaintenanceSchema } from "@/lib/validations/report";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail(403, "Akses ditolak: Hanya untuk petugas dan admin");
  }

  const params = await props.params;
  const facilityId = Number.parseInt(params.id, 10);
  if (Number.isNaN(facilityId)) {
    return fail(400, "ID fasilitas tidak valid");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = toggleFacilityMaintenanceSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      422,
      "Status fasilitas tidak valid",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const existing = await db.facility.findUnique({
      where: { id: facilityId },
    });

    if (!existing) {
      return fail(404, "Fasilitas tidak ditemukan");
    }

    const updated = await db.facility.update({
      where: { id: facilityId },
      data: {
        status: parsed.data.status,
      },
    });

    await createAuditLog(db, {
      userId: user.id,
      action: "UPDATE_FACILITY_MAINTENANCE",
      entityType: "Facility",
      entityId: updated.id,
      description: `Petugas ${user.name} mengubah status fasilitas ${updated.name} dari ${existing.status} menjadi ${updated.status}`,
    });

    return ok({ facility: updated });
  } catch (error) {
    console.error("Gagal mengubah status pemeliharaan fasilitas:", error);
    return fail(500, "Gagal mengubah status fasilitas");
  }
}
