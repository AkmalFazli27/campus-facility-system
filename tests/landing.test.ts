import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFacilitySearchUrl,
  facilityStatusLabel,
  isAuthRoute,
} from "@/lib/landing";

test("buildFacilitySearchUrl merangkai semua filter", () => {
  assert.equal(
    buildFacilitySearchUrl({ type: "lab", location: "Gedung A", date: "2026-09-20" }),
    "/facilities?type=lab&location=Gedung+A&date=2026-09-20"
  );
});

test("buildFacilitySearchUrl membuang type=all dan field kosong", () => {
  assert.equal(
    buildFacilitySearchUrl({ type: "all", location: "  ", date: "" }),
    "/facilities"
  );
});

test("buildFacilitySearchUrl tanpa argumen ke /facilities", () => {
  assert.equal(buildFacilitySearchUrl({}), "/facilities");
});

test("facilityStatusLabel memetakan ketiga status PRD", () => {
  assert.equal(facilityStatusLabel("ACTIVE"), "Aktif");
  assert.equal(facilityStatusLabel("UNDER_MAINTENANCE"), "Dalam perbaikan");
  assert.equal(facilityStatusLabel("INACTIVE"), "Nonaktif");
});

test("isAuthRoute mengenali route auth", () => {
  assert.equal(isAuthRoute("/login"), true);
  assert.equal(isAuthRoute("/register"), true);
  assert.equal(isAuthRoute("/pending-verification"), true);
  assert.equal(isAuthRoute("/"), false);
  assert.equal(isAuthRoute("/facilities"), false);
});
