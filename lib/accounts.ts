import { MAX_SAVED_ACCOUNTS } from "@/lib/constants";

export type SavedAccountToken = { id: number; token: string };

export type SavedAccount = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "OFFICER" | "ADMIN";
  userType: "MAHASISWA" | "DOSEN" | "TENDIK";
  identityNumber: string | null;
};

// Budget konservatif di bawah batas 4KB per cookie.
const MAX_COOKIE_BYTES = 3800;

export function parseSavedTokens(
  raw: string | undefined | null,
): SavedAccountToken[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const tokens: SavedAccountToken[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) continue;
    const { id, token } = entry as { id?: unknown; token?: unknown };
    if (typeof id !== "number" || !Number.isInteger(id)) continue;
    if (typeof token !== "string" || token.length === 0) continue;
    if (tokens.some((t) => t.id === id)) continue;
    tokens.push({ id, token });
  }
  return tokens;
}

export function mergeAccountToken(
  tokens: SavedAccountToken[],
  entry: SavedAccountToken,
): SavedAccountToken[] {
  const withoutEntry = tokens.filter((t) => t.id !== entry.id);
  return [...withoutEntry, entry].slice(-MAX_SAVED_ACCOUNTS);
}

export function serializeSavedTokens(tokens: SavedAccountToken[]): string {
  const kept = tokens.slice(-MAX_SAVED_ACCOUNTS);
  while (kept.length > 0) {
    const json = JSON.stringify(kept);
    if (Buffer.byteLength(json, "utf8") <= MAX_COOKIE_BYTES) return json;
    kept.shift();
  }
  return "[]";
}
