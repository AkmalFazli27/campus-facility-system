import { fail, ok } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { getDamageRecap } from "@/lib/services/recapService";
import { damageRecapQuerySchema } from "@/lib/validations/recap";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "ADMIN") {
    return fail(403, "Hanya admin yang memiliki akses ke rekap kerusakan");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const facility_id = searchParams.get("facility_id") || undefined;
  const location = searchParams.get("location") || undefined;
  const category = searchParams.get("category") || undefined;

  const parsed = damageRecapQuerySchema.safeParse({
    from,
    to,
    facility_id,
    location,
    category,
  });

  if (!parsed.success) {
    return fail(
      422,
      "Parameter rekap kerusakan tidak valid",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const recap = await getDamageRecap(parsed.data);
    return ok(recap);
  } catch (error) {
    console.error("Gagal mengambil data rekap kerusakan:", error);
    return fail(500, "Gagal memproses rekap kerusakan fasilitas");
  }
}
