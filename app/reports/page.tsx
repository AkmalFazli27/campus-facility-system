import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import DashboardSidebar from "@/app/dashboard/_components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import ReportList from "@/components/custom/reports/ReportList";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laporan Kerusakan Saya | KampusSpace",
  description: "Pantau status perbaikan fasilitas kampus yang Anda laporkan.",
};

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/reports");
  }

  const reports = await db.report.findMany({
    where: { reporterId: user.id },
    include: {
      facility: {
        select: { id: true, name: true, location: true, type: true },
      },
      handler: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full lg:pl-[250px]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <DashboardSidebar role={user.role} user={user} />
        <main className="flex min-w-0 flex-1 flex-col gap-8">
          {/* Top Header Section */}
          <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                  Portal pengguna
                </Badge>
                <span className="text-xs text-ink-400">• US06 &amp; US07</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
                Laporan Kerusakan Saya
              </h1>
              <p className="text-sm text-ink-600 sm:text-base max-w-xl">
                Sampaikan kendala fasilitas kampus agar segera ditindaklanjuti oleh petugas sarana dan prasarana.
              </p>
            </div>

            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30"
            >
              <Plus className="size-4" />
              Laporkan Kerusakan
            </Link>
          </section>

          {/* List Laporan */}
          <ReportList initialReports={reports} />
        </main>
      </div>
    </div>
  );
}
