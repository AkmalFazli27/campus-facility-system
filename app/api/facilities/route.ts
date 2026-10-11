import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { buildFacilityAvailabilitySummary } from "@/lib/services/facilityAvailabilityService";
import { availabilityQuerySchema, createFacilitySchema } from "@/lib/validations/facility";
import { getSessionUser } from "@/lib/session";
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

    let parsedDate: string | undefined;
    if (date !== undefined) {
      const parsed = availabilityQuerySchema.safeParse({ date });
      if (!parsed.success) {
        return fail(400, "Tanggal harus valid dengan format YYYY-MM-DD", parsed.error.flatten().fieldErrors);
      }
      parsedDate = parsed.data.date;
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

    let data = facilities;
    if (parsedDate && facilities.length > 0) {
      const approvedReservations = await db.reservation.findMany({
        where: {
          facilityId: { in: facilities.map((facility) => facility.id) },
          reservationDate: new Date(`${parsedDate}T00:00:00.000Z`),
          status: "APPROVED",
        },
        select: { facilityId: true, startTime: true, endTime: true },
      });
      const reservationsByFacility = new Map<number, typeof approvedReservations>();
      for (const reservation of approvedReservations) {
        const reservations = reservationsByFacility.get(reservation.facilityId) ?? [];
        reservations.push(reservation);
        reservationsByFacility.set(reservation.facilityId, reservations);
      }

      data = facilities.map((facility) => ({
        ...facility,
        availability: buildFacilityAvailabilitySummary(
          facility.status,
          parsedDate,
          reservationsByFacility.get(facility.id) ?? [],
        ),
      }));
    }

    return ok(data, {
      meta: {
        filters: {
          q: query ?? null,
          type: type ?? null,
          location: location ?? null,
          capacity_min: capacityMin ?? null,
          capacity_max: capacityMax ?? null,
          date: parsedDate ?? null,
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

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin) return fail(401, "Belum login");
  if (admin.role !== "ADMIN") return fail(403, "Akses ditolak: Hanya untuk admin");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = createFacilitySchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Data fasilitas tidak valid", parsed.error.flatten().fieldErrors);
  }

  const { name, type, location, capacity, description, status } = parsed.data;

  try {
    const existing = await db.facility.findUnique({
      where: { name },
    });
    if (existing) {
      return fail(409, "Nama fasilitas sudah digunakan");
    }

    const facility = await db.facility.create({
      data: {
        name,
        type,
        location,
        capacity,
        description: description || null,
        status,
      },
    });

    return ok({ facility }, { status: 201 });
  } catch (error) {
    console.error("POST /api/facilities failed", error);
    return fail(500, "Gagal membuat fasilitas baru");
  }
}
