import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

test("route /tentang ada dengan metadata Indonesia", () => {
  assert.equal(existsSync(join(root, "app", "tentang", "page.tsx")), true);
  const src = read("app/tentang/page.tsx");
  assert.match(src, /Tentang — KampusSpace/);
  assert.match(src, /Satu tempat untuk fasilitas kampus/);
  assert.match(src, /07\.00–20\.00/);
  assert.match(src, /30 menit/);
});

test("halaman tentang reuse alur + CTA tanpa klaim terlarang", () => {
  const src = read("app/tentang/page.tsx");
  assert.match(src, /WorkflowCards/);
  assert.match(src, /FinalCta/);
  assert.match(src, /AboutFaq/);
  assert.doesNotMatch(src, /SSO/i);
  assert.doesNotMatch(src, /QR/i);
  assert.doesNotMatch(src, /rating|ulasan/i);
  assert.doesNotMatch(src, /instant/i);
});

test("FAQ memuat 5 pertanyaan yang disepakati", () => {
  const src = read("components/custom/AboutFaq.tsx");
  const expected = [
    "Apakah perlu akun untuk cek ketersediaan?",
    "Bagaimana jika slot yang saya mau bentrok?",
    "Bagaimana cara membatalkan reservasi?",
    "Aturan foto laporan kerusakan?",
    "Siapa yang menyetujui pengajuan?",
  ];
  for (const q of expected) {
    assert.ok(src.includes(q), `FAQ hilang: ${q}`);
  }
  assert.match(src, /<details/);
  assert.match(src, /<summary/);
});

test("header nav ke /tentang dengan active state", () => {
  const src = read("components/custom/PublicHeader.tsx");
  assert.match(src, /label: "Tentang", href: "\/tentang"/);
  assert.doesNotMatch(src, /href: "\/#tentang"/);
  assert.match(src, /pathname === href/);
});

test("footer panduan ke /tentang, landing pertahankan anchor + teaser", () => {
  const footer = read("components/custom/PublicFooter.tsx");
  assert.match(footer, /href: "\/tentang"/);
  const landing = read("app/page.tsx");
  assert.match(landing, /id="tentang"/);
  assert.match(landing, /href="\/tentang"/);
});
