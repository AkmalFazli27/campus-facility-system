import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildAvailabilitySlots,
  buildFacilityAvailabilitySummary,
  getFacilityAvailability,
  type FacilityAvailabilityReader,
} from "@/lib/services/facilityAvailabilityService";

test("buildAvailabilitySlots menghasilkan 26 slot 30 menit", () => {
  const slots = buildAvailabilitySlots();

  assert.equal(slots.length, 26);
  assert.deepEqual(slots[0], {
    start: "07:00",
    end: "07:30",
    available: true,
    reason: null,
  });
  assert.deepEqual(slots.at(-1), {
    start: "19:30",
    end: "20:00",
    available: true,
    reason: null,
  });
});

test("buildAvailabilitySlots menghasilkan slot berurutan tanpa jeda", () => {
  const slots = buildAvailabilitySlots();

  for (let index = 1; index < slots.length; index += 1) {
    assert.equal(slots[index - 1].end, slots[index].start);
    assert.equal(slots[index].available, true);
    assert.equal(slots[index].reason, null);
  }
});

function createDatabase(
  status: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE" = "ACTIVE",
  reservations: Array<{ startTime: string; endTime: string }> = [],
): FacilityAvailabilityReader {
  return {
    facility: {
      findUnique: async () => ({ id: 1, name: "Lab Komputer", status }),
    },
    reservation: {
      findMany: async () =>
        reservations.map(({ startTime, endTime }) => ({
          startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
          endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
        })),
    },
  };
}

test("getFacilityAvailability membiarkan semua slot tersedia tanpa reservasi", async () => {
  const result = await getFacilityAvailability(createDatabase(), {
    facilityId: 1,
    reservationDate: new Date("2026-09-24T00:00:00.000Z"),
  });

  assert.ok(result);
  assert.equal(result.slots.every((slot) => slot.available), true);
});

test("getFacilityAvailability menandai slot yang overlap reservasi approved", async () => {
  const result = await getFacilityAvailability(
    createDatabase("ACTIVE", [{ startTime: "09:00", endTime: "10:00" }]),
    { facilityId: 1, reservationDate: new Date("2026-09-24T00:00:00.000Z") },
  );

  assert.ok(result);
  assert.deepEqual(result.slots.find((slot) => slot.start === "09:00"), {
    start: "09:00",
    end: "09:30",
    available: false,
    reason: "Sudah disetujui",
  });
  assert.deepEqual(result.slots.find((slot) => slot.start === "09:30"), {
    start: "09:30",
    end: "10:00",
    available: false,
    reason: "Sudah disetujui",
  });
  assert.equal(result.slots.find((slot) => slot.start === "10:00")?.available, true);
});

test("getFacilityAvailability menandai semua slot saat fasilitas tidak aktif", async () => {
  const result = await getFacilityAvailability(createDatabase("INACTIVE"), {
    facilityId: 1,
    reservationDate: new Date("2026-09-24T00:00:00.000Z"),
  });

  assert.ok(result);
  assert.equal(result.slots.every((slot) => !slot.available), true);
  assert.equal(result.slots.every((slot) => slot.reason === "Fasilitas tidak aktif"), true);
});

test("getFacilityAvailability menandai semua slot saat maintenance", async () => {
  const result = await getFacilityAvailability(createDatabase("UNDER_MAINTENANCE"), {
    facilityId: 1,
    reservationDate: new Date("2026-09-24T00:00:00.000Z"),
  });

  assert.ok(result);
  assert.equal(result.slots.every((slot) => !slot.available), true);
  assert.equal(
    result.slots.every((slot) => slot.reason === "Fasilitas sedang dalam perbaikan"),
    true,
  );
});

test("getFacilityAvailability mengembalikan null bila fasilitas tidak ditemukan", async () => {
  const database = createDatabase();
  database.facility.findUnique = async () => null;

  const result = await getFacilityAvailability(database, {
    facilityId: 999,
    reservationDate: new Date("2026-09-24T00:00:00.000Z"),
  });

  assert.equal(result, null);
});

test("getFacilityAvailability hanya membaca reservasi approved", async () => {
  let query: unknown;
  const database = createDatabase();
  database.reservation.findMany = async (args) => {
    query = args;
    return [];
  };

  await getFacilityAvailability(database, {
    facilityId: 1,
    reservationDate: new Date("2026-09-24T00:00:00.000Z"),
  });

  assert.equal((query as { where: { status: string } }).where.status, "APPROVED");
});

test("buildFacilityAvailabilitySummary menghitung slot dan menggabungkan rentang booking", () => {
  const summary = buildFacilityAvailabilitySummary(
    "ACTIVE",
    "2026-09-24",
    [{
      startTime: new Date("1970-01-01T09:00:00.000Z"),
      endTime: new Date("1970-01-01T10:00:00.000Z"),
    }],
  );

  assert.equal(summary.totalSlots, 26);
  assert.equal(summary.availableSlots, 24);
  assert.equal(summary.unavailableSlots, 2);
  assert.deepEqual(summary.unavailableRanges, [
    { start: "09:00", end: "10:00", reason: "Sudah disetujui" },
  ]);
});

test("buildFacilityAvailabilitySummary menutup semua slot saat maintenance", () => {
  const summary = buildFacilityAvailabilitySummary("UNDER_MAINTENANCE", "2026-09-24", []);

  assert.equal(summary.availableSlots, 0);
  assert.equal(summary.unavailableSlots, 26);
  assert.deepEqual(summary.unavailableRanges, [
    {
      start: "07:00",
      end: "20:00",
      reason: "Fasilitas sedang dalam perbaikan",
    },
  ]);
});
