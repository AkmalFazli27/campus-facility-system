import assert from "node:assert/strict";
import { test } from "node:test";
import {
  approveReservation,
  rejectReservation,
} from "@/lib/services/reservationApprovalService";

type ApprovalDatabase = Parameters<typeof approveReservation>[0];

function createDatabase(options?: {
  status?: "PENDING" | "APPROVED";
  facilityStatus?: "ACTIVE" | "UNDER_MAINTENANCE";
  conflictingRanges?: Array<{ startTime: Date; endTime: Date }>;
}) {
  const events: string[] = [];
  let rawQueryCount = 0;
  let updated = false;

  const transaction = {
    $queryRaw: async () => {
      rawQueryCount += 1;
      events.push(rawQueryCount === 1 ? "lock-reservation" : "lock-facility");
      return rawQueryCount === 1 ? [{ facilityId: 9 }] : [{ id: 9 }];
    },
    reservation: {
      findUnique: async () => {
        events.push("read-reservation");
        return {
          id: 21,
          reservationDate: new Date("2026-10-01T00:00:00.000Z"),
          startTime: new Date("1970-01-01T10:00:00.000Z"),
          endTime: new Date("1970-01-01T11:00:00.000Z"),
          status: options?.status ?? "PENDING",
          facility: {
            id: 9,
            status: options?.facilityStatus ?? "ACTIVE",
          },
        };
      },
      findMany: async () => {
        events.push("check-conflict");
        return options?.conflictingRanges ?? [];
      },
      update: async () => {
        events.push("update");
        updated = true;
        return {
          id: 21,
          reservationDate: new Date("2026-10-01T00:00:00.000Z"),
          startTime: new Date("1970-01-01T10:00:00.000Z"),
          endTime: new Date("1970-01-01T11:00:00.000Z"),
          purpose: "Rapat",
          status: "APPROVED",
          createdAt: new Date("2026-09-24T00:00:00.000Z"),
          user: { id: 2, name: "User", email: "user@example.com" },
          facility: { id: 9, name: "Aula", type: "aula", location: "Gedung A" },
        };
      },
    },
  };

  const database = {
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  } as unknown as ApprovalDatabase;

  return { database, events, wasUpdated: () => updated };
}

test("approve mengunci reservasi dan fasilitas sebelum cek konflik", async () => {
  const mock = createDatabase();

  const result = await approveReservation(mock.database, 21, 3);

  assert.equal(result.kind, "approved");
  assert.deepEqual(mock.events, [
    "lock-reservation",
    "lock-facility",
    "read-reservation",
    "check-conflict",
    "update",
  ]);
  assert.equal(mock.wasUpdated(), true);
});

test("approve tidak mengubah data ketika jadwal bentrok", async () => {
  const mock = createDatabase({
    conflictingRanges: [
      {
        startTime: new Date("1970-01-01T10:30:00.000Z"),
        endTime: new Date("1970-01-01T11:30:00.000Z"),
      },
    ],
  });

  const result = await approveReservation(mock.database, 21, 3);

  assert.deepEqual(result, { kind: "conflict" });
  assert.equal(mock.wasUpdated(), false);
});

test("approve memvalidasi ulang status reservasi dan fasilitas setelah lock", async () => {
  const processed = createDatabase({ status: "APPROVED" });
  const maintenance = createDatabase({ facilityStatus: "UNDER_MAINTENANCE" });

  assert.deepEqual(await approveReservation(processed.database, 21, 3), {
    kind: "not-pending",
  });
  assert.deepEqual(await approveReservation(maintenance.database, 21, 3), {
    kind: "facility-unavailable",
  });
  assert.equal(processed.wasUpdated(), false);
  assert.equal(maintenance.wasUpdated(), false);
});

test("reject memakai update bersyarat agar tidak menimpa keputusan concurrent", async () => {
  let updateWhere: unknown;
  const updatedReservation = {
    id: 21,
    reservationDate: new Date("2026-10-01T00:00:00.000Z"),
    startTime: new Date("1970-01-01T10:00:00.000Z"),
    endTime: new Date("1970-01-01T11:00:00.000Z"),
    purpose: "Rapat",
    status: "REJECTED",
    cancellationReason: "Jadwal tidak sesuai",
    createdAt: new Date("2026-09-24T00:00:00.000Z"),
    user: { id: 2, name: "User", email: "user@example.com" },
    facility: { id: 9, name: "Aula", type: "aula", location: "Gedung A" },
  };
  const transaction = {
    reservation: {
      updateMany: async (args: { where: unknown }) => {
        updateWhere = args.where;
        return { count: 1 };
      },
      findUnique: async () => updatedReservation,
    },
  };
  const database = {
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  } as unknown as ApprovalDatabase;

  const result = await rejectReservation(database, 21, 3, "Jadwal tidak sesuai");

  assert.equal(result.kind, "rejected");
  assert.deepEqual(updateWhere, { id: 21, status: "PENDING" });
});

test("reject gagal jika keputusan concurrent sudah mengubah status", async () => {
  const transaction = {
    reservation: {
      updateMany: async () => ({ count: 0 }),
      findUnique: async () => ({ id: 21 }),
    },
  };
  const database = {
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  } as unknown as ApprovalDatabase;

  assert.deepEqual(await rejectReservation(database, 21, 3, "Ditolak"), {
    kind: "not-pending",
  });
});
