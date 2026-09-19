import { test } from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema, createUserSchema } from "@/lib/validations/auth";

test("registerSchema menerima data valid", () => {
  const result = registerSchema.safeParse({
    name: "Budi Santoso",
    email: "budi@example.com",
    password: "User1234",
    userType: "MAHASISWA",
    identityNumber: "211201201",
  });
  assert.equal(result.success, true);
});

test("registerSchema menormalkan email (trim + lowercase)", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "  BUDI@Example.COM ",
    password: "User1234",
    userType: "MAHASISWA",
    identityNumber: "211201201",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "budi@example.com");
});

test("registerSchema menolak email tidak valid", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "bukan-email",
    password: "User1234",
    userType: "MAHASISWA",
    identityNumber: "211201201",
  });
  assert.equal(result.success, false);
});

test("registerSchema menolak password < 8 karakter", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "budi@example.com",
    password: "Us1",
    userType: "MAHASISWA",
    identityNumber: "211201201",
  });
  assert.equal(result.success, false);
});

test("registerSchema menolak password tanpa angka", () => {
  const result = registerSchema.safeParse({
    name: "Budi",
    email: "budi@example.com",
    password: "UserOnly",
    userType: "MAHASISWA",
    identityNumber: "211201201",
  });
  assert.equal(result.success, false);
});

test("loginSchema cukup butuh password tidak kosong", () => {
  assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "a@b.co", password: "" }).success, false);
});

test("createUserSchema hanya mengizinkan role USER atau OFFICER", () => {
  const base = { name: "Petugas", email: "officer2@example.com", password: "Officer1", userType: "TENDIK", identityNumber: "198701012009041002" };
  assert.equal(createUserSchema.safeParse({ ...base, role: "OFFICER" }).success, true);
  assert.equal(createUserSchema.safeParse({ ...base, role: "USER" }).success, true);
  assert.equal(createUserSchema.safeParse({ ...base, role: "ADMIN" }).success, false);
});

const baseValid = { name: "Budi Santoso", email: "budi@example.com", password: "User1234" };

test("MAHASISWA wajib NIM 9-16 huruf dan angka", () => {
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "MAHASISWA", identityNumber: "211201201" }).success, true);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "MAHASISWA", identityNumber: "ABC123456" }).success, true);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "MAHASISWA", identityNumber: "12345678" }).success, false);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "MAHASISWA", identityNumber: "12345678901234567" }).success, false);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "MAHASISWA", identityNumber: "abc-123" }).success, false);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "MAHASISWA" }).success, false);
});

test("DOSEN wajib NIP tepat 18 angka", () => {
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "DOSEN", identityNumber: "198701012009041001" }).success, true);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "DOSEN", identityNumber: "12345678901234567" }).success, false);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "DOSEN", identityNumber: "19870101200904100A" }).success, false);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "DOSEN" }).success, false);
});

test("TENDIK opsional, bila diisi wajib 18 angka", () => {
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "TENDIK" }).success, true);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "TENDIK", identityNumber: "" }).success, true);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "TENDIK", identityNumber: "198701012009041001" }).success, true);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "TENDIK", identityNumber: "12345" }).success, false);
  assert.equal(registerSchema.safeParse({ ...baseValid, userType: "TENDIK", identityNumber: "19870101200904100A" }).success, false);
});
