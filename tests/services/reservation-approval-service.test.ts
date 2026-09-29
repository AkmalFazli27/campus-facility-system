import assert from "node:assert/strict";
import { test } from "node:test";
import {
  approveReservation,
  rejectReservation,
} from "@/lib/services/reservationApprovalService";

type ApprovalDatabase = Parameters<typeof approveReservation>[0];
const beforeExpiry = () => new Date("2026-09-29T16:59:59.000Z");

function createDatabase(options?: {
  status?: "PENDING" | "APPROVED";
  facilityStatus?: "ACTIVE" | "UNDER_MAINTENANCE";
  conflictingRanges?: Array<{ startTime: Date; endTime: Date }>;
  pendingCandidates?: Array<{
    id: number;
    facilityId: number;
    reservationDate: Date;
    startTime: Date;
    endTime: Date;
    status: "PENDING" | "APPROVED";
  }>;
}) {
  const events: string[] = [];
  let rawQueryCount = 0;
  let updated = false;
  let rejectedIds: number[] = [];

  const transaction = {
    $queryRaw: async () => {
      rawQueryCount += 1;
      events.push(rawQueryCount === 1 ? "lock-facility" : "lock-reservation");
      return [{ id: 9 }];
    },
    reservation: {
      findUnique: async () => {
        events.push("read-reservation");
        return {
          id: 21,
          facilityId: 9,
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
      updateMany: async (args: {
        where: {
          id: { not: number };
          facilityId: number;
          reservationDate: Date;
          status: string;
          startTime: { lt: Date };
          endTime: { gt: Date };
        };
        data: { status: string; cancellationReason: string; processedBy: number | null; processedAt: Date };
      }) => {
        events.push("reject-overlapping-pending");
        assert.equal(args.data.status, "REJECTED");
        assert.match(args.data.cancellationReason, /Ditolak otomatis karena jadwal bentrok/);
        assert.match(args.data.cancellationReason, /#21/);
        assert.equal(args.data.processedBy, null);
        assert.ok(args.data.processedAt instanceof Date);
        rejectedIds = (options?.pendingCandidates ?? [])
          .filter((row) => row.id !== args.where.id.not)
          .filter((row) => row.facilityId === args.where.facilityId)
          .filter((row) => row.reservationDate.getTime() === args.where.reservationDate.getTime())
          .filter((row) => row.status === args.where.status)
          .filter((row) => row.startTime < args.where.startTime.lt)
          .filter((row) => row.endTime > args.where.endTime.gt)
          .map((row) => row.id);
        return { count: rejectedIds.length };
      },
    },
  };

  const database = {
    $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
  } as unknown as ApprovalDatabase;

  return { database, events, wasUpdated: () => updated, rejectedIds: () => rejectedIds };
}

test("approve mengunci fasilitas sebelum reservasi dan menolak bentrok dalam transaksi", async () => {
  const mock = createDatabase();

  const result = await approveReservation(mock.database, 21, 3, beforeExpiry);

  assert.equal(result.kind, "approved");
  assert.deepEqual(mock.events, [
    "read-reservation",
    "lock-facility",
    "lock-reservation",
    "read-reservation",
    "check-conflict",
    "update",
    "reject-overlapping-pending",
  ]);
  assert.equal(mock.wasUpdated(), true);
});

test("approval hanya menolak pending yang overlap di fasilitas dan tanggal sama", async () => {
  const date = new Date("2026-10-01T00:00:00.000Z");
  const otherDate = new Date("2026-10-02T00:00:00.000Z");
  const candidate = (
    id: number,
    start: string,
    end: string,
    facilityId = 9,
    reservationDate = date,
    status: "PENDING" | "APPROVED" = "PENDING",
  ) => ({
    id,
    facilityId,
    reservationDate,
    startTime: new Date(`1970-01-01T${start}:00.000Z`),
    endTime: new Date(`1970-01-01T${end}:00.000Z`),
    status,
  });
  const mock = createDatabase({
    pendingCandidates: [
      candidate(21, "10:00", "11:00"), // reservasi yang disetujui
      candidate(22, "09:30", "10:30"),
      candidate(23, "10:30", "11:30"),
      candidate(24, "09:00", "10:00"), // berbatasan di tepi
      candidate(25, "11:00", "12:00"), // berbatasan di tepi
      candidate(26, "10:00", "11:00", 10),
      candidate(27, "10:00", "11:00", 9, otherDate),
      candidate(28, "10:00", "11:00", 9, date, "APPROVED"),
    ],
  });

  assert.equal((await approveReservation(mock.database, 21, 3, beforeExpiry)).kind, "approved");
  assert.deepEqual(mock.rejectedIds(), [22, 23]);
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

  const result = await approveReservation(mock.database, 21, 3, beforeExpiry);

  assert.deepEqual(result, { kind: "conflict" });
  assert.equal(mock.wasUpdated(), false);
});

test("approve memvalidasi ulang status reservasi dan fasilitas setelah lock", async () => {
  const processed = createDatabase({ status: "APPROVED" });
  const maintenance = createDatabase({ facilityStatus: "UNDER_MAINTENANCE" });

  assert.deepEqual(await approveReservation(processed.database, 21, 3, beforeExpiry), {
    kind: "not-pending",
  });
  assert.deepEqual(await approveReservation(maintenance.database, 21, 3, beforeExpiry), {
    kind: "facility-unavailable",
  });
  assert.equal(processed.wasUpdated(), false);
  assert.equal(maintenance.wasUpdated(), false);
});

test("approve menolak H-1 tepat pukul 00.00 WIB tanpa mengubah status", async () => {
  const mock = createDatabase();
  const result = await approveReservation(
    mock.database,
    21,
    3,
    () => new Date("2026-09-29T17:00:00.000Z"), // 30 Sep 00:00 WIB
  );

  assert.deepEqual(result, { kind: "expired" });
  assert.equal(mock.wasUpdated(), false);
  assert.deepEqual(mock.rejectedIds(), []);
});

test("approve yang melewati batas saat pemeriksaan bentrok tidak jadi disetujui", async () => {
  const mock = createDatabase();
  const times = [beforeExpiry(), new Date("2026-09-29T17:00:00.000Z")];
  const result = await approveReservation(mock.database, 21, 3, () => times.shift()!);

  assert.deepEqual(result, { kind: "expired" });
  assert.equal(mock.wasUpdated(), false);
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
