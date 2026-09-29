import { db } from "@/lib/db";
import { todayInJakarta } from "@/lib/reservation-ui";
import { Prisma } from "@prisma/client";

export type OccupancyFacilityItem = {
  facilityId: number;
  facilityName: string;
  location: string;
  type: string;
  capacity: number;
  status: string;
  totalOperatingSlots: number;
  usedSlots: number;
  occupancyRate: number; // percentage, e.g. 45.5
  reservationCount: number;
};

export type OccupancyRecapResult = {
  period: {
    from: string;
    to: string;
    dayCount: number;
  };
  summary: {
    totalFacilities: number;
    totalReservations: number;
    totalOperatingSlots: number;
    totalUsedSlots: number;
    averageOccupancy: number; // percentage
  };
  items: OccupancyFacilityItem[];
};

export type DamageFacilityItem = {
  facilityId: number;
  facilityName: string;
  location: string;
  type: string;
  status: string;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  totalCount: number;
  topCategory: string;
};

export type DamageRecapResult = {
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalFacilities: number;
    totalReports: number;
    newReports: number;
    inProgressReports: number;
    resolvedReports: number;
    rejectedReports: number;
    topCategory: string;
  };
  items: DamageFacilityItem[];
};

export function getDefaultRecapPeriod(): { from: string; to: string } {
  const today = todayInJakarta();
  const yearMonth = today.slice(0, 7);
  return {
    from: `${yearMonth}-01`,
    to: today,
  };
}

export function calculateDateDayCount(from: string, to: string): number {
  const dFrom = new Date(`${from}T00:00:00.000Z`);
  const dTo = new Date(`${to}T00:00:00.000Z`);
  return Math.max(
    1,
    Math.round((dTo.getTime() - dFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

export async function getOccupancyRecap(filters: {
  from?: string;
  to?: string;
  facility_id?: number;
  location?: string;
}): Promise<OccupancyRecapResult> {
  const defaults = getDefaultRecapPeriod();
  const from = filters.from || defaults.from;
  const to = filters.to || defaults.to;
  const dayCount = calculateDateDayCount(from, to);

  // 13 jam operasional (07:00-20:00) = 26 slot 30 menit per hari (PRD §7.1 & §18)
  const slotsPerDay = 26;
  const totalOperatingSlotsPerFacility = dayCount * slotsPerDay;

  const facilityWhere: Prisma.FacilityWhereInput = {};
  if (filters.facility_id) {
    facilityWhere.id = filters.facility_id;
  }
  if (filters.location) {
    facilityWhere.location = { contains: filters.location };
  }

  const facilities = await db.facility.findMany({
    where: facilityWhere,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      location: true,
      type: true,
      capacity: true,
      status: true,
    },
  });

  if (facilities.length === 0) {
    return {
      period: { from, to, dayCount },
      summary: {
        totalFacilities: 0,
        totalReservations: 0,
        totalOperatingSlots: 0,
        totalUsedSlots: 0,
        averageOccupancy: 0,
      },
      items: [],
    };
  }

  const dFrom = new Date(`${from}T00:00:00.000Z`);
  const dTo = new Date(`${to}T00:00:00.000Z`);

  const reservations = await db.reservation.findMany({
    where: {
      facilityId: { in: facilities.map((f) => f.id) },
      reservationDate: {
        gte: dFrom,
        lte: dTo,
      },
      status: { in: ["APPROVED", "COMPLETED"] },
    },
    select: {
      facilityId: true,
      startTime: true,
      endTime: true,
    },
  });

  // Hitung used slots per facility
  const facilityStats = new Map<
    number,
    { usedSlots: number; reservationCount: number }
  >();

  for (const f of facilities) {
    facilityStats.set(f.id, { usedSlots: 0, reservationCount: 0 });
  }

  for (const r of reservations) {
    const stat = facilityStats.get(r.facilityId);
    if (!stat) continue;

    stat.reservationCount += 1;
    // startTime dan endTime adalah DateTime (@db.Time)
    // Hitung durasi menit
    const startHour = r.startTime.getUTCHours();
    const startMin = r.startTime.getUTCMinutes();
    const endHour = r.endTime.getUTCHours();
    const endMin = r.endTime.getUTCMinutes();

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    const durationMin = Math.max(0, endTotalMin - startTotalMin);
    const slots = Math.round(durationMin / 30);
    stat.usedSlots += slots;
  }

  let grandTotalOperatingSlots = 0;
  let grandTotalUsedSlots = 0;
  let grandTotalReservations = 0;

  const items: OccupancyFacilityItem[] = facilities.map((f) => {
    const stat = facilityStats.get(f.id) ?? { usedSlots: 0, reservationCount: 0 };
    const operatingSlots = totalOperatingSlotsPerFacility;
    const used = stat.usedSlots;
    const rate =
      operatingSlots > 0
        ? Math.min(100, Math.round((used / operatingSlots) * 1000) / 10)
        : 0;

    grandTotalOperatingSlots += operatingSlots;
    grandTotalUsedSlots += used;
    grandTotalReservations += stat.reservationCount;

    return {
      facilityId: f.id,
      facilityName: f.name,
      location: f.location,
      type: f.type,
      capacity: f.capacity,
      status: f.status,
      totalOperatingSlots: operatingSlots,
      usedSlots: used,
      occupancyRate: rate,
      reservationCount: stat.reservationCount,
    };
  });

  const averageOccupancy =
    grandTotalOperatingSlots > 0
      ? Math.min(
          100,
          Math.round((grandTotalUsedSlots / grandTotalOperatingSlots) * 1000) / 10
        )
      : 0;

  return {
    period: { from, to, dayCount },
    summary: {
      totalFacilities: facilities.length,
      totalReservations: grandTotalReservations,
      totalOperatingSlots: grandTotalOperatingSlots,
      totalUsedSlots: grandTotalUsedSlots,
      averageOccupancy,
    },
    items,
  };
}

export async function getDamageRecap(filters: {
  from?: string;
  to?: string;
  facility_id?: number;
  location?: string;
  category?: string;
}): Promise<DamageRecapResult> {
  const defaults = getDefaultRecapPeriod();
  const from = filters.from || defaults.from;
  const to = filters.to || defaults.to;

  const facilityWhere: Prisma.FacilityWhereInput = {};
  if (filters.facility_id) {
    facilityWhere.id = filters.facility_id;
  }
  if (filters.location) {
    facilityWhere.location = { contains: filters.location };
  }

  const facilities = await db.facility.findMany({
    where: facilityWhere,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      location: true,
      type: true,
      status: true,
    },
  });

  if (facilities.length === 0) {
    return {
      period: { from, to },
      summary: {
        totalFacilities: 0,
        totalReports: 0,
        newReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        rejectedReports: 0,
        topCategory: "-",
      },
      items: [],
    };
  }

  const dFrom = new Date(`${from}T00:00:00.000Z`);
  const dTo = new Date(`${to}T23:59:59.999Z`);

  const reportWhere: Prisma.ReportWhereInput = {
    facilityId: { in: facilities.map((f) => f.id) },
    createdAt: {
      gte: dFrom,
      lte: dTo,
    },
  };

  if (filters.category) {
    reportWhere.category = filters.category;
  }

  const reports = await db.report.findMany({
    where: reportWhere,
    select: {
      facilityId: true,
      status: true,
      category: true,
    },
  });

  const facilityReportMap = new Map<
    number,
    {
      newCount: number;
      inProgressCount: number;
      resolvedCount: number;
      rejectedCount: number;
      categoryCounts: Map<string, number>;
    }
  >();

  for (const f of facilities) {
    facilityReportMap.set(f.id, {
      newCount: 0,
      inProgressCount: 0,
      resolvedCount: 0,
      rejectedCount: 0,
      categoryCounts: new Map<string, number>(),
    });
  }

  const globalCategoryCounts = new Map<string, number>();

  for (const r of reports) {
    const fData = facilityReportMap.get(r.facilityId);
    if (fData) {
      if (r.status === "NEW") fData.newCount += 1;
      else if (r.status === "IN_PROGRESS") fData.inProgressCount += 1;
      else if (r.status === "RESOLVED") fData.resolvedCount += 1;
      else if (r.status === "REJECTED") fData.rejectedCount += 1;

      const curCount = fData.categoryCounts.get(r.category) || 0;
      fData.categoryCounts.set(r.category, curCount + 1);
    }

    const gCount = globalCategoryCounts.get(r.category) || 0;
    globalCategoryCounts.set(r.category, gCount + 1);
  }

  let grandTotalNew = 0;
  let grandTotalInProgress = 0;
  let grandTotalResolved = 0;
  let grandTotalRejected = 0;

  const items: DamageFacilityItem[] = facilities.map((f) => {
    const data = facilityReportMap.get(f.id) ?? {
      newCount: 0,
      inProgressCount: 0,
      resolvedCount: 0,
      rejectedCount: 0,
      categoryCounts: new Map<string, number>(),
    };

    let topCat = "-";
    let maxCatCount = 0;
    for (const [cat, count] of data.categoryCounts.entries()) {
      if (count > maxCatCount) {
        maxCatCount = count;
        topCat = cat;
      }
    }

    const totalCount =
      data.newCount + data.inProgressCount + data.resolvedCount + data.rejectedCount;

    grandTotalNew += data.newCount;
    grandTotalInProgress += data.inProgressCount;
    grandTotalResolved += data.resolvedCount;
    grandTotalRejected += data.rejectedCount;

    return {
      facilityId: f.id,
      facilityName: f.name,
      location: f.location,
      type: f.type,
      status: f.status,
      newCount: data.newCount,
      inProgressCount: data.inProgressCount,
      resolvedCount: data.resolvedCount,
      rejectedCount: data.rejectedCount,
      totalCount,
      topCategory: topCat,
    };
  });

  let overallTopCategory = "-";
  let maxGlobalCount = 0;
  for (const [cat, count] of globalCategoryCounts.entries()) {
    if (count > maxGlobalCount) {
      maxGlobalCount = count;
      overallTopCategory = cat;
    }
  }

  const grandTotalReports =
    grandTotalNew + grandTotalInProgress + grandTotalResolved + grandTotalRejected;

  return {
    period: { from, to },
    summary: {
      totalFacilities: facilities.length,
      totalReports: grandTotalReports,
      newReports: grandTotalNew,
      inProgressReports: grandTotalInProgress,
      resolvedReports: grandTotalResolved,
      rejectedReports: grandTotalRejected,
      topCategory: overallTopCategory,
    },
    items,
  };
}
