import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFilterParams, createDefaultFilters } from "@/lib/facilities/helpers";

test("buildFilterParams hanya menyertakan filter yang terisi", () => {
  const params = buildFilterParams({
    query: " Lab Komputer ",
    type: "lab",
    location: "Gedung A",
    capacityMin: "20",
    capacityMax: "100",
    date: "2026-09-24",
  });

  assert.equal(
    params.toString(),
    "q=+Lab+Komputer+&type=lab&location=Gedung+A&capacity_min=20&capacity_max=100&date=2026-09-24",
  );
});

test("buildFilterParams menghilangkan filter kosong", () => {
  const params = buildFilterParams({
    query: "",
    type: "",
    location: "",
    capacityMin: "",
    capacityMax: "",
    date: "",
  });

  assert.equal(params.toString(), "");
});

test("createDefaultFilters mengisi tanggal hari ini", () => {
  const filters = createDefaultFilters();

  assert.equal(filters.query, "");
  assert.match(filters.date, /^\d{4}-\d{2}-\d{2}$/);
});
