import assert from "node:assert/strict";
import { test } from "node:test";
import {
  officerDecisionSchema,
  officerQueueQuerySchema,
} from "@/lib/validations/reservation";

// Kunci validasi antrian & keputusan petugas (US08-US10, FR-RSV-04/05)
// sebelum API officer dibangun.

test("officerDecisionSchema menerima alasan valid dan memangkasnya", () => {
  const parsed = officerDecisionSchema.safeParse({
    reason: "  Jadwal bentrok dengan kegiatan fakultas  ",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.reason, "Jadwal bentrok dengan kegiatan fakultas");
  }
});

test("officerDecisionSchema menolak alasan kosong atau hilang", () => {
  assert.equal(officerDecisionSchema.safeParse({}).success, false);
  assert.equal(officerDecisionSchema.safeParse({ reason: "" }).success, false);
  assert.equal(officerDecisionSchema.safeParse({ reason: "   " }).success, false);
});

test("officerDecisionSchema menolak alasan lebih dari 500 karakter", () => {
  assert.equal(
    officerDecisionSchema.safeParse({ reason: "a".repeat(501) }).success,
    false,
  );
  assert.equal(
    officerDecisionSchema.safeParse({ reason: "a".repeat(500) }).success,
    true,
  );
});

test("officerQueueQuerySchema menerima filter kosong dan lowercase", () => {
  const empty = officerQueueQuerySchema.safeParse({});
  assert.equal(empty.success, true);

  const lower = officerQueueQuerySchema.safeParse({
    status: "pending",
    facility_id: "3",
    date: "2026-10-01",
  });
  assert.equal(lower.success, true);
  if (lower.success) {
    assert.equal(lower.data.status, "PENDING");
    assert.equal(lower.data.facility_id, 3);
    assert.equal(lower.data.date, "2026-10-01");
  }
});

test("officerQueueQuerySchema menolak status di luar antrian", () => {
  assert.equal(
    officerQueueQuerySchema.safeParse({ status: "REJECTED" }).success,
    false,
  );
  assert.equal(
    officerQueueQuerySchema.safeParse({ status: "APPROVED" }).success,
    true,
  );
  assert.equal(
    officerQueueQuerySchema.safeParse({ status: "all" }).success,
    true,
  );
});

test("officerQueueQuerySchema menolak facility_id dan tanggal invalid", () => {
  assert.equal(
    officerQueueQuerySchema.safeParse({ facility_id: "0" }).success,
    false,
  );
  assert.equal(
    officerQueueQuerySchema.safeParse({ facility_id: "abc" }).success,
    false,
  );
  assert.equal(
    officerQueueQuerySchema.safeParse({ date: "01-10-2026" }).success,
    false,
  );
  assert.equal(
    officerQueueQuerySchema.safeParse({ date: "2026-02-31" }).success,
    false,
  );
});
