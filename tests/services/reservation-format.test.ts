import assert from "node:assert/strict";
import { test } from "node:test";
import { serializeReservation } from "@/lib/services/reservationService";

test("serializeReservation memformat DATE dan TIME tanpa pergeseran timezone", () => {
  const result = serializeReservation({
    id: 1,
    reservationDate: new Date("2026-10-03T00:00:00.000Z"),
    startTime: new Date("1970-01-01T13:30:00.000Z"),
    endTime: new Date("1970-01-01T14:30:00.000Z"),
  });

  assert.deepEqual(result, {
    id: 1,
    reservationDate: "2026-10-03",
    startTime: "13:30",
    endTime: "14:30",
  });
});
