import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { env } from "@/config/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// TODO (minggu 2, A1): selaraskan payload + expiry dengan kontrak auth PRD §13.
export async function signSession(payload: {
  id: number;
  role: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
}

export type SessionPayload = { id: number; role: string };

// Verifikasi penuh: paksa algoritma HS256 + validasi bentuk payload.
// Melempar error bila token tidak valid/kadaluarsa/payload menyimpang.
export async function getSession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  if (typeof payload.id !== "number" || typeof payload.role !== "string") {
    throw new Error("Payload sesi tidak valid");
  }
  return { id: payload.id, role: payload.role };
}
