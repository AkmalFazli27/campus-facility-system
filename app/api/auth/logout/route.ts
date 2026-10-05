import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import {
  clearSessionCookie,
  clearSavedAccountsCookie,
  getSavedTokens,
  setSavedAccountsCookie,
  setSessionCookie,
} from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let all = false;
  try {
    const body = (await request.json()) as { all?: unknown };
    all = body?.all === true;
  } catch {
    all = false;
  }

  const saved = await getSavedTokens();
  const activeToken = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const activeEntry = saved.find((t) => t.token === activeToken);
  const remaining = activeEntry
    ? saved.filter((t) => t.id !== activeEntry.id)
    : saved;

  if (all || !activeEntry || remaining.length === 0) {
    const response = NextResponse.json({
      success: true,
      data: { loggedOut: true, activeId: null },
    });
    clearSessionCookie(response);
    clearSavedAccountsCookie(response);
    return response;
  }

  const next = remaining[remaining.length - 1];
  const response = NextResponse.json({
    success: true,
    data: { loggedOut: true, activeId: next.id },
  });
  setSessionCookie(response, next.token);
  setSavedAccountsCookie(response, remaining);
  return response;
}
