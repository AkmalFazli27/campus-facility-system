import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
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

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getSessionUser();
  if (!admin) return fail(401, "Belum login");
  if (admin.role !== "ADMIN") return fail(403, "Akses ditolak");

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) return fail(400, "ID tidak valid");

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return fail(404, "Pengguna tidak ditemukan");
  if (target.accountStatus !== "PENDING") {
    return fail(409, "Hanya akun pending yang bisa diverifikasi");
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { accountStatus: "ACTIVE" },
    select: USER_SELECT,
  });

  return ok({ user });
}
