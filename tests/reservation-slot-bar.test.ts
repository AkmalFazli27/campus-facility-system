import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReservationSlotBar from "@/components/custom/reservations/ReservationSlotBar";

test("slot bar tanpa jam awal tidak memilih slot atau menampilkan teks tutorial", () => {
  const html = renderToStaticMarkup(createElement(ReservationSlotBar, {
    start: "",
    end: "",
    onRangeChange: () => {},
  }));

  assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 26);
  assert.ok(!html.includes('aria-pressed="true"'));
  assert.ok(!html.includes("Mulai "));
  assert.ok(!html.includes("Klik slot"));
  assert.ok(!html.includes("09:00–10:00"));
});
