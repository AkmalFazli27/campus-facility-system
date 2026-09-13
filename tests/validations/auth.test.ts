import { test } from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema, createUserSchema } from "@/lib/validations/auth";

test("registerSchema menerima data valid", () => {
  const result = registerSchema.safeParse({
    name: "Budi Santoso",
    email: "budi@example.com",
    password: "User1234",
  });
  assert.equal(result.success, true);
});

test("registerSchema menormalkan email (trim + lowercase)", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "  BUDI@Example.COM ",
    password: "User1234",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "budi@example.com");
});

test("registerSchema menolak email tidak valid", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "bukan-email",
    password: "User1234",
  });
  assert.equal(result.success, false);
});

test("registerSchema menolak password < 8 karakter", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "budi@example.com",
    password: "Us1",
  });
  assert.equal(result.success, false);
});

test("registerSchema menolak password tanpa angka", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "budi@example.com",
    password: "UserOnly",
  });
  assert.equal(result.success, false);
});

test("loginSchema cukup butuh password tidak kosong", () => {
  assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "" }).success, false);
});

test("createUserSchema hanya mengizinkan role USER atau OFFICER", () => {
  const base = { name: "Petugas", email: "officer2@example.com", password: "Officer1" };
  assert.equal(createUserSchema.safeParse({ ...base, role: "OFFICER" }).success, true);
  assert.equal(createUserSchema.safeParse({ ...base, role: "USER" }).success, true);
  assert.equal(createUserSchema.safeParse({ ...base, role: "ADMIN" }).success, false);
});
