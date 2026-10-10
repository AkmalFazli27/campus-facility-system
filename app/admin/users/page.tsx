import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/app/dashboard/_components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import UserManagementView from "@/components/custom/admin/UserManagementView";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kelola Pengguna & Verifikasi Akun",
  description: "Verifikasi pendaftaran mandiri civitas kampus dan kelola akun pengguna atau petugas.",
};

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/admin/users");
  }

  if (user.role !== "ADMIN") {
    redirect("/?error=forbidden");
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userType: true,
      identityNumber: true,
      accountStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
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
              Kelola Pengguna &amp; Verifikasi Akun
            </h1>
            <p className="text-sm text-ink-600 sm:text-base max-w-2xl">
              Verifikasi pendaftaran akun mandiri civitas kampus, kelola status keaktifan akun, serta daftarkan petugas dan pengguna langsung ke dalam sistem.
            </p>
          </section>

          {/* Interactive User Management View */}
          <UserManagementView initialUsers={users} />
        </main>
      </div>
    </div>
  );
}
