import { test } from "node:test";
import assert from "node:assert/strict";
import { registerClientSchema } from "@/lib/validations/auth";

const base = {
  name: "Budi Santoso",
  email: "budi@example.com",
  password: "User1234",
};

test("registerClientSchema menerima data lengkap yang cocok + setuju", () => {
  const r = registerClientSchema.safeParse({
    ...base,
    confirmPassword: "User1234",
    agreeTerms: true,
  });
  assert.equal(r.success, true);
});

test("registerClientSchema menolak konfirmasi yang berbeda", () => {
  const r = registerClientSchema.safeParse({
    ...base,
    confirmPassword: "Lain1234",
    agreeTerms: true,
  });
  assert.equal(r.success, false);
  if (!r.success) {
    const fields = r.error.flatten().fieldErrors.confirmPassword ?? [];
    assert.match(JSON.stringify(fields), /tidak sama/);
  }
});

test("registerClientSchema menolak tanpa persetujuan ketentuan", () => {
  const r = registerClientSchema.safeParse({
    ...base,
    confirmPassword: "User1234",
    agreeTerms: false,
  });
  assert.equal(r.success, false);
});

test("registerClientSchema menolak konfirmasi kosong", () => {
  const r = registerClientSchema.safeParse({
    ...base,
    confirmPassword: "",
    agreeTerms: true,
  });
  assert.equal(r.success, false);
});

test("registerClientSchema tetap menegakkan aturan password server", () => {
  const r = registerClientSchema.safeParse({
    ...base,
    password: "pendek",
    confirmPassword: "pendek",
    agreeTerms: true,
  });
  assert.equal(r.success, false);
});
