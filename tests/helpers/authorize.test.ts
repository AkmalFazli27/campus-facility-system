import { test } from "node:test";
import assert from "node:assert/strict";
import { isAuthorized, requiredRoles } from "@/lib/authorize";

test("/admin hanya untuk ADMIN", () => {
  assert.equal(isAuthorized("/admin/users", "ADMIN"), true);
  assert.equal(isAuthorized("/admin/users", "OFFICER"), false);
  assert.equal(isAuthorized("/admin", "ADMIN"), true);
});

test("/officer untuk OFFICER dan ADMIN", () => {
  assert.equal(isAuthorized("/officer/queue", "OFFICER"), true);
  assert.equal(isAuthorized("/officer/queue", "ADMIN"), true);
  assert.equal(isAuthorized("/officer/queue", "USER"), false);
});

test("/reservations hanya untuk USER", () => {
  assert.equal(isAuthorized("/reservations", "USER"), true);
  assert.equal(isAuthorized("/reservations", "OFFICER"), false);
  assert.equal(isAuthorized("/reservations/123", "ADMIN"), false);
});

test("/reports untuk semua role login", () => {
  for (const role of ["USER", "OFFICER", "ADMIN"]) {
    assert.equal(isAuthorized("/reports/123", role), true);
  }
});

test("path di luar aturan dianggap publik", () => {
  assert.equal(requiredRoles("/login").length, 0);
  assert.equal(isAuthorized("/login", "USER"), true);
});

test("prefix tidak bocor ke path mirip", () => {
  assert.equal(isAuthorized("/administrator", "USER"), true);
  assert.equal(requiredRoles("/administrator").length, 0);
});
