import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDashboardNav,
  getDashboardPageTitle,
  isDashboardNavItemActive,
  roleLabel,
} from "@/lib/dashboard-nav";

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
  assert.deepEqual(hrefs, ["/officer/queue"]);
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
  for (const role of ["USER", "ADMIN"] as const) {
    const items = getDashboardNav(role);
    assert.ok(items.length > 0);
    assert.equal(items[0].href, "/dashboard");
    assert.equal(items[0].label, "Dashboard");
  }
  for (const role of ["USER", "OFFICER", "ADMIN"] as const) {
    const items = getDashboardNav(role);
    assert.ok(items.every((i) => i.section === roleLabel(role)));
  }
});

test("item navigasi aktif mengikuti pathname", () => {
  assert.equal(isDashboardNavItemActive("/dashboard", "/dashboard"), true);
  assert.equal(isDashboardNavItemActive("/reservations", "/reservations"), true);
  assert.equal(isDashboardNavItemActive("/reservations/123", "/reservations"), true);
  assert.equal(isDashboardNavItemActive("/reservations", "/dashboard"), false);
  assert.equal(isDashboardNavItemActive("/dashboard/settings", "/dashboard"), true);
});

test("judul halaman mobile mengikuti pathname", () => {
  assert.equal(getDashboardPageTitle("/dashboard"), "Dashboard");
  assert.equal(getDashboardPageTitle("/dashboard/settings"), "Dashboard");
  assert.equal(getDashboardPageTitle("/reservations"), "Reservasi saya");
  assert.equal(getDashboardPageTitle("/reservations/123"), "Reservasi saya");
  assert.equal(getDashboardPageTitle("/reports"), "Laporan saya");
  assert.equal(getDashboardPageTitle("/officer/queue"), "Antrian petugas");
  assert.equal(getDashboardPageTitle("/admin/users"), "Admin");
});
