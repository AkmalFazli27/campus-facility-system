import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fail } from "@/lib/http";
import { getSavedTokens, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const id = (body as { id?: unknown })?.id;
  if (typeof id !== "number" || !Number.isInteger(id)) {
    return fail(422, "id akun tidak valid");
  }

  const saved = await getSavedTokens();
  const entry = saved.find((t) => t.id === id);
  if (!entry) return fail(404, "Akun tidak ditemukan");

  try {
    const payload = await getSession(entry.token);
    if (payload.id !== id) return fail(401, "Sesi akun tidak valid");
  } catch {
    return fail(401, "Sesi akun sudah kedaluwarsa");
  }

  const record = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userType: true,
      identityNumber: true,
      accountStatus: true,
    },
  });
  if (!record || record.accountStatus !== "ACTIVE") {
    return fail(403, "Akun tidak aktif");
  }

  const response = NextResponse.json({
    success: true,
    data: {
      user: {
        id: record.id,
        name: record.name,
        email: record.email,
        role: record.role,
        userType: record.userType,
        identityNumber: record.identityNumber,
      },
    },
  });
  return setSessionCookie(response, entry.token);
}
