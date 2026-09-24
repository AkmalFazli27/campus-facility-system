import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAvailabilitySlots } from "@/lib/services/facilityAvailabilityService";

test("buildAvailabilitySlots menghasilkan 26 slot 30 menit", () => {
  const slots = buildAvailabilitySlots();

  assert.equal(slots.length, 26);
  assert.deepEqual(slots[0], {
    start: "07:00",
    end: "07:30",
    available: true,
    reason: null,
  });
  assert.deepEqual(slots.at(-1), {
    start: "19:30",
    end: "20:00",
    available: true,
    reason: null,
  });
});

test("buildAvailabilitySlots menghasilkan slot berurutan tanpa jeda", () => {
  const slots = buildAvailabilitySlots();

  for (let index = 1; index < slots.length; index += 1) {
    assert.equal(slots[index - 1].end, slots[index].start);
    assert.equal(slots[index].available, true);
    assert.equal(slots[index].reason, null);
  }
});
