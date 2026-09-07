import { NextResponse } from "next/server";

// TODO (minggu 2, A1): authenticate (baca + verifikasi JWT httpOnly cookie)
// + authorize(role) per matcher; redirect ke /login bila tidak sah.
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/reservations/:path*",
    "/reports/:path*",
    "/officer/:path*",
    "/admin/:path*",
  ],
};
