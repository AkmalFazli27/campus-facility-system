import type { SessionUser } from "@/lib/session";
export default function AdminDashboard({ user }: { user: Pick<SessionUser, "id" | "name"> }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-2xl font-bold">Ringkasan admin — segera hadir</h1>
      <p className="text-sm text-ink-600">Halo {user.name}, widget Kelola (A2) dan Rekap (A4, FR-DASH-03) diisi di sini.</p>
    </div>
  );
}
