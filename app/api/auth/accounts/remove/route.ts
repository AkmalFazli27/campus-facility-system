import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { fail } from "@/lib/http";
import {
  getSavedTokens,
  setSavedAccountsCookie,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/session";

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
  const activeToken = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const removed = saved.find((t) => t.id === id);
  if (!removed) return fail(404, "Akun tidak ditemukan");

  const remaining = saved.filter((t) => t.id !== id);
  const wasActive = activeToken === removed.token;
  const currentActiveId = saved.find((t) => t.token === activeToken)?.id ?? null;
  const next = remaining[remaining.length - 1] ?? null;
  const nextActiveId = wasActive ? (next?.id ?? null) : currentActiveId;

  const response = NextResponse.json({
    success: true,
    data: { activeId: nextActiveId },
  });
  setSavedAccountsCookie(response, remaining);
  if (wasActive) {
    if (next) setSessionCookie(response, next.token);
    else clearSessionCookie(response);
  }
  return response;
}
