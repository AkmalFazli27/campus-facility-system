import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseSavedTokens,
  mergeAccountToken,
  serializeSavedTokens,
} from "@/lib/accounts";

test("parseSavedTokens mengembalikan [] untuk input rusak", () => {
  assert.deepEqual(parseSavedTokens(undefined), []);
  assert.deepEqual(parseSavedTokens("bukan-json"), []);
  assert.deepEqual(parseSavedTokens('{"a":1}'), []);
});

test("parseSavedTokens memfilter entri tidak valid dan duplikat id", () => {
  const raw = JSON.stringify([
    { id: 1, token: "a" },
    { id: 1, token: "a2" },
    { id: "x", token: "b" },
    { id: 2, token: 9 },
    { id: 3, token: "c" },
  ]);
  assert.deepEqual(parseSavedTokens(raw), [
    { id: 1, token: "a" },
    { id: 3, token: "c" },
  ]);
});

test("mergeAccountToken mengganti token id sama dan geser ke akhir", () => {
  const result = mergeAccountToken(
    [
      { id: 1, token: "old" },
      { id: 2, token: "b" },
    ],
    { id: 1, token: "new" },
  );
  assert.deepEqual(result, [
    { id: 2, token: "b" },
    { id: 1, token: "new" },
  ]);
});

test("mergeAccountToken membatasi jumlah akun", () => {
  const full = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    token: `t${i + 1}`,
  }));
  const result = mergeAccountToken(full, { id: 6, token: "t6" });
  assert.equal(result.length, 5);
  assert.equal(result[0].id, 2);
  assert.equal(result[4].id, 6);
});

test("serializeSavedTokens membuang token tertua saat melebihi budget", () => {
  const long = "x".repeat(3000);
  const tokens = [
    { id: 1, token: long },
    { id: 2, token: long },
  ];
  const result = JSON.parse(serializeSavedTokens(tokens));
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 2);
});
