import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addDuration,
  durationBetween,
  isValidDuration,
} from "@/lib/helpers/slots";

// Kunci aturan durasi reservasi: kelipatan 30 menit, min 30 menit,
// maks full day 07:00-20:00 (dipakai stepper/drag bar di form).

test("isValidDuration hanya menerima kelipatan 30 menit >= 30", () => {
  assert.equal(isValidDuration(30), true);
  assert.equal(isValidDuration(60), true);
  assert.equal(isValidDuration(90), true);
  assert.equal(isValidDuration(780), true);
  assert.equal(isValidDuration(0), false);
  assert.equal(isValidDuration(15), false);
  assert.equal(isValidDuration(45), false);
  assert.equal(isValidDuration(-30), false);
  assert.equal(isValidDuration(30.5), false);
});

test("addDuration menghitung end dari start + durasi", () => {
  assert.equal(addDuration("09:00", 30), "09:30");
  assert.equal(addDuration("09:00", 60), "10:00");
  assert.equal(addDuration("09:30", 90), "11:00");
  assert.equal(addDuration("19:30", 30), "20:00");
  assert.equal(addDuration("07:00", 780), "20:00");
});

test("addDuration null bila hasil lewat 20:00", () => {
  assert.equal(addDuration("19:30", 60), null);
  assert.equal(addDuration("20:00", 30), null);
  assert.equal(addDuration("07:00", 810), null);
});

test("addDuration null bila start/durasi tidak valid", () => {
  assert.equal(addDuration("09:15", 30), null);
  assert.equal(addDuration("9:00", 30), null);
  assert.equal(addDuration("09:00", 45), null);
  assert.equal(addDuration("09:00", 0), null);
});

test("durationBetween menghitung selisih menit", () => {
  assert.equal(durationBetween("09:00", "10:30"), 90);
  assert.equal(durationBetween("09:00", "09:30"), 30);
  assert.equal(durationBetween("09:00", "09:00"), 0);
  assert.equal(durationBetween("10:30", "10:00"), -30);
  assert.equal(durationBetween("9:00", "10:00"), null);
  assert.equal(durationBetween("09:00", "abc"), null);
});
