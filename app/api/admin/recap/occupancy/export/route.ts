import { fail } from "@/lib/http";
import { getSessionUser } from "@/lib/session";
import { getOccupancyRecap } from "@/lib/services/recapService";
import { generateOccupancyRecapPdf } from "@/lib/services/pdfService";
import { occupancyRecapQuerySchema } from "@/lib/validations/recap";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "ADMIN") {
    return fail(403, "Hanya admin yang dapat mengekspor rekap okupansi");
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
      "Parameter export rekap okupansi tidak valid",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const recap = await getOccupancyRecap(parsed.data);

    let filterDesc = "Semua Fasilitas";
    if (parsed.data.facility_id && recap.items.length > 0) {
      filterDesc = `Fasilitas: ${recap.items[0].facilityName}`;
    } else if (parsed.data.location) {
      filterDesc = `Lokasi: ${parsed.data.location}`;
    }

    const pdfBuffer = await generateOccupancyRecapPdf(recap, {
      adminName: user.name,
      printedAt: new Date(),
      filterDescription: filterDesc,
    });

    const filename = `rekap-okupansi-${recap.period.from}-sd-${recap.period.to}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Gagal mengekspor PDF rekap okupansi:", error);
    return fail(500, "Gagal membuat dokumen PDF rekap okupansi");
  }
}
