import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isReservationFinished,
  reservationEndInstant,
  userTypeLabel,
} from "@/lib/user-dashboard";

const reservation = {
  reservationDate: new Date("2026-09-24T00:00:00.000Z"),
  endTime: new Date("1970-01-01T10:30:00.000Z"),
};

test("dashboard menggabungkan DATE dan TIME sebagai waktu WIB", () => {
  assert.equal(
    reservationEndInstant(reservation).toISOString(),
    "2026-09-24T03:30:00.000Z",
  );
});

test("dashboard menganggap reservasi selesai tepat pada waktu berakhir", () => {
  assert.equal(
    isReservationFinished(reservation, new Date("2026-09-24T03:29:59.000Z")),
    false,
  );
  assert.equal(
    isReservationFinished(reservation, new Date("2026-09-24T03:30:00.000Z")),
    true,
  );
});

test("dashboard menampilkan label tipe pengguna", () => {
  assert.equal(userTypeLabel("MAHASISWA"), "Mahasiswa");
  assert.equal(userTypeLabel("DOSEN"), "Dosen");
  assert.equal(userTypeLabel("TENDIK"), "Tenaga kependidikan");
});
