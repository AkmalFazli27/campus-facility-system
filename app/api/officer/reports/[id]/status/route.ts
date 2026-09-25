import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import {
  createAuditLog,
  isValidReportTransition,
} from "@/lib/services/reportService";
import { updateReportStatusSchema } from "@/lib/validations/report";

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
  const reportId = Number.parseInt(params.id, 10);
  if (Number.isNaN(reportId)) {
    return fail(400, "ID laporan tidak valid");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = updateReportStatusSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      422,
      "Data perubahan status tidak valid",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const existing = await db.report.findUnique({
      where: { id: reportId },
      include: { facility: true },
    });

    if (!existing) {
      return fail(404, "Laporan tidak ditemukan");
    }

    if (!isValidReportTransition(existing.status, parsed.data.status)) {
      return fail(
        422,
        `Perubahan status dari "${existing.status}" ke "${parsed.data.status}" tidak diizinkan`
      );
    }

    const updated = await db.report.update({
      where: { id: reportId },
      data: {
        status: parsed.data.status,
        handledBy: user.id,
        handledAt: new Date(),
        resolutionNotes:
          parsed.data.resolution_notes !== undefined
            ? parsed.data.resolution_notes
            : existing.resolutionNotes,
      },
      include: {
        facility: {
          select: { id: true, name: true, location: true, status: true },
        },
        reporter: {
          select: { id: true, name: true, email: true },
        },
        handler: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await createAuditLog(db, {
      userId: user.id,
      action: "UPDATE_REPORT_STATUS",
      entityType: "Report",
      entityId: updated.id,
      description: `Petugas ${user.name} mengubah status laporan #${updated.id} dari ${existing.status} ke ${updated.status}`,
    });

    return ok({ report: updated });
  } catch (error) {
    console.error("Gagal memperbarui status laporan:", error);
    return fail(500, "Gagal memperbarui status laporan");
  }
}
