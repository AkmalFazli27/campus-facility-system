import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/app/dashboard/_components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import FacilityManagementView from "@/components/custom/admin/FacilityManagementView";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Master Data Fasilitas",
  description: "Tambah, edit, dan kelola status operasional fasilitas kampus.",
};

export default async function AdminFacilitiesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/admin/facilities");
  }

  if (user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  const facilities = await db.facility.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      capacity: true,
      description: true,
      status: true,
      createdAt: true,
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return (
    <div className="w-full lg:pl-[250px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 py-8 sm:py-10">
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
              Kelola Master Data Fasilitas
            </h1>
            <p className="text-sm text-ink-600 sm:text-base max-w-2xl">
              Tambah fasilitas baru, ubah kapasitas dan deskripsi, serta atur status operasional fasilitas (Aktif, Perbaikan, atau Nonaktif).
            </p>
          </section>

          {/* Interactive Facility Management View */}
          <FacilityManagementView initialFacilities={facilities} />
        </main>
      </div>
    </div>
  );
}
