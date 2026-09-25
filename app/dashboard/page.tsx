import { redirect } from "next/navigation";
import DashboardSidebar from "@/app/dashboard/_components/DashboardSidebar";
import UserDashboard from "@/app/dashboard/_components/UserDashboard";
import OfficerDashboard from "@/app/dashboard/_components/OfficerDashboard";
import AdminDashboard from "@/app/dashboard/_components/AdminDashboard";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  // getSessionUser() mengembalikan null untuk: tanpa cookie, JWT tidak valid,
  // pengguna hilang, ATAU accountStatus bukan ACTIVE (PENDING/REJECTED/INACTIVE).
  // Satu redirect ini memenuhi kontrak penjagaan ganda
  // (lapis 1: proxy.ts matcher /dashboard/:path*, lapis 2: di sini).
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="w-full lg:pl-[250px]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <DashboardSidebar role={user.role} user={user} />
        <main className="flex min-w-0 flex-1 flex-col">
        {user.role === "USER" ? (
          <UserDashboard user={user} />
        ) : user.role === "OFFICER" ? (
          <OfficerDashboard user={user} />
        ) : (
          <AdminDashboard user={user} />
        )}
      </main>
      </div>
    </div>
  );
}
