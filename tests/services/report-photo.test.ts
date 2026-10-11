import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveReportPhotoStorage,
  saveReportPhoto,
  type ReportPhotoStorage,
} from "@/lib/services/reportService";

function makeFile(type: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], "foto", { type });
}

test("saveReportPhoto menolak file kosong", async () => {
  const storage: ReportPhotoStorage = { save: async () => ({ url: "x" }) };

  const result = await saveReportPhoto(makeFile("image/png", 0), storage);

  assert.equal(result.success, false);
});

test("saveReportPhoto menolak format mime yang tidak diizinkan", async () => {
  const storage: ReportPhotoStorage = { save: async () => ({ url: "x" }) };

  const result = await saveReportPhoto(makeFile("application/pdf", 10), storage);

  assert.equal(result.success, false);
});

test("saveReportPhoto menolak file melebihi batas ukuran", async () => {
  const storage: ReportPhotoStorage = { save: async () => ({ url: "x" }) };
  const tooBig = 6 * 1024 * 1024;

  const result = await saveReportPhoto(makeFile("image/jpeg", tooBig), storage);

  assert.equal(result.success, false);
});

test("saveReportPhoto meneruskan pathname dan tipe file ke storage", async () => {
  const received: Array<{ pathname: string; type: string }> = [];
  const storage: ReportPhotoStorage = {
    save: async (pathname, file) => {
      received.push({ pathname, type: file.type });
      return { url: "https://blob.example/uploads/reports/foto.webp" };
    },
  };

  const result = await saveReportPhoto(makeFile("image/webp", 10), storage);

  assert.equal(result.success, true);
  assert.equal(result.photoPath, "https://blob.example/uploads/reports/foto.webp");
  const got = received[0];
  assert.ok(got.pathname.startsWith("uploads/reports/"));
  assert.ok(got.pathname.endsWith(".webp"));
  assert.equal(got.type, "image/webp");
});

test("saveReportPhoto mengembalikan gagal saat storage melempar error", async () => {
  const storage: ReportPhotoStorage = {
    save: async () => {
      throw new Error("blob down");
    },
  };

  const result = await saveReportPhoto(makeFile("image/png", 10), storage);

  assert.equal(result.success, false);
});

test("resolveReportPhotoStorage memakai Vercel Blob saat token tersedia", async () => {
  let called = false;
  const fakePut = (async (pathname: string) => {
    called = true;
    return { url: "https://blob.example/" + pathname };
  }) as unknown as typeof import("@vercel/blob").put;

  const storage = resolveReportPhotoStorage(
    { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_test" } as unknown as NodeJS.ProcessEnv,
    fakePut
  );

  const { url } = await storage.save(
    "uploads/reports/a.png",
    makeFile("image/png", 10)
  );

  assert.equal(called, true);
  assert.equal(url, "https://blob.example/uploads/reports/a.png");
});

test("resolveReportPhotoStorage memakai filesystem tanpa token", () => {
  const storage = resolveReportPhotoStorage({} as NodeJS.ProcessEnv);

  assert.equal(typeof storage.save, "function");
});
