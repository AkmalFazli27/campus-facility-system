import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";
import { fail, ok } from "@/lib/http";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return fail(401, "Belum login");

  try {
    const payload = await getSession(token);
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        userType: true,
        identityNumber: true,
        accountStatus: true,
        createdAt: true,
      },
    });
    if (!user || user.accountStatus !== "ACTIVE") return fail(401, "Sesi tidak valid");
    return ok({ user });
  } catch {
    return fail(401, "Sesi tidak valid");
  }
}
