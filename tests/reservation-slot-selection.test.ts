import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chooseReservationSlot,
  RESERVATION_SLOT_COUNT,
} from "@/lib/reservation-slot-selection";
import type { AvailabilitySlot } from "@/lib/reservation-ui";

const blocked: AvailabilitySlot[] = [
  { start: "10:00", end: "10:30", available: false, reason: "Sudah disetujui" },
];

test("klik pertama langsung menghasilkan 30 menit; klik kedua inklusif, klik ketiga memulai ulang", () => {
  const first = chooseReservationSlot(null, 4, []); // 09:00
  assert.deepEqual(first, { kind: "selected", anchor: 4, start: "09:00", end: "09:30" });
  const second = chooseReservationSlot(first.anchor, 6, []); // 10:00–10:30 ikut dipakai
  assert.deepEqual(second, { kind: "selected", anchor: null, start: "09:00", end: "10:30" });
  const third = chooseReservationSlot(second.anchor, 10, []);
  assert.deepEqual(third, { kind: "selected", anchor: 10, start: "12:00", end: "12:30" });
});

test("klik kedua lebih awal diurutkan otomatis, klik slot yang sama tetap 30 menit", () => {
  assert.deepEqual(chooseReservationSlot(6, 4, []), {
    kind: "selected", anchor: null, start: "09:00", end: "10:30",
  });
  assert.deepEqual(chooseReservationSlot(4, 4, []), {
    kind: "selected", anchor: null, start: "09:00", end: "09:30",
  });
});

test("slot terhalang di tengah maupun ujung menolak rentang tanpa melupakan klik pertama", () => {
  assert.deepEqual(chooseReservationSlot(4, 8, blocked), {
    kind: "unavailable", anchor: 4, reason: "Sudah disetujui",
  });
  assert.deepEqual(chooseReservationSlot(4, 6, blocked), {
    kind: "unavailable", anchor: 4, reason: "Sudah disetujui",
  });
  assert.deepEqual(chooseReservationSlot(null, 6, blocked), {
    kind: "unavailable", anchor: null, reason: "Sudah disetujui",
  });
  assert.deepEqual(chooseReservationSlot(4, 5, blocked), {
    kind: "selected", anchor: null, start: "09:00", end: "10:00",
  });
});

test("batas operasional 07:00–20:00 tetap menghasilkan slot 30 menit", () => {
  assert.equal(RESERVATION_SLOT_COUNT, 26);
  assert.deepEqual(chooseReservationSlot(null, 0, []), {
    kind: "selected", anchor: 0, start: "07:00", end: "07:30",
  });
  assert.deepEqual(chooseReservationSlot(0, 25, []), {
    kind: "selected", anchor: null, start: "07:00", end: "20:00",
  });
  assert.deepEqual(chooseReservationSlot(null, 25, []), {
    kind: "selected", anchor: 25, start: "19:30", end: "20:00",
  });
  assert.equal(chooseReservationSlot(null, 26, []).kind, "unavailable");
});
