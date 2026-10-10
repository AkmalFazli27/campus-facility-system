import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/dashboard/_components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import ReportQueue from "@/components/custom/officer/ReportQueue";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laporan Kerusakan",
  description: "Tindak lanjuti laporan kerusakan dan kelola status pemeliharaan fasilitas.",
};

// US12/A4: antrian laporan kerusakan berdiri sendiri, terpisah dari antrian
// reservasi di /officer/queue. Guard ganda: proxy.ts (matcher /officer/:path*)
// + secure check di sini.
export default async function OfficerReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/officer/reports");
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
              Laporan kerusakan
            </h1>
            <p className="text-base leading-7 text-ink-600 sm:text-lg">
              Tindak lanjuti laporan kerusakan dan kelola status pemeliharaan fasilitas.
            </p>
          </div>
        </section>

        <ReportQueue />
      </div>
    </DashboardShell>
  );
}
