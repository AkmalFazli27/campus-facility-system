import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";
import { ok } from "@/lib/http";
import { getSavedTokens, setSavedAccountsCookie } from "@/lib/session";
import type { SavedAccount, SavedAccountToken } from "@/lib/accounts";

export const runtime = "nodejs";

export async function GET() {
  const saved = await getSavedTokens();
  const activeToken = (await cookies()).get(SESSION_COOKIE)?.value ?? null;

  const accounts: SavedAccount[] = [];
  const valid: SavedAccountToken[] = [];
  let activeId: number | null = null;

  for (const entry of saved) {
    try {
      const payload = await getSession(entry.token);
      if (payload.id !== entry.id) continue;
      const user = await db.user.findUnique({
        where: { id: entry.id },
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
      if (!user || user.accountStatus !== "ACTIVE") continue;
      valid.push(entry);
      accounts.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        identityNumber: user.identityNumber,
      });
      if (activeToken === entry.token) activeId = user.id;
    } catch {
      continue;
    }
  }

  return setSavedAccountsCookie(ok({ accounts, activeId }), valid);
}
