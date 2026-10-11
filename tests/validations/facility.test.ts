import assert from "node:assert/strict";
import { test } from "node:test";
import {
  availabilityQuerySchema,
  createFacilitySchema,
  facilityIdSchema,
  updateFacilityStatusSchema,
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

test("createFacilitySchema memvalidasi input fasilitas lengkap", () => {
  const result = createFacilitySchema.safeParse({
    name: "Ruang Teater V",
    type: "Aula",
    location: "Gedung Pusat Lt 4",
    capacity: 120,
    description: "Ruang teater ber-AC dengan proyektor",
    status: "ACTIVE",
  });
  assert.equal(result.success, true);
});

test("createFacilitySchema menolak kapasitas negatif atau nama kosong", () => {
  assert.equal(
    createFacilitySchema.safeParse({
      name: "",
      type: "Kelas",
      location: "Gedung B",
      capacity: 30,
    }).success,
    false
  );
  assert.equal(
    createFacilitySchema.safeParse({
      name: "Ruang A",
      type: "Kelas",
      location: "Gedung B",
      capacity: -5,
    }).success,
    false
  );
});

test("updateFacilityStatusSchema menerima status valid", () => {
  assert.equal(
    updateFacilityStatusSchema.safeParse({ status: "UNDER_MAINTENANCE" }).success,
    true
  );
  assert.equal(
    updateFacilityStatusSchema.safeParse({ status: "INVALID_STATUS" }).success,
    false
  );
});
