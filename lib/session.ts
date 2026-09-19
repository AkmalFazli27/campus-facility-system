import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

// Pasang cookie sesi httpOnly (PRD §17: SameSite=Lax, Secure di prod).
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

// Hapus cookie sesi (logout).
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "OFFICER" | "ADMIN";
  userType: "MAHASISWA" | "DOSEN" | "TENDIK";
  identityNumber: string | null;
  accountStatus: "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE";
};

// Baca cookie → verifikasi JWT → ambil user dari DB (secure check, PRD §17).
// Mengembalikan null bila tidak ada sesi valid / akun tidak ACTIVE.
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await getSession(token);
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, userType: true, identityNumber: true, accountStatus: true },
    });
    if (!user || user.accountStatus !== "ACTIVE") return null;
    return user;
  } catch {
    return null;
  }
}
