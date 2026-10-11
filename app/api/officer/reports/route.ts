import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { ReportStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail(403, "Akses ditolak: Hanya untuk petugas dan admin");
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const facilityIdRaw = searchParams.get("facility_id");

  const facilityId = facilityIdRaw ? Number.parseInt(facilityIdRaw, 10) : undefined;

  try {
    const reports = await db.report.findMany({
      where: {
        ...(status && status !== "ALL" && Object.values(ReportStatus).includes(status as ReportStatus)
          ? { status: status as ReportStatus }
          : {}),
        ...(facilityId && !Number.isNaN(facilityId) ? { facilityId } : {}),
      },
      include: {
        facility: {
          select: { id: true, name: true, location: true, type: true, status: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, identityNumber: true },
        },
        handler: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [
        // Urutkan status NEW terlebih dahulu, kemudian yang terbaru
        { createdAt: "desc" },
      ],
    });

    // Hitung counter untuk memudahkan antrian dashboard
    const counts = await db.report.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const statusCounts = {
      NEW: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };

    for (const c of counts) {
      statusCounts[c.status] = c._count._all;
    }

    return ok({ reports, counts: statusCounts });
  } catch (error) {
    console.error("Gagal mengambil antrian laporan petugas:", error);
    return fail(500, "Gagal mengambil data laporan");
  }
}
