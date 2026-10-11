import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FACILITY_IMAGE_TYPES,
  FACILITY_TYPE_ICONS,
  FACILITY_TYPE_IMAGES,
  getFacilityImage,
  getFacilityTypeIcon,
  normalizeFacilityType,
} from "@/lib/facilities/images";

test("mapping gambar mencakup 5 tipe dengan src dan alt tak kosong", () => {
  assert.deepEqual([...FACILITY_IMAGE_TYPES], ["kelas", "aula", "lab", "lapangan", "alat"]);

  for (const type of FACILITY_IMAGE_TYPES) {
    const image = FACILITY_TYPE_IMAGES[type];
    assert.equal(image.src, `/assets/facilities/${type}.jpg`);
    assert.ok(image.alt.trim().length > 0);
    assert.ok(FACILITY_TYPE_ICONS[type]);
  }
});

test("normalizeFacilityType mentolerir kapital dan spasi", () => {
  assert.equal(normalizeFacilityType(" Aula "), "aula");
  assert.equal(normalizeFacilityType("LAB"), "lab");
});

test("tipe asing jatuh ke default kelas", () => {
  assert.equal(normalizeFacilityType("gudang"), "kelas");
  assert.equal(getFacilityImage("gudang"), FACILITY_TYPE_IMAGES.kelas);
  assert.equal(getFacilityTypeIcon(""), FACILITY_TYPE_ICONS.kelas);
});
