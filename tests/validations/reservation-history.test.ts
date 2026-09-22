import assert from "node:assert/strict";
import { test } from "node:test";
import {
  listReservationsQuerySchema,
  reservationIdSchema,
} from "@/lib/validations/reservation";

test("listReservationsQuerySchema menerima filter kosong", () => {
  assert.equal(listReservationsQuerySchema.safeParse({}).success, true);
});

test("listReservationsQuerySchema menerima semua status reservasi", () => {
  const statuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED_BY_USER",
    "CANCELLED_BY_OFFICER",
    "COMPLETED",
  ];

  for (const status of statuses) {
    assert.equal(listReservationsQuerySchema.safeParse({ status }).success, true);
  }
});

test("listReservationsQuerySchema menormalkan status menjadi uppercase", () => {
  const result = listReservationsQuerySchema.safeParse({ status: "pending" });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.status, "PENDING");
});

test("listReservationsQuerySchema menolak status tidak dikenal", () => {
  assert.equal(
    listReservationsQuerySchema.safeParse({ status: "unknown" }).success,
    false,
  );
});

test("listReservationsQuerySchema menolak tanggal tidak nyata", () => {
  assert.equal(
    listReservationsQuerySchema.safeParse({ from: "2026-02-31" }).success,
    false,
  );
});

test("listReservationsQuerySchema menolak rentang terbalik", () => {
  assert.equal(
    listReservationsQuerySchema.safeParse({
      from: "2026-10-31",
      to: "2026-10-01",
    }).success,
    false,
  );
});

test("reservationIdSchema hanya menerima integer positif", () => {
  const parsed = reservationIdSchema.safeParse("12");
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data, 12);

  for (const id of ["0", "-1", "1.5", "abc"]) {
    assert.equal(reservationIdSchema.safeParse(id).success, false);
  }
});
