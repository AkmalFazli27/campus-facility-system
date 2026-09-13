import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { fail } from "@/lib/http";
import { setSessionCookie } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(`login:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return fail(429, "Terlalu banyak percobaan login. Coba lagi nanti.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Email atau password tidak valid", parsed.error.flatten().fieldErrors);
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail(401, "Email atau password salah");
  }
  if (user.accountStatus === "PENDING") {
    return fail(403, "Akun menunggu verifikasi admin");
  }
  if (user.accountStatus !== "ACTIVE") {
    return fail(403, "Akun tidak aktif");
  }

  const token = await signSession({ id: user.id, role: user.role });
  const response = NextResponse.json({
    success: true,
    data: {
      // Kontrak PRD §13: { user, token } + set-cookie httpOnly.
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
      token,
    },
  });
  return setSessionCookie(response, token);
}
