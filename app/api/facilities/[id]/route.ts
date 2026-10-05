import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { getFacilityById } from "@/lib/services/facilityService";
import { facilityIdSchema, updateFacilitySchema } from "@/lib/validations/facility";

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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getSessionUser();
  if (!admin) return fail(401, "Belum login");
  if (admin.role !== "ADMIN") return fail(403, "Akses ditolak: Hanya untuk admin");

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

  const parsed = updateFacilitySchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Data fasilitas tidak valid", parsed.error.flatten().fieldErrors);
  }

  try {
    const existing = await db.facility.findUnique({
      where: { id: facilityId },
    });
    if (!existing) return fail(404, "Fasilitas tidak ditemukan");

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await db.facility.findFirst({
        where: {
          name: parsed.data.name,
          NOT: { id: facilityId },
        },
      });
      if (duplicate) return fail(409, "Nama fasilitas sudah digunakan oleh fasilitas lain");
    }

    const facility = await db.facility.update({
      where: { id: facilityId },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.type !== undefined ? { type: parsed.data.type } : {}),
        ...(parsed.data.location !== undefined ? { location: parsed.data.location } : {}),
        ...(parsed.data.capacity !== undefined ? { capacity: parsed.data.capacity } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description || null } : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      },
    });

    return ok({ facility });
  } catch (error) {
    console.error(`PUT /api/facilities/${facilityId} failed`, error);
    return fail(500, "Gagal memperbarui fasilitas");
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getSessionUser();
  if (!admin) return fail(401, "Belum login");
  if (admin.role !== "ADMIN") return fail(403, "Akses ditolak: Hanya untuk admin");

  const { id: rawId } = await context.params;
  const parsedId = facilityIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID fasilitas tidak valid");
  const facilityId = parsedId.data;

  try {
    const existing = await db.facility.findUnique({
      where: { id: facilityId },
      include: {
        _count: {
          select: { reservations: true, reports: true },
        },
      },
    });
    if (!existing) return fail(404, "Fasilitas tidak ditemukan");

    // Jika memiliki riwayat reservasi atau laporan, nonaktifkan fasilitas (US16 AC2)
    if (existing._count.reservations > 0 || existing._count.reports > 0) {
      const updated = await db.facility.update({
        where: { id: facilityId },
        data: { status: "INACTIVE" },
      });
      return ok({
        message: "Fasilitas memiliki riwayat dan telah dinonaktifkan (INACTIVE)",
        facility: updated,
      });
    }

    // Jika belum memiliki riwayat sama sekali, aman dihapus
    await db.facility.delete({ where: { id: facilityId } });
    return ok({ message: "Fasilitas berhasil dihapus" });
  } catch (error) {
    console.error(`DELETE /api/facilities/${facilityId} failed`, error);
    return fail(500, "Gagal memproses penghapusan fasilitas");
  }
}
