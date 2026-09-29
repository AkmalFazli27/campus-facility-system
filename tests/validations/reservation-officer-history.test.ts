import assert from "node:assert/strict";
import { test } from "node:test";
import { officerHistoryQuerySchema } from "@/lib/validations/reservation";

test("riwayat petugas menerima seluruh status, termasuk batal otomatis", () => {
  const empty = officerHistoryQuerySchema.safeParse({});
  assert.equal(empty.success, true);

  for (const status of ["pending", "approved", "rejected", "cancelled_by_user",
    "cancelled_by_officer", "cancelled_by_system", "completed"]) {
    const parsed = officerHistoryQuerySchema.safeParse({ status });
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(parsed.data.status, status.toUpperCase());
  }
});

test("riwayat petugas memvalidasi rentang tanggal penggunaan dan halaman", () => {
  const valid = officerHistoryQuerySchema.safeParse({
    from: "2026-10-01",
    to: "2026-10-31",
    page: "2",
  });
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.page, 2);

  for (const invalid of [
    { from: "2026-10-31", to: "2026-10-01" },
    { from: "2026-02-31" },
    { page: "0" },
    { page: "2.5" },
    { page: "10001" },
    { status: "ALL" },
  ]) {
    assert.equal(officerHistoryQuerySchema.safeParse(invalid).success, false);
  }
});
