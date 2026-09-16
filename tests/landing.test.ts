import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFacilitySearchUrl,
  buildTimeSlots,
  facilityStatusLabel,
  isAuthRoute,
} from "@/lib/landing";

test("buildFacilitySearchUrl merangkai semua filter", () => {
  assert.equal(
    buildFacilitySearchUrl({ type: "lab", location: "Gedung A", date: "2026-09-20" }),
    "/facilities?type=lab&location=Gedung+A&date=2026-09-20"
  );
});

test("buildFacilitySearchUrl menyertakan rentang waktu 30 menit", () => {
  assert.equal(
    buildFacilitySearchUrl({
      type: "lab",
      location: "Gedung A",
      date: "2026-09-20",
      startTime: "09:00",
      endTime: "09:30",
    }),
    "/facilities?type=lab&location=Gedung+A&date=2026-09-20&start_time=09%3A00&end_time=09%3A30"
  );
});

test("buildFacilitySearchUrl membuang waktu bila start atau end kosong", () => {
  assert.equal(
    buildFacilitySearchUrl({ startTime: "09:00" }),
    "/facilities"
  );
  assert.equal(buildFacilitySearchUrl({ endTime: "09:30" }), "/facilities");
});

test("buildFacilitySearchUrl membuang type=all dan field kosong", () => {
  assert.equal(
    buildFacilitySearchUrl({ type: "all", location: "  ", date: "" }),
    "/facilities"
  );
});

test("buildFacilitySearchUrl membuang location=all dari dropdown", () => {
  assert.equal(
    buildFacilitySearchUrl({ location: "all" }),
    "/facilities"
  );
});

test("buildFacilitySearchUrl tanpa argumen ke /facilities", () => {
  assert.equal(buildFacilitySearchUrl({}), "/facilities");
});

test("buildTimeSlots menghasilkan 26 slot 30 menit pada 07.00-20.00", () => {
  const slots = buildTimeSlots();
  assert.equal(slots.length, 26);
  assert.deepEqual(slots[0], { start: "07:00", end: "07:30", label: "07.00 – 07.30" });
  assert.deepEqual(slots[25], { start: "19:30", end: "20:00", label: "19.30 – 20.00" });
  for (const slot of slots) {
    assert.match(slot.start, /^\d{2}:(00|30)$/);
    assert.match(slot.end, /^\d{2}:(00|30)$/);
  }
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
  assert.equal(isAuthRoute("/login-evil"), false);
  assert.equal(isAuthRoute("/login/"), true);
});
