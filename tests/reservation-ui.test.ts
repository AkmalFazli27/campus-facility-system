import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildReservationHistoryUrl,
  formatReservationDate,
  RESERVATION_STATUSES,
  RESERVATION_STATUS_META,
  todayInJakarta,
  unavailableReasonForRange,
} from "@/lib/reservation-ui";

test("semua status reservasi memiliki label dan gaya visual", () => {
  assert.equal(RESERVATION_STATUSES.length, 6);

  for (const status of RESERVATION_STATUSES) {
    assert.ok(RESERVATION_STATUS_META[status].label.length > 0);
    assert.ok(RESERVATION_STATUS_META[status].className.length > 0);
  }
});

test("buildReservationHistoryUrl membuang filter kosong dan ALL", () => {
  assert.equal(
    buildReservationHistoryUrl({ status: "ALL", from: "", to: "" }),
    "/api/reservations/my",
  );
});

test("buildReservationHistoryUrl menyertakan status dan periode", () => {
  assert.equal(
    buildReservationHistoryUrl({
      status: "PENDING",
      from: "2026-10-01",
      to: "2026-10-31",
    }),
    "/api/reservations/my?status=PENDING&from=2026-10-01&to=2026-10-31",
  );
});

test("formatReservationDate tidak menggeser tanggal", () => {
  assert.equal(formatReservationDate("2026-10-03"), "3 Oktober 2026");
});

test("todayInJakarta tetap memakai tanggal WIB di sekitar pergantian hari", () => {
  assert.equal(
    todayInJakarta(new Date("2026-09-24T18:00:00.000Z")),
    "2026-09-25",
  );
});

test("unavailableReasonForRange mendeteksi slot tidak tersedia yang terlewati", () => {
  const slots = [
    { start: "09:00", end: "09:30", available: true },
    {
      start: "09:30",
      end: "10:00",
      available: false,
      reason: "Sudah disetujui",
    },
  ];

  assert.equal(unavailableReasonForRange("09:00", "10:00", slots), "Sudah disetujui");
  assert.equal(unavailableReasonForRange("09:00", "09:30", slots), null);
  assert.equal(unavailableReasonForRange("10:00", "10:30", slots), null);
});
