import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildReservationHistoryUrl,
  formatReservationDate,
  RESERVATION_STATUSES,
  RESERVATION_STATUS_META,
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
