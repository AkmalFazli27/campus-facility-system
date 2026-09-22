import assert from "node:assert/strict";
import { test } from "node:test";
import { validateSlot } from "@/lib/services/reservationService";

test("validateSlot menerima rentang pada batas jam operasional", () => {
  assert.deepEqual(validateSlot("07:00", "07:30"), { valid: true });
  assert.deepEqual(validateSlot("09:00", "10:00"), { valid: true });
  assert.deepEqual(validateSlot("19:30", "20:00"), { valid: true });
});

test("validateSlot menolak waktu yang bukan kelipatan 30 menit", () => {
  assert.equal(validateSlot("09:10", "10:00").valid, false);
  assert.equal(validateSlot("09:00", "10:15").valid, false);
});

test("validateSlot menolak waktu di luar jam operasional", () => {
  assert.equal(validateSlot("06:30", "07:30").valid, false);
  assert.equal(validateSlot("19:30", "20:30").valid, false);
});

test("validateSlot mewajibkan waktu selesai setelah waktu mulai", () => {
  assert.equal(validateSlot("10:00", "10:00").valid, false);
  assert.equal(validateSlot("10:30", "10:00").valid, false);
});

test("validateSlot menolak format waktu yang tidak ketat", () => {
  assert.equal(validateSlot("9:00", "10:00").valid, false);
  assert.equal(validateSlot("09:00:00", "10:00").valid, false);
  assert.equal(validateSlot("abc", "10:00").valid, false);
});
