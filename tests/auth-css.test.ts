import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

test("globals.css mendefinisikan scope .auth-slider", () => {
  assert.match(css, /\.auth-slider/);
});

test("globals.css memakai easing referensi 0.65s cubic-bezier", () => {
  assert.match(css, /cubic-bezier\(0\.76,\s*0,\s*0\.24,\s*1\)/);
  assert.match(css, /0\.65s/);
});

test("globals.css mendefinisikan state right-panel-active dua arah", () => {
  assert.match(css, /\.right-panel-active \.sign-in-container/);
  assert.match(css, /\.right-panel-active \.sign-up-container/);
  assert.match(css, /\.right-panel-active \.overlay-container/);
  assert.match(css, /\.right-panel-active \.overlay-left/);
  assert.match(css, /\.right-panel-active \.overlay-right/);
});

test("globals.css menghormati prefers-reduced-motion", () => {
  assert.match(css, /prefers-reduced-motion/);
});
