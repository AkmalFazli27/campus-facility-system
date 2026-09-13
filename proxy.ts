import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";
import { isAuthorized } from "@/lib/authorize";

// Next.js 16: file convention "proxy" (pengganti middleware) — default Node.js runtime.
// Fungsi ini hanya OPTIMISTIC check (baca cookie, tanpa DB). Route Handler tetap
// melakukan secure check via getSessionUser() (PRD §17).
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) return redirectToLogin(request, pathname);

  let role: string;
  try {
    role = (await getSession(token)).role;
  } catch {
    return redirectToLogin(request, pathname);
  }

  if (!isAuthorized(pathname, role)) {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/reservations/:path*",
    "/reports/:path*",
    "/officer/:path*",
    "/admin/:path*",
  ],
};
