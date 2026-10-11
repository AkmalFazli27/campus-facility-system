import assert from "node:assert/strict";
import { db } from "@/lib/db";
import {
  approveReservation,
  rejectReservation,
} from "@/lib/services/reservationApprovalService";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL belum diatur");

const target = new URL(databaseUrl);
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
if (!localHosts.has(target.hostname) || target.pathname !== "/campus_facility_dev") {
  throw new Error("Smoke test hanya boleh dijalankan pada MySQL lokal campus_facility_dev");
}

const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const userEmail = `smoke-user-${token}@example.test`;
const officerEmail = `smoke-officer-${token}@example.test`;
const facilityName = `Smoke Concurrency ${token}`;

async function main() {
  try {
    const [user, officer, facility] = await Promise.all([
      db.user.create({
        data: {
          name: "Smoke User",
          email: userEmail,
          passwordHash: "not-used",
          role: "USER",
          accountStatus: "ACTIVE",
        },
      }),
      db.user.create({
        data: {
          name: "Smoke Officer",
          email: officerEmail,
          passwordHash: "not-used",
          role: "OFFICER",
          accountStatus: "ACTIVE",
        },
      }),
      db.facility.create({
        data: {
          name: facilityName,
          type: "test",
          location: "Local smoke test",
          capacity: 1,
        },
      }),
    ]);

    const base = {
      userId: user.id,
      facilityId: facility.id,
      reservationDate: new Date("2030-01-15T00:00:00.000Z"),
      purpose: "Concurrency smoke test",
    };
    const [first, second] = await Promise.all([
      db.reservation.create({
        data: {
          ...base,
          startTime: new Date("1970-01-01T10:00:00.000Z"),
          endTime: new Date("1970-01-01T11:00:00.000Z"),
        },
      }),
      db.reservation.create({
        data: {
          ...base,
          startTime: new Date("1970-01-01T10:30:00.000Z"),
          endTime: new Date("1970-01-01T11:30:00.000Z"),
        },
      }),
    ]);

    const results = await Promise.all([
      approveReservation(db, first.id, officer.id),
      approveReservation(db, second.id, officer.id),
    ]);
    const kinds = results.map((result) => result.kind).sort();

    // Preempt Opsi A: pemenang approve, yang kalah sudah auto-REJECT sebagai
    // PENDING overlap sehingga kembalian kedua = not-pending (bukan conflict).
    assert.deepEqual(kinds, ["approved", "not-pending"]);
    assert.equal(
      await db.reservation.count({
        where: { facilityId: facility.id, status: "APPROVED" },
      }),
      1,
    );

    // Preempt sekuensial: pending overlap approved tetap bisa di-approve
    // dan menggantikan approved lama dengan pesan transparan.
    const winnerId = [first.id, second.id][
      results.findIndex((result) => result.kind === "approved")
    ];
    const challenger = await db.reservation.create({
      data: {
        ...base,
        startTime: new Date("1970-01-01T10:15:00.000Z"),
        endTime: new Date("1970-01-01T10:45:00.000Z"),
      },
    });
    const preempt = await approveReservation(db, challenger.id, officer.id);
    assert.equal(preempt.kind, "approved");
    if (preempt.kind !== "approved") throw new Error("preempt harus approved");
    assert.deepEqual(preempt.replacedIds, [winnerId]);
    const replaced = await db.reservation.findUniqueOrThrow({
      where: { id: winnerId },
      select: { status: true, cancellationReason: true, processedBy: true },
    });
    assert.equal(replaced.status, "REJECTED");
    assert.match(replaced.cancellationReason ?? "", /Dibatalkan otomatis karena jadwal bentrok/);
    assert.match(replaced.cancellationReason ?? "", new RegExp(`#${challenger.id}`));
    assert.match(replaced.cancellationReason ?? "", /tercatat lebih dulu/);
    assert.match(replaced.cancellationReason ?? "", /Bukti:/);
    assert.equal(replaced.processedBy, officer.id);

    const decisionRace = await db.reservation.create({
      data: {
        ...base,
        reservationDate: new Date("2030-01-16T00:00:00.000Z"),
        startTime: new Date("1970-01-01T13:00:00.000Z"),
        endTime: new Date("1970-01-01T14:00:00.000Z"),
      },
    });
    const decisionResults = await Promise.all([
      approveReservation(db, decisionRace.id, officer.id),
      rejectReservation(db, decisionRace.id, officer.id, "Concurrency smoke test"),
    ]);
    assert.equal(
      decisionResults.filter(
        (result) => result.kind === "approved" || result.kind === "rejected",
      ).length,
      1,
    );
    const finalDecision = await db.reservation.findUniqueOrThrow({
      where: { id: decisionRace.id },
      select: { status: true },
    });
    assert.ok(
      finalDecision.status === "APPROVED" || finalDecision.status === "REJECTED",
    );

    console.log(
      "Concurrency smoke test passed: conflicts and concurrent decisions are serialized.",
    );
  } finally {
    const facility = await db.facility.findUnique({
      where: { name: facilityName },
      select: { id: true },
    });
    if (facility) {
      await db.reservation.deleteMany({ where: { facilityId: facility.id } });
      await db.facility.delete({ where: { id: facility.id } });
    }
    await db.user.deleteMany({ where: { email: { in: [userEmail, officerEmail] } } });
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
