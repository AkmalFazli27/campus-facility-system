import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/dashboard/_components/DashboardShell";
import OfficerReservationHistory from "@/components/custom/officer/OfficerReservationHistory";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riwayat Peminjaman",
  description: "Lihat semua pengajuan reservasi dan keputusan petugas.",
};

export default async function OfficerReservationHistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/officer/reservations/history");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  return (
    <DashboardShell role={user.role} user={user} maxWidth="7xl">
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <section className="space-y-4">
          <Badge className="border-sky-200 bg-sky-50 text-sky-700">
            Ruang kerja petugas
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
            Riwayat peminjaman
          </h1>
          <p className="max-w-3xl text-base leading-7 text-ink-600">
            Telusuri semua pengajuan, status, alasan keputusan, dan petugas yang memproses.
          </p>
          <Link href="/officer/queue" className={buttonVariants({ variant: "outline" })}>
            Kembali ke antrian
          </Link>
        </section>

        <OfficerReservationHistory />
      </div>
    </DashboardShell>
  );
}
