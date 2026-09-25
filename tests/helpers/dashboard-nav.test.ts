import { test } from "node:test";
import assert from "node:assert/strict";
import { getDashboardNav } from "@/lib/dashboard-nav";

test("pengguna hanya dapat nav pengguna", () => {
  const hrefs = getDashboardNav("USER").map((i) => i.href);
  assert.ok(hrefs.includes("/dashboard"));
  assert.ok(hrefs.includes("/facilities"));
  assert.ok(!hrefs.includes("/officer/queue"));
  assert.ok(!hrefs.includes("/admin/users"));
});

test("petugas tidak dapat nav admin", () => {
  const hrefs = getDashboardNav("OFFICER").map((i) => i.href);
  assert.ok(hrefs.includes("/officer/queue"));
  assert.ok(!hrefs.includes("/admin/users"));
});

test("admin dapat nav petugas dan admin", () => {
  const hrefs = getDashboardNav("ADMIN").map((i) => i.href);
  assert.ok(hrefs.includes("/officer/queue"));
  assert.ok(hrefs.includes("/admin/users"));
});
