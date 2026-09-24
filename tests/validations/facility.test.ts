import assert from "node:assert/strict";
import { test } from "node:test";
import {
  availabilityQuerySchema,
  facilityIdSchema,
} from "@/lib/validations/facility";

test("facilityIdSchema menerima ID positif", () => {
  assert.equal(facilityIdSchema.parse("12"), 12);
});

test("facilityIdSchema menolak ID tidak valid", () => {
  assert.equal(facilityIdSchema.safeParse("0").success, false);
  assert.equal(facilityIdSchema.safeParse("abc").success, false);
  assert.equal(facilityIdSchema.safeParse("1.5").success, false);
});

test("availabilityQuerySchema menerima tanggal kalender valid", () => {
  assert.deepEqual(availabilityQuerySchema.parse({ date: "2026-09-24" }), {
    date: "2026-09-24",
  });
});

test("availabilityQuerySchema menolak tanggal tidak valid", () => {
  assert.equal(availabilityQuerySchema.safeParse({ date: "2026-02-31" }).success, false);
  assert.equal(availabilityQuerySchema.safeParse({ date: "24-09-2026" }).success, false);
  assert.equal(availabilityQuerySchema.safeParse({}).success, false);
});
