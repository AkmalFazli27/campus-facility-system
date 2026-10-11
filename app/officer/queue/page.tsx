import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/dashboard/_components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import ReservationQueue from "@/components/custom/officer/ReservationQueue";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Antrian Petugas",
  description: "Proses antrian reservasi ruang kampus.",
};

// US08: halaman antrian petugas. Guard ganda: proxy.ts (matcher /officer/:path*)
// + secure check di sini. Antrian laporan kerusakan punya halaman sendiri di
// /officer/reports.
export default async function OfficerQueuePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/officer/queue");
  if (user.role !== "OFFICER" && user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  return (
    <DashboardShell role={user.role} user={user} maxWidth="7xl">
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <section className="max-w-3xl space-y-4">
          <Badge className="border-sky-200 bg-sky-50 text-sky-700">
            Ruang kerja petugas
          </Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
              Antrian petugas
            </h1>
            <p className="text-base leading-7 text-ink-600 sm:text-lg">
              Proses pengajuan reservasi ruang yang menunggu tindakan.
            </p>
          </div>
        </section>

        <ReservationQueue />
      </div>
    </DashboardShell>
  );
}
