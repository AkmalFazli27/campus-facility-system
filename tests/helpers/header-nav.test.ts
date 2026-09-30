import { test } from "node:test";
import assert from "node:assert/strict";
import { getHeaderDashboardHref } from "@/lib/dashboard-nav";
test("header dashboard href per role", () => {
  assert.equal(getHeaderDashboardHref("USER"), "/dashboard");
  assert.equal(getHeaderDashboardHref("ADMIN"), "/dashboard");
  assert.equal(getHeaderDashboardHref("OFFICER"), "/officer/queue");
});
