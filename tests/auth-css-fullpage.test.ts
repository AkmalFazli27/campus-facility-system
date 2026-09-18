import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

test("overlay-container memiliki z-index di atas form", () => {
  const block = css.match(/\.auth-slider \.overlay-container\s*\{[^}]*\}/);
  assert.ok(block, "blok .auth-slider .overlay-container tidak ditemukan");
  assert.match(block[0], /z-index:\s*20/);
});

test("aturan posisi slider hanya aktif di md+ (mobile pakai hidden/flex)", () => {
  assert.match(
    css,
    /@media\s*\(min-width:\s*768px\)[\s\S]*\.right-panel-active \.sign-up-container/
  );
});
