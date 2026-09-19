import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { fail } from "@/lib/http";

export const runtime = "nodejs";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  userType: true,
  identityNumber: true,
  accountStatus: true,
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Data registrasi tidak valid", parsed.error.flatten().fieldErrors);
  }

  const { name, email, password, userType } = parsed.data;
  const identityNumber = (parsed.data.identityNumber ?? "").trim() || null;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return fail(409, "Email sudah terdaftar");
  }

  if (identityNumber) {
    const existingIdentity = await db.user.findUnique({ where: { identityNumber } });
    if (existingIdentity) {
      return fail(409, "Nomor identitas sudah terdaftar");
    }
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "USER",
      userType,
      identityNumber,
      accountStatus: "PENDING",
    },
    select: USER_SELECT,
  });

  return NextResponse.json({ success: true, data: { user } }, { status: 201 });
}
