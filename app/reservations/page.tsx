import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/dashboard/_components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import ReservationHistory from "@/components/custom/reservations/ReservationHistory";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservasi saya | KampusSpace",
  description: "Lihat riwayat dan status reservasi fasilitas kampus.",
};

export default async function ReservationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/reservations");
  if (user.role !== "USER") redirect("/?error=forbidden");

  return (
    <DashboardShell role={user.role} user={user}>
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <section className="max-w-3xl space-y-4">
          <Badge className="border-brand-100 bg-brand-50 text-brand-700">
            Portal pengguna
          </Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
              Reservasi saya
            </h1>
            <p className="text-base leading-7 text-ink-600 sm:text-lg">
              Pantau pengajuan, status persetujuan, dan detail penggunaan fasilitasmu.
            </p>
          </div>
        </section>

        <ReservationHistory />
      </div>
    </DashboardShell>
  );
}
