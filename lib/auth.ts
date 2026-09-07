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

// TODO (minggu 2, A1): validasi penuh + ambil user dari DB.
export async function getSession(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { id: number; role: string };
}
