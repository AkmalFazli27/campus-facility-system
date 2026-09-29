import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { getOccupancyRecap } from "@/lib/services/recapService";
import { occupancyRecapQuerySchema } from "@/lib/validations/recap";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "ADMIN") {
    return fail(403, "Hanya admin yang memiliki akses ke rekap okupansi");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const facility_id = searchParams.get("facility_id") || undefined;
  const location = searchParams.get("location") || undefined;

  const parsed = occupancyRecapQuerySchema.safeParse({
    from,
    to,
    facility_id,
    location,
  });

  if (!parsed.success) {
    return fail(
      422,
      "Parameter rekap okupansi tidak valid",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const recap = await getOccupancyRecap(parsed.data);
    return ok(recap);
  } catch (error) {
    console.error("Gagal mengambil data rekap okupansi:", error);
    return fail(500, "Gagal memproses rekap okupansi fasilitas");
  }
}
