import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { ReportStatus } from "@prisma/client";

export const runtime = "nodejs";

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
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ reports });
  } catch (error) {
    console.error("Gagal mengambil laporan saya:", error);
    return fail(500, "Gagal mengambil data laporan");
  }
}
