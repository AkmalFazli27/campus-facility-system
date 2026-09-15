import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

const tokens: Array<[string, string]> = [
  ["--brand-50", "#FFF7ED"],
  ["--brand-100", "#FFEDD5"],
  ["--brand-500", "#F97316"],
  ["--brand-600", "#EA580C"],
  ["--brand-700", "#C2410C"],
  ["--ink-950", "#172033"],
  ["--ink-600", "#475569"],
  ["--ink-400", "#94A3B8"],
  ["--canvas-public", "#FAFAF7"],
  ["--canvas-app", "#F8FAFC"],
  ["--surface", "#FFFFFF"],
  ["--success", "#16A34A"],
  ["--warning", "#D97706"],
  ["--danger", "#DC2626"],
  ["--info", "#0284C7"],
];

for (const [name, value] of tokens) {
  test(`globals.css mendefinisikan ${name}`, () => {
    assert.match(css, new RegExp(`${name}:\\s*${value}`));
  });
}

test("globals.css memetakan token ke @theme inline", () => {
  assert.match(css, /--color-brand-500:\s*var\(--brand-500\)/);
  assert.match(css, /--color-ink-600:\s*var\(--ink-600\)/);
  assert.match(css, /--color-canvas-public:\s*var\(--canvas-public\)/);
  assert.match(css, /--color-success:\s*var\(--success\)/);
});
