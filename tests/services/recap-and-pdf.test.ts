import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateDateDayCount,
  getDefaultRecapPeriod,
  type OccupancyRecapResult,
  type DamageRecapResult,
} from "@/lib/services/recapService";
import {
  generateOccupancyRecapPdf,
  generateDamageRecapPdf,
} from "@/lib/services/pdfService";

test("calculateDateDayCount menghitung jumlah hari inklusif dengan benar", () => {
  assert.equal(calculateDateDayCount("2026-09-01", "2026-09-01"), 1);
  assert.equal(calculateDateDayCount("2026-09-01", "2026-09-07"), 7);
  assert.equal(calculateDateDayCount("2026-09-01", "2026-09-30"), 30);
});

test("getDefaultRecapPeriod menghasilkan rentang tanggal awal bulan sampai hari ini", () => {
  const period = getDefaultRecapPeriod();
  assert.ok(period.from.endsWith("-01"));
  assert.ok(period.from <= period.to);
});

test("generateOccupancyRecapPdf menghasilkan buffer PDF valid dengan header %PDF", async () => {
  const mockOccupancy: OccupancyRecapResult = {
    period: {
      from: "2026-09-01",
      to: "2026-09-10",
      dayCount: 10,
    },
    summary: {
      totalFacilities: 2,
      totalReservations: 5,
      totalOperatingSlots: 520,
      totalUsedSlots: 20,
      averageOccupancy: 3.8,
    },
    items: [
      {
        facilityId: 1,
        facilityName: "Ruang Kelas A101",
        location: "Gedung Kuliah Bersama Lt. 1",
        type: "Kelas",
        capacity: 40,
        status: "ACTIVE",
        totalOperatingSlots: 260,
        usedSlots: 14,
        occupancyRate: 5.4,
        reservationCount: 3,
      },
      {
        facilityId: 2,
        facilityName: "Lab Komputer 1",
        location: "Gedung TI Lt. 2",
        type: "Laboratorium",
        capacity: 30,
        status: "ACTIVE",
        totalOperatingSlots: 260,
        usedSlots: 6,
        occupancyRate: 2.3,
        reservationCount: 2,
      },
    ],
  };

  const buffer = await generateOccupancyRecapPdf(mockOccupancy, {
    adminName: "Admin Test",
    filterDescription: "Semua Fasilitas",
  });

  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 1000, "Ukuran PDF harus lebih dari 1KB");
  // Cek magic number %PDF
  const pdfHeader = buffer.subarray(0, 4).toString("utf-8");
  assert.equal(pdfHeader, "%PDF");
});

test("generateDamageRecapPdf menghasilkan buffer PDF valid dengan header %PDF", async () => {
  const mockDamage: DamageRecapResult = {
    period: {
      from: "2026-09-01",
      to: "2026-09-10",
    },
    summary: {
      totalFacilities: 2,
      totalReports: 4,
      newReports: 1,
      inProgressReports: 1,
      resolvedReports: 2,
      rejectedReports: 0,
      topCategory: "Kelistrikan & Lampu",
    },
    items: [
      {
        facilityId: 1,
        facilityName: "Ruang Kelas A101",
        location: "Gedung Kuliah Bersama Lt. 1",
        type: "Kelas",
        status: "ACTIVE",
        newCount: 1,
        inProgressCount: 0,
        resolvedCount: 1,
        rejectedCount: 0,
        totalCount: 2,
        topCategory: "Kelistrikan & Lampu",
      },
      {
        facilityId: 2,
        facilityName: "Lab Komputer 1",
        location: "Gedung TI Lt. 2",
        type: "Laboratorium",
        status: "UNDER_MAINTENANCE",
        newCount: 0,
        inProgressCount: 1,
        resolvedCount: 1,
        rejectedCount: 0,
        totalCount: 2,
        topCategory: "Jaringan & Internet",
      },
    ],
  };

  const buffer = await generateDamageRecapPdf(mockDamage, {
    adminName: "Admin Test",
    filterDescription: "Semua Fasilitas & Kategori",
  });

  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 1000, "Ukuran PDF harus lebih dari 1KB");
  const pdfHeader = buffer.subarray(0, 4).toString("utf-8");
  assert.equal(pdfHeader, "%PDF");
});
