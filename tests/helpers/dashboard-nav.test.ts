import { test } from "node:test";
import assert from "node:assert/strict";
import { getDashboardNav, roleLabel } from "@/lib/dashboard-nav";

test("pengguna hanya dapat nav pengguna", () => {
  const hrefs = getDashboardNav("USER").map((i) => i.href);
  assert.ok(hrefs.includes("/dashboard"));
  assert.ok(hrefs.includes("/reservations"));
  assert.ok(hrefs.includes("/reports"));
  assert.ok(!hrefs.includes("/officer/queue"));
  assert.ok(!hrefs.includes("/admin/users"));
});

test("petugas hanya dapat nav petugas", () => {
  const hrefs = getDashboardNav("OFFICER").map((i) => i.href);
  assert.ok(hrefs.includes("/dashboard"));
  assert.ok(hrefs.includes("/officer/queue"));
  assert.ok(!hrefs.includes("/reservations"));
  assert.ok(!hrefs.includes("/admin/users"));
});

test("admin dapat nav admin", () => {
  const hrefs = getDashboardNav("ADMIN").map((i) => i.href);
  assert.ok(hrefs.includes("/dashboard"));
  assert.ok(hrefs.includes("/admin/facilities"));
  assert.ok(hrefs.includes("/admin/recap"));
  assert.ok(hrefs.includes("/admin/users"));
});

test("tidak ada peran yang menautkan katalog fasilitas", () => {
  for (const role of ["USER", "OFFICER", "ADMIN"] as const) {
    const hrefs = getDashboardNav(role).map((i) => i.href);
    assert.ok(!hrefs.includes("/facilities"));
  }
});

test("label peran dan seksi sesuai referensi", () => {
  assert.equal(roleLabel("USER"), "Pengguna");
  assert.equal(roleLabel("OFFICER"), "Petugas");
  assert.equal(roleLabel("ADMIN"), "Admin");
  for (const role of ["USER", "OFFICER", "ADMIN"] as const) {
    const items = getDashboardNav(role);
    assert.ok(items.length > 0);
    assert.equal(items[0].href, "/dashboard");
    assert.equal(items[0].label, "Dashboard");
    assert.equal(items[0].section, roleLabel(role));
    assert.ok(items.every((i) => i.section === roleLabel(role)));
  }
});
