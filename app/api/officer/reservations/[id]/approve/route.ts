import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { approveReservation } from "@/lib/services/reservationApprovalService";
import { serializeReservation } from "@/lib/services/reservationService";
import { getSessionUser } from "@/lib/session";
import { reservationIdSchema } from "@/lib/validations/reservation";

export const runtime = "nodejs";

// US09 / FR-RSV-04: petugas menyetujui reservasi PENDING.
// Cek konflik di dalam transaksi: bentrok dengan APPROVED lain
// di fasilitas+tanggal yang overlap → 409.
export async function PATCH(
  _request: Request,
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

  try {
    const result = await approveReservation(db, parsedId.data, user.id);

    switch (result.kind) {
      case "not-found":
        return fail(404, "Reservasi tidak ditemukan");
      case "not-pending":
        return fail(422, "Hanya reservasi pending yang bisa disetujui");
      case "facility-unavailable":
        return fail(422, "Fasilitas sedang tidak aktif atau dalam perbaikan");
      case "invalid-slot":
        return fail(422, result.message);
      case "conflict":
        return fail(409, "Jadwal bentrok dengan reservasi lain yang sudah disetujui");
      case "approved":
        return ok({ reservation: serializeReservation(result.reservation) });
    }
  } catch (error) {
    console.error(`PATCH /api/officer/reservations/${parsedId.data}/approve failed`, error);
    return fail(500, "Gagal menyetujui reservasi");
  }
}
