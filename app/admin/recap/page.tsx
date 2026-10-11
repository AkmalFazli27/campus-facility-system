import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/app/dashboard/_components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import RecapAdminView from "@/components/custom/admin/RecapAdminView";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import {
  getDamageRecap,
  getOccupancyRecap,
} from "@/lib/services/recapService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rekap Admin & Ekspor PDF",
  description: "Laporan rekapitulasi okupansi fasilitas dan frekuensi kerusakan kampus.",
};

export default async function AdminRecapPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/admin/recap");
  }

  if (user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  const [facilities, initialOccupancy, initialDamage] = await Promise.all([
    db.facility.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        type: true,
      },
      orderBy: { name: "asc" },
    }),
    getOccupancyRecap({}),
    getDamageRecap({}),
  ]);

  return (
    <div className="w-full lg:pl-[250px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <DashboardSidebar role={user.role} user={user} />
        <main className="flex min-w-0 flex-1 flex-col gap-8">
          {/* Header Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="border-sky-200 bg-sky-50 text-sky-800">
                Portal Administrator
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
              Rekapitulasi &amp; Ekspor Laporan
            </h1>
            <p className="text-sm text-ink-600 sm:text-base max-w-2xl">
              Pantau utilisasi ruang serta statistik kerusakan sarana prasarana. Ekspor rekapitulasi data resmi dalam format PDF standar kampus.
            </p>
          </section>

          {/* Interactive Recap & Export Component */}
          <RecapAdminView
            facilities={facilities}
            initialOccupancy={initialOccupancy}
            initialDamage={initialDamage}
          />
        </main>
      </div>
    </div>
  );
}
