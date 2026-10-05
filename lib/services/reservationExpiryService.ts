import type { PrismaClient } from "@prisma/client";
import { todayInJakarta } from "@/lib/reservation-ui";

const EXPIRED_REASON = "Belum disetujui petugas hingga H-1 sebelum tanggal peminjaman";

// Mulai H-1 (00:00 WIB), pengajuan untuk besok dan sebelumnya
// kedaluwarsa; status disinkronkan saat data reservasi dibuka.
export function pendingExpiryCutoffDate(now: Date = new Date()): Date {
  const cutoff = new Date(`${todayInJakarta(now)}T00:00:00.000Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() + 1);
  return cutoff;
}

export function isPendingReservationExpired(
  reservationDate: Date,
  now: Date = new Date(),
): boolean {
  return reservationDate <= pendingExpiryCutoffDate(now);
}

type ExpiryDatabase = Pick<PrismaClient, "reservation" | "$transaction">;

export async function expirePendingReservations(
  database: ExpiryDatabase,
  now: Date = new Date(),
): Promise<number> {
  const cutoff = pendingExpiryCutoffDate(now);
  const facilities = await database.reservation.groupBy({
    by: ["facilityId"],
    where: { status: "PENDING", reservationDate: { lte: cutoff } },
    orderBy: { facilityId: "asc" },
  });

  let expiredCount = 0;
  for (const { facilityId } of facilities) {
    // Urutan lock sama dengan approval: fasilitas lebih dulu, baru reservasi.
    // updateMany bersyarat tidak menimpa reservasi yang sudah diproses.
    const count = await database.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id FROM facilities WHERE id = ${facilityId} FOR UPDATE
      `;
      const result = await tx.reservation.updateMany({
        where: {
          facilityId,
          status: "PENDING",
          reservationDate: { lte: cutoff },
        },
        data: {
          status: "CANCELLED_BY_SYSTEM",
          cancellationReason: EXPIRED_REASON,
          processedBy: null,
          processedAt: now,
        },
      });
      return result.count;
    });
    expiredCount += count;
  }

  return expiredCount;
}
