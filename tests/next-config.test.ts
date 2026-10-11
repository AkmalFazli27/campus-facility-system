import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config";

test("next.config mengizinkan gambar dari Vercel Blob", () => {
  const patterns = nextConfig.images?.remotePatterns ?? [];

  const allowsBlob = patterns.some((pattern) => {
    if (pattern instanceof URL) return pattern.hostname.endsWith("blob.vercel-storage.com");
    return pattern.hostname.endsWith("blob.vercel-storage.com");
  });

  assert.equal(allowsBlob, true);
});
