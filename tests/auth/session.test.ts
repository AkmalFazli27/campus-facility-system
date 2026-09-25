import { test } from "node:test";
import assert from "node:assert/strict";
import { signSession, getSession } from "@/lib/auth";

test("signSession lalu getSession mengembalikan payload yang sama", async () => {
  const token = await signSession({ id: 42, role: "ADMIN" });
  const payload = await getSession(token);
  assert.equal(payload.id, 42);
  assert.equal(payload.role, "ADMIN");
});

test("getSession menolak token yang dipalsukan", async () => {
  const token = await signSession({ id: 1, role: "USER" });
  await assert.rejects(() => getSession(`${token}tampered`));
});
