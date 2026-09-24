import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkConflict,
  validateSlot,
} from "@/lib/services/reservationService";

// Tabel keputusan approve petugas (US09): request kedua yang overlap
// dengan APPROVED → konflik (route memetakan ke 409), selainnya lolos.
// Mock menghormati where (status + id.not) agar excludeId teruji.

type Row = {
  id: number;
  status: string;
  start: string;
  end: string;
};

function mockDb(rows: Row[]) {
  return {
    reservation: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findMany: async (args: any) => {
        const where = args?.where ?? {};
        return rows
          .filter((row) => !where.status || row.status === where.status)
          .filter((row) => !where.id?.not || row.id !== where.id.not)
          .map((row) => ({
            startTime: new Date(`1970-01-01T${row.start}:00.000Z`),
            endTime: new Date(`1970-01-01T${row.end}:00.000Z`),
          }));
      },
    },
  };
}

const DATE = new Date("2026-10-01T00:00:00.000Z");

test("approve kedua yang overlap → konflik (409)", async () => {
  const db = mockDb([{ id: 1, status: "APPROVED", start: "10:00", end: "11:00" }]);
  assert.equal(
    await checkConflict(db, {
      facilityId: 1,
      reservationDate: DATE,
      startTime: "10:30",
      endTime: "11:30",
    }),
    true,
  );
});

test("approve lolos bila hanya bersentuhan di tepi", async () => {
  const db = mockDb([{ id: 1, status: "APPROVED", start: "10:00", end: "11:00" }]);
  assert.equal(
    await checkConflict(db, {
      facilityId: 1,
      reservationDate: DATE,
      startTime: "11:00",
      endTime: "12:00",
    }),
    false,
  );
});

test("approve tidak menganggap dirinya sendiri sebagai konflik", async () => {
  const db = mockDb([{ id: 7, status: "APPROVED", start: "10:00", end: "11:00" }]);
  assert.equal(
    await checkConflict(db, {
      facilityId: 1,
      reservationDate: DATE,
      startTime: "10:00",
      endTime: "11:00",
      excludeId: 7,
    }),
    false,
  );
});

test("approve mengabaikan reservasi yang masih PENDING", async () => {
  const db = mockDb([{ id: 1, status: "PENDING", start: "10:00", end: "11:00" }]);
  assert.equal(
    await checkConflict(db, {
      facilityId: 1,
      reservationDate: DATE,
      startTime: "10:30",
      endTime: "11:30",
    }),
    false,
  );
});

test("approve menolak slot invalid sebelum cek konflik", () => {
  assert.equal(validateSlot("09:10", "10:00").valid, false);
  assert.equal(validateSlot("19:30", "20:30").valid, false);
});
