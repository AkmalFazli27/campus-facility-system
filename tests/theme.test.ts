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

const themeTokens = [
  "brand-50",
  "brand-100",
  "brand-500",
  "brand-600",
  "brand-700",
  "ink-950",
  "ink-600",
  "ink-400",
  "canvas-public",
  "canvas-app",
  "surface",
  "success",
  "warning",
  "danger",
  "info",
];

for (const name of themeTokens) {
  test(`globals.css memetakan --color-${name}`, () => {
    assert.match(css, new RegExp(`--color-${name}:\\s*var\\(--${name}\\)`));
  });
}
