import assert from "node:assert/strict";
import { test } from "node:test";
import { isThirtyMinuteSlot, withinOperatingHours } from "@/lib/helpers/slots";
import { validateSlot } from "@/lib/services/reservationService";
import { createReservationSchema } from "@/lib/validations/reservation";

// Kunci aturan form reservasi (PRD §7.1, US03) sebelum UI dibangun.
// Form di /facilities/[id] akan reuse helper & schema ini untuk validasi client (UX);
// validasi otoritatif tetap di Route Handler.

test("form menolak slot yang bukan kelipatan 30 menit (:15/:45)", () => {
  assert.equal(isThirtyMinuteSlot("09:15"), false);
  assert.equal(isThirtyMinuteSlot("09:45"), false);
  assert.equal(isThirtyMinuteSlot("13:30"), true);
  assert.equal(validateSlot("09:15", "10:00").valid, false);
  assert.equal(validateSlot("09:00", "10:45").valid, false);
});

test("form hanya mengizinkan jam operasional 07:00-20:00", () => {
  assert.equal(withinOperatingHours("07:00", "20:00"), true);
  assert.equal(validateSlot("07:00", "20:00").valid, true);
  assert.equal(validateSlot("06:30", "07:00").valid, false);
  assert.equal(validateSlot("20:00", "20:30").valid, false);
  assert.equal(validateSlot("19:30", "20:00").valid, true);
});

test("form menolak durasi nol atau end sebelum start", () => {
  assert.equal(validateSlot("07:00", "07:00").valid, false);
  assert.equal(validateSlot("10:30", "10:00").valid, false);
});

test("form menolak format jam tidak ketat", () => {
  assert.equal(isThirtyMinuteSlot("7:00"), false);
  assert.equal(isThirtyMinuteSlot("09:00:00"), false);
  assert.equal(validateSlot("9:00", "10:00").valid, false);
});

test("form mewajibkan tanggal valid YYYY-MM-DD dan tujuan terisi", () => {
  const base = {
    facility_id: 1,
    reservation_date: "2026-10-01",
    start_time: "09:00",
    end_time: "10:00",
    purpose: "Rapat kelompok",
  };

  assert.equal(createReservationSchema.safeParse(base).success, true);
  assert.equal(
    createReservationSchema.safeParse({ ...base, reservation_date: "" }).success,
    false,
  );
  assert.equal(
    createReservationSchema.safeParse({ ...base, reservation_date: "2026-02-31" })
      .success,
    false,
  );
  assert.equal(
    createReservationSchema.safeParse({ ...base, purpose: "   " }).success,
    false,
  );
});
