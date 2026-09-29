import assert from "node:assert/strict";
import { test } from "node:test";
import {
  expirePendingReservations,
  isPendingReservationExpired,
  pendingExpiryCutoffDate,
} from "@/lib/services/reservationExpiryService";

type ExpiryDatabase = Parameters<typeof expirePendingReservations>[0];
type Row = { facilityId: number; reservationDate: Date; status: string };

test("pending H-1 mulai kedaluwarsa tepat 00.00 WIB, termasuk lintas tahun", () => {
  const beforeMidnight = new Date("2026-12-30T16:59:59.000Z"); // 30 Des WIB
  const atMidnight = new Date("2026-12-30T17:00:00.000Z"); // 31 Des WIB
  const janFirst = new Date("2027-01-01T00:00:00.000Z");

  assert.equal(pendingExpiryCutoffDate(beforeMidnight).toISOString(), "2026-12-31T00:00:00.000Z");
  assert.equal(isPendingReservationExpired(janFirst, beforeMidnight), false);
  assert.equal(pendingExpiryCutoffDate(atMidnight).toISOString(), "2027-01-01T00:00:00.000Z");
  assert.equal(isPendingReservationExpired(janFirst, atMidnight), true);
});

test("sinkronisasi saat data dibuka membatalkan hanya pending H-1, aman diulang, dan mengunci fasilitas lebih dulu", async () => {
  const now = new Date("2026-10-09T17:00:00.000Z"); // 10 Okt 00:00 WIB
  const rows: Row[] = [
    { facilityId: 2, reservationDate: new Date("2026-10-11T00:00:00.000Z"), status: "PENDING" },
    { facilityId: 2, reservationDate: new Date("2026-10-12T00:00:00.000Z"), status: "PENDING" },
    { facilityId: 2, reservationDate: new Date("2026-10-11T00:00:00.000Z"), status: "APPROVED" },
    { facilityId: 3, reservationDate: new Date("2026-10-09T00:00:00.000Z"), status: "PENDING" },
  ];
  const events: string[] = [];
  const database = {
    reservation: {
      groupBy: async (args: { where: { reservationDate: { lte: Date } } }) => {
        assert.equal(args.where.reservationDate.lte.toISOString(), "2026-10-11T00:00:00.000Z");
        return [...new Set(rows
          .filter((row) => row.status === "PENDING" && row.reservationDate <= args.where.reservationDate.lte)
          .map((row) => row.facilityId))].map((facilityId) => ({ facilityId }));
      },
    },
    $transaction: async (callback: (tx: unknown) => Promise<number>) => callback({
      $queryRaw: async () => { events.push("lock-facility"); return []; },
      reservation: {
        updateMany: async (args: {
          where: { facilityId: number; status: string; reservationDate: { lte: Date } };
          data: { status: string; cancellationReason: string; processedBy: number | null; processedAt: Date };
        }) => {
          events.push("cancel-pending");
          assert.equal(args.data.status, "CANCELLED_BY_SYSTEM");
          assert.match(args.data.cancellationReason, /H-1/);
          assert.equal(args.data.processedBy, null);
          assert.equal(args.data.processedAt, now);
          const selected = rows.filter((row) =>
            row.facilityId === args.where.facilityId &&
            row.status === args.where.status &&
            row.reservationDate <= args.where.reservationDate.lte
          );
          selected.forEach((row) => { row.status = args.data.status; });
          return { count: selected.length };
        },
      },
    }),
  } as unknown as ExpiryDatabase;

  assert.equal(await expirePendingReservations(database, now), 2);
  assert.deepEqual(events, ["lock-facility", "cancel-pending", "lock-facility", "cancel-pending"]);
  assert.deepEqual(rows.map((row) => row.status), [
    "CANCELLED_BY_SYSTEM", "PENDING", "APPROVED", "CANCELLED_BY_SYSTEM",
  ]);
  assert.equal(await expirePendingReservations(database, now), 0);
  assert.equal(events.length, 4);
});
