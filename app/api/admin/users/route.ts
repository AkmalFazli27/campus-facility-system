import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { createUserSchema, listUsersQuerySchema } from "@/lib/validations/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  accountStatus: true,
  createdAt: true,
} as const;

export async function GET(request: Request) {
  const admin = await getSessionUser();
  if (!admin) return fail(401, "Belum login");
  if (admin.role !== "ADMIN") return fail(403, "Akses ditolak");

  const url = new URL(request.url);
  const parsed = listUsersQuerySchema.safeParse({
    status: url.searchParams.get("status")?.toUpperCase() || undefined,
    role: url.searchParams.get("role")?.toUpperCase() || undefined,
  });
  if (!parsed.success) {
    return fail(422, "Filter tidak valid", parsed.error.flatten().fieldErrors);
  }

  const users = await db.user.findMany({
    where: {
      ...(parsed.data.status ? { accountStatus: parsed.data.status } : {}),
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: USER_SELECT,
  });

  return ok({ users });
}

export async function POST(request: Request) {
  const admin = await getSessionUser();
  if (!admin) return fail(401, "Belum login");
  if (admin.role !== "ADMIN") return fail(403, "Akses ditolak");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Data pengguna tidak valid", parsed.error.flatten().fieldErrors);
  }

  const { name, email, password, role } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return fail(409, "Email sudah terdaftar");

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      accountStatus: "ACTIVE",
    },
    select: USER_SELECT,
  });

  return ok({ user }, { status: 201 });
}
