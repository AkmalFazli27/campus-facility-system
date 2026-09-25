import { test } from "node:test";
import assert from "node:assert/strict";
import {
  authModeFromPath,
  authToggleTarget,
  buildAuthToggleHref,
  isSafeNextPath,
} from "@/lib/auth-ui";

test("authModeFromPath: /register* jadi sign-up, sisanya sign-in", () => {
  assert.equal(authModeFromPath("/register"), "sign-up");
  assert.equal(authModeFromPath("/register?x=1"), "sign-up");
  assert.equal(authModeFromPath("/login"), "sign-in");
  assert.equal(authModeFromPath("/login?next=%2Ffacilities"), "sign-in");
  assert.equal(authModeFromPath("/"), "sign-in");
});

test("authToggleTarget membalik mode", () => {
  assert.equal(authToggleTarget("sign-in"), "/register");
  assert.equal(authToggleTarget("sign-up"), "/login");
});

test("buildAuthToggleHref mempertahankan next saat kembali ke /login", () => {
  assert.equal(buildAuthToggleHref(true), "/register");
  assert.equal(buildAuthToggleHref(true, "/facilities"), "/register");
  assert.equal(buildAuthToggleHref(false), "/login");
  assert.equal(
    buildAuthToggleHref(false, "/facilities"),
    "/login?next=%2Ffacilities"
  );
});

test("isSafeNextPath menerima path internal dan menolak open-redirect", () => {
  assert.equal(isSafeNextPath("/facilities"), true);
  assert.equal(isSafeNextPath("/a"), true);
  assert.equal(isSafeNextPath("/"), false);
  assert.equal(isSafeNextPath("//evil.com"), false);
  assert.equal(isSafeNextPath("/\\evil"), false);
  assert.equal(isSafeNextPath("https://evil.com"), false);
  assert.equal(isSafeNextPath(""), false);
  assert.equal(isSafeNextPath(undefined), false);
});
