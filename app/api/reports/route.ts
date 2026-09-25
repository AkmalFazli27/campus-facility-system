import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { createReportSchema } from "@/lib/validations/report";
import {
  createAuditLog,
  saveReportPhoto,
} from "@/lib/services/reportService";
import { ReportStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail(400, "Request harus berupa multipart/form-data");
  }

  const facilityIdRaw = formData.get("facility_id");
  const categoryRaw = formData.get("category");
  const descriptionRaw = formData.get("description");
  const photoFile = formData.get("photo");

  const parsed = createReportSchema.safeParse({
    facility_id: facilityIdRaw,
    category: categoryRaw,
    description: descriptionRaw,
  });

  if (!parsed.success) {
    return fail(
      422,
      "Data laporan tidak valid",
      parsed.error.flatten().fieldErrors
    );
  }

  if (!photoFile || !(photoFile instanceof File)) {
    return fail(422, "Foto bukti kerusakan wajib diunggah");
  }

  const facility = await db.facility.findUnique({
    where: { id: parsed.data.facility_id },
    select: { id: true, name: true, status: true },
  });

  if (!facility) {
    return fail(404, "Fasilitas tidak ditemukan");
  }

  const photoResult = await saveReportPhoto(photoFile);
  if (!photoResult.success) {
    return fail(422, photoResult.message);
  }

  try {
    const report = await db.report.create({
      data: {
        reporterId: user.id,
        facilityId: facility.id,
        category: parsed.data.category,
        description: parsed.data.description,
        photoPath: photoResult.photoPath,
        status: "NEW",
      },
      include: {
        facility: {
          select: { id: true, name: true, location: true, type: true },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await createAuditLog(db, {
      userId: user.id,
      action: "CREATE_REPORT",
      entityType: "Report",
      entityId: report.id,
      description: `Laporan kerusakan dibuat untuk fasilitas ${facility.name} (Kategori: ${report.category})`,
    });

    return ok({ report }, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan laporan:", error);
    return fail(500, "Terjadi kesalahan pada server saat membuat laporan");
  }
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const reports = await db.report.findMany({
      where: {
        reporterId: user.id,
        ...(status &&
        status !== "ALL" &&
        Object.values(ReportStatus).includes(status as ReportStatus)
          ? { status: status as ReportStatus }
          : {}),
      },
      include: {
        facility: {
          select: { id: true, name: true, location: true, type: true },
        },
        handler: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ reports });
  } catch (error) {
    console.error("Gagal mengambil daftar laporan:", error);
    return fail(500, "Gagal mengambil daftar laporan");
  }
}
