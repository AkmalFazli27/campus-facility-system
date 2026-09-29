import assert from "node:assert/strict";
import { test } from "node:test";
import {
  occupancyRecapQuerySchema,
  damageRecapQuerySchema,
} from "@/lib/validations/recap";

test("occupancyRecapQuerySchema menerima query kosong atau tanggal valid", () => {
  const empty = occupancyRecapQuerySchema.safeParse({});
  assert.equal(empty.success, true);

  const valid = occupancyRecapQuerySchema.safeParse({
    from: "2026-09-01",
    to: "2026-09-30",
    facility_id: "5",
    location: "Gedung A",
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.facility_id, 5);
    assert.equal(valid.data.location, "Gedung A");
  }
});

test("occupancyRecapQuerySchema menolak tanggal from > to", () => {
  const invalid = occupancyRecapQuerySchema.safeParse({
    from: "2026-09-30",
    to: "2026-09-01",
  });
  assert.equal(invalid.success, false);
});

test("occupancyRecapQuerySchema menolak format tanggal invalid", () => {
  assert.equal(
    occupancyRecapQuerySchema.safeParse({ from: "30-09-2026" }).success,
    false
  );
  assert.equal(
    occupancyRecapQuerySchema.safeParse({ to: "2026-02-31" }).success,
    false
  );
  assert.equal(
    occupancyRecapQuerySchema.safeParse({ facility_id: "-1" }).success,
    false
  );
  assert.equal(
    occupancyRecapQuerySchema.safeParse({ facility_id: "abc" }).success,
    false
  );
});

test("damageRecapQuerySchema menerima filter kategori dan fasilitas", () => {
  const valid = damageRecapQuerySchema.safeParse({
    from: "2026-09-01",
    to: "2026-09-15",
    category: "Kelistrikan & Lampu",
    facility_id: "3",
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.category, "Kelistrikan & Lampu");
    assert.equal(valid.data.facility_id, 3);
  }
});

test("damageRecapQuerySchema menolak rentang tanggal terbalik", () => {
  const invalid = damageRecapQuerySchema.safeParse({
    from: "2026-10-05",
    to: "2026-10-01",
  });
  assert.equal(invalid.success, false);
});
