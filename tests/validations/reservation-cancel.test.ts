import assert from "node:assert/strict";
import { test } from "node:test";
import { cancelReservationSchema } from "@/lib/validations/reservation";

test("cancelReservationSchema menerima body kosong dan reason opsional", () => {
  assert.deepEqual(cancelReservationSchema.safeParse({}).success, true);
  assert.deepEqual(
    cancelReservationSchema.safeParse({ reason: "Jadwal berubah" }).success,
    true,
  );
});

test("cancelReservationSchema menolak reason lebih dari 500 karakter", () => {
  const parsed = cancelReservationSchema.safeParse({ reason: "x".repeat(501) });
  assert.equal(parsed.success, false);
});
