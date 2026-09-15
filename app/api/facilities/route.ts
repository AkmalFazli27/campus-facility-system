import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { FacilityStatus } from "@prisma/client";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function parseCapacity(value: string | null, label: string) {
  if (value === null || value === "") return undefined;

  const capacity = Number(value);
  if (!Number.isInteger(capacity) || capacity < 0) {
    throw new Error(`${label} harus berupa bilangan bulat tidak negatif`);
  }

  return capacity;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim() || undefined;
  const type = searchParams.get("type")?.trim() || undefined;
  const location = searchParams.get("location")?.trim() || undefined;
  const date = searchParams.get("date")?.trim() || undefined;

  try {
    const capacityMin = parseCapacity(searchParams.get("capacity_min"), "Kapasitas minimum");
    const capacityMax = parseCapacity(searchParams.get("capacity_max"), "Kapasitas maksimum");

    if (capacityMin !== undefined && capacityMax !== undefined && capacityMin > capacityMax) {
      return fail(400, "Kapasitas minimum tidak boleh lebih besar dari kapasitas maksimum");
    }

    if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return fail(400, "Tanggal harus menggunakan format YYYY-MM-DD");
    }

    const facilities = await db.facility.findMany({
      where: {
        ...(query ? { name: { contains: query } } : {}),
        ...(type ? { type } : {}),
        ...(location ? { location: { contains: location } } : {}),
        ...(capacityMin !== undefined || capacityMax !== undefined
          ? {
              capacity: {
                ...(capacityMin !== undefined ? { gte: capacityMin } : {}),
                ...(capacityMax !== undefined ? { lte: capacityMax } : {}),
              },
            }
          : {}),
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
        location: true,
        capacity: true,
        description: true,
        status: true,
      },
    });

    const locations = await db.facility.findMany({
      distinct: ["location"],
      orderBy: { location: "asc" },
      select: { location: true },
    });

    return ok(facilities, {
      meta: {
        filters: {
          q: query ?? null,
          type: type ?? null,
          location: location ?? null,
          capacity_min: capacityMin ?? null,
          capacity_max: capacityMax ?? null,
          date: date ?? null,
        },
        locations: locations.map(({ location }) => location),
        statuses: Object.values(FacilityStatus),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Kapasitas")) {
      return fail(400, error.message);
    }

    console.error("GET /api/facilities failed", error);
    return fail(500, "Gagal mengambil data fasilitas");
  }
}
