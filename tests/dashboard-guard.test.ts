import { test } from "node:test";
import assert from "node:assert/strict";
import { isAuthorized } from "@/lib/authorize";
import { isAuthRoute } from "@/lib/landing";

test("dashboard bukan auth route sehingga header publik tetap tampil", () => {
  assert.equal(isAuthRoute("/dashboard"), false);
});

test("dashboard terbuka untuk semua role login (secure check di page)", () => {
  assert.equal(isAuthorized("/dashboard", "USER"), true);
  assert.equal(isAuthorized("/dashboard", "OFFICER"), true);
  assert.equal(isAuthorized("/dashboard", "ADMIN"), true);
});
