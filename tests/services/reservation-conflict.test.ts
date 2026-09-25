import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkConflict,
  hasOverlap,
  isPastStart,
} from "@/lib/services/reservationService";

test("hasOverlap mendeteksi tumpang tindih interval [s, e)", () => {
  assert.equal(hasOverlap("10:00", "11:00", "10:30", "11:30"), true);
  assert.equal(hasOverlap("10:00", "11:00", "09:00", "10:30"), true);
  assert.equal(hasOverlap("10:00", "11:00", "10:00", "11:00"), true);
});

test("hasOverlap mengizinkan sentuhan di tepi", () => {
  assert.equal(hasOverlap("10:00", "11:00", "11:00", "12:00"), false);
  assert.equal(hasOverlap("11:00", "12:00", "10:00", "11:00"), false);
  assert.equal(hasOverlap("09:00", "10:00", "11:00", "12:00"), false);
});

function mockDb(rows: Array<{ start: string; end: string }>) {
  return {
    reservation: {
      findMany: async () =>
        rows.map((row) => ({
          startTime: new Date(`1970-01-01T${row.start}:00.000Z`),
          endTime: new Date(`1970-01-01T${row.end}:00.000Z`),
        })),
    },
  };
}

test("checkConflict true bila ada approved yang overlap", async () => {
  const db = mockDb([{ start: "10:00", end: "11:00" }]);
  assert.equal(
    await checkConflict(db, {
      facilityId: 1,
      reservationDate: new Date("2026-10-01T00:00:00.000Z"),
      startTime: "10:30",
      endTime: "11:30",
    }),
    true,
  );
});

test("checkConflict false bila hanya bersentuhan di tepi / beda jam", async () => {
  const db = mockDb([{ start: "10:00", end: "11:00" }]);
  assert.equal(
    await checkConflict(db, {
      facilityId: 1,
      reservationDate: new Date("2026-10-01T00:00:00.000Z"),
      startTime: "11:00",
      endTime: "12:00",
    }),
    false,
  );
  assert.equal(
    await checkConflict(mockDb([]), {
      facilityId: 1,
      reservationDate: new Date("2026-10-01T00:00:00.000Z"),
      startTime: "10:00",
      endTime: "11:00",
    }),
    false,
  );
});

test("checkConflict hanya meminta reservasi APPROVED sebagai pengunci slot", async () => {
  let receivedWhere: unknown;
  const db = {
    reservation: {
      findMany: async (args: unknown) => {
        receivedWhere = (args as { where?: unknown }).where;
        return [];
      },
    },
  };

  assert.equal(
    await checkConflict(db, {
      facilityId: 1,
      reservationDate: new Date("2026-10-01T00:00:00.000Z"),
      startTime: "10:00",
      endTime: "11:00",
    }),
    false,
  );
  assert.deepEqual(receivedWhere, {
    facilityId: 1,
    reservationDate: new Date("2026-10-01T00:00:00.000Z"),
    status: "APPROVED",
  });
});

test("isPastStart menolak pembatalan setelah waktu mulai (WIB)", () => {
  const now = new Date("2026-10-01T10:00:00+07:00");
  assert.equal(isPastStart("2026-10-01", "09:00", now), true);
  assert.equal(isPastStart("2026-10-01", "10:00", now), true);
  assert.equal(isPastStart("2026-10-01", "11:00", now), false);
  assert.equal(isPastStart("2026-10-02", "07:00", now), false);
});
