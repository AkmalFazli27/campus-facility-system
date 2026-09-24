import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { rejectReservation } from "@/lib/services/reservationApprovalService";
import { serializeReservation } from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import {
  officerDecisionSchema,
  reservationIdSchema,
} from "@/lib/validations/reservation";

export const runtime = "nodejs";

// US09 AC3 / FR-RSV-04: petugas menolak reservasi PENDING (wajib alasan).
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return fail(401, "Belum login");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    return fail(403, "Akses ditolak");
  }

  const { id: rawId } = await context.params;
  const parsedId = reservationIdSchema.safeParse(rawId);
  if (!parsedId.success) return fail(400, "ID reservasi tidak valid");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Body harus berupa JSON yang valid");
  }

  const parsedBody = officerDecisionSchema.safeParse(body);
  if (!parsedBody.success) {
    return fail(
      422,
      "Alasan penolakan wajib diisi",
      parsedBody.error.flatten().fieldErrors,
    );
  }

  try {
    const result = await rejectReservation(
      db,
      parsedId.data,
      user.id,
      parsedBody.data.reason,
    );
    if (result.kind === "not-found") {
      return fail(404, "Reservasi tidak ditemukan");
    }
    if (result.kind === "not-pending") {
      return fail(422, "Hanya reservasi pending yang bisa ditolak");
    }
    return ok({ reservation: serializeReservation(result.reservation) });
  } catch (error) {
    console.error(`PATCH /api/officer/reservations/${parsedId.data}/reject failed`, error);
    return fail(500, "Gagal menolak reservasi");
  }
}
