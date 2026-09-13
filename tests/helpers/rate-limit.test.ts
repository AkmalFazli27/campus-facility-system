import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, resetRateLimitStore } from "@/lib/rate-limit";

test("mengizinkan sampai batas lalu memblokir", () => {
  resetRateLimitStore();
  for (let i = 0; i < 3; i++) {
    assert.equal(checkRateLimit("login:1.2.3.4", 3, 60_000).allowed, true);
  }
  assert.equal(checkRateLimit("login:1.2.3.4", 3, 60_000).allowed, false);
});

test("key berbeda punya bucket terpisah", () => {
  resetRateLimitStore();
  assert.equal(checkRateLimit("login:a", 1, 60_000).allowed, true);
  assert.equal(checkRateLimit("login:b", 1, 60_000).allowed, true);
  assert.equal(checkRateLimit("login:a", 1, 60_000).allowed, false);
});

test("reset membuka kembali bucket", () => {
  resetRateLimitStore();
  assert.equal(checkRateLimit("login:x", 1, 60_000).allowed, true);
  assert.equal(checkRateLimit("login:x", 1, 60_000).allowed, false);
  resetRateLimitStore();
  assert.equal(checkRateLimit("login:x", 1, 60_000).allowed, true);
});
