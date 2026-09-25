// Helper murni untuk halaman auth (login/register).
// Dipakai Client Component AuthShell + form. Tanpa akses DB.

export type AuthMode = "sign-in" | "sign-up";

export function authModeFromPath(pathname: string): AuthMode {
  return pathname.startsWith("/register") ? "sign-up" : "sign-in";
}

export function authToggleTarget(mode: AuthMode): "/login" | "/register" {
  return mode === "sign-in" ? "/register" : "/login";
}

// Membangun href toggle dengan mempertahankan ?next= saat kembali ke /login
// agar redirect tujuan dari proxy.ts tidak hilang.
export function buildAuthToggleHref(
  toRegister: boolean,
  next?: string
): string {
  if (toRegister) return "/register";
  return next ? `/login?next=${encodeURIComponent(next)}` : "/login";
}

// Dipindah dari login-form agar bisa di-unit-test.
// Menolak protocol-relative (//evil), backslash, dan path tanpa segmen.
export function isSafeNextPath(value: unknown): value is string {
  return typeof value === "string" && /^\/[^/\\]/.test(value);
}
