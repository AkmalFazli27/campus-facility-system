import assert from "node:assert/strict";
import { test } from "node:test";
import { createReservationSchema } from "@/lib/validations/reservation";

const validReservation = {
  facility_id: 1,
  reservation_date: "2026-10-01",
  start_time: "09:00",
  end_time: "10:00",
  purpose: "Rapat kelompok",
};

test("createReservationSchema menerima payload valid", () => {
  assert.equal(createReservationSchema.safeParse(validReservation).success, true);
});

test("createReservationSchema menolak facility_id yang bukan integer positif", () => {
  assert.equal(
    createReservationSchema.safeParse({ ...validReservation, facility_id: 0 }).success,
    false,
  );
  assert.equal(
    createReservationSchema.safeParse({ ...validReservation, facility_id: 1.5 }).success,
    false,
  );
});

test("createReservationSchema menolak format dan tanggal kalender yang tidak valid", () => {
  assert.equal(
    createReservationSchema.safeParse({ ...validReservation, reservation_date: "01-10-2026" })
      .success,
    false,
  );
  assert.equal(
    createReservationSchema.safeParse({ ...validReservation, reservation_date: "2026-02-31" })
      .success,
    false,
  );
});

test("createReservationSchema menolak format waktu selain HH:mm", () => {
  assert.equal(
    createReservationSchema.safeParse({ ...validReservation, start_time: "9:00" }).success,
    false,
  );
  assert.equal(
    createReservationSchema.safeParse({ ...validReservation, end_time: "10:00:00" }).success,
    false,
  );
});

test("createReservationSchema memangkas purpose dan menolak nilai kosong", () => {
  const parsed = createReservationSchema.safeParse({
    ...validReservation,
    purpose: "  Rapat kelompok  ",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.purpose, "Rapat kelompok");

  assert.equal(
    createReservationSchema.safeParse({ ...validReservation, purpose: "   " }).success,
    false,
  );
});
