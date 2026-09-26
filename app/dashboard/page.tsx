import { redirect } from "next/navigation";
import DashboardShell from "@/app/dashboard/_components/DashboardShell";
import UserDashboard from "@/app/dashboard/_components/UserDashboard";
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
  if (user.role === "OFFICER") redirect("/officer/queue");

  return (
    <DashboardShell role={user.role} user={user}>
      {user.role === "USER" ? (
        <UserDashboard user={user} />
      ) : (
        <AdminDashboard user={user} />
      )}
    </DashboardShell>
  );
}
