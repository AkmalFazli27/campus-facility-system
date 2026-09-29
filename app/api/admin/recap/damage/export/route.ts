import { fail } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { getDamageRecap } from "@/lib/services/recapService";
import { generateDamageRecapPdf } from "@/lib/services/pdfService";
import { damageRecapQuerySchema } from "@/lib/validations/recap";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "ADMIN") {
    return fail(403, "Hanya admin yang dapat mengekspor rekap kerusakan");
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
      "Parameter export rekap kerusakan tidak valid",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const recap = await getDamageRecap(parsed.data);

    const filterParts: string[] = [];
    if (parsed.data.facility_id && recap.items.length > 0) {
      filterParts.push(`Fasilitas: ${recap.items[0].facilityName}`);
    } else if (parsed.data.location) {
      filterParts.push(`Lokasi: ${parsed.data.location}`);
    }
    if (parsed.data.category) {
      filterParts.push(`Kategori: ${parsed.data.category}`);
    }

    const filterDesc =
      filterParts.length > 0 ? filterParts.join(" • ") : "Semua Fasilitas & Kategori";

    const pdfBuffer = await generateDamageRecapPdf(recap, {
      adminName: user.name,
      printedAt: new Date(),
      filterDescription: filterDesc,
    });

    const filename = `rekap-kerusakan-${recap.period.from}-sd-${recap.period.to}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Gagal mengekspor PDF rekap kerusakan:", error);
    return fail(500, "Gagal membuat dokumen PDF rekap kerusakan");
  }
}
