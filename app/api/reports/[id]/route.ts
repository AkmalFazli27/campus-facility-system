import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");

  const params = await props.params;
  const reportId = Number.parseInt(params.id, 10);
  if (Number.isNaN(reportId)) {
    return fail(400, "ID laporan tidak valid");
  }

  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        facility: true,
        reporter: {
          select: { id: true, name: true, email: true, role: true },
        },
        handler: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!report) {
      return fail(404, "Laporan tidak ditemukan");
    }

    // Role check: hanya pelapor, petugas, atau admin yang boleh melihat
    if (
      report.reporterId !== user.id &&
      user.role !== "OFFICER" &&
      user.role !== "ADMIN"
    ) {
      return fail(403, "Anda tidak memiliki akses ke laporan ini");
    }

    return ok({ report });
  } catch (error) {
    console.error("Gagal mengambil detail laporan:", error);
    return fail(500, "Gagal mengambil detail laporan");
  }
}
