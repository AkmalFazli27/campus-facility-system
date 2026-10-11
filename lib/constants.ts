// Konstanta lintas-bundle. File ini TIDAK boleh mengimpor Prisma/next-headers
// agar aman dipakai di proxy.ts (proxy tidak boleh menyentuh DB).
export const SESSION_COOKIE = "session";

// Cookie daftar akun tersimpan (multi-akun switcher).
export const ACCOUNTS_COOKIE = "accounts";
export const MAX_SAVED_ACCOUNTS = 5;

// Durasi sesi (detik) — selaras JWT_EXPIRES_IN default 7d.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
