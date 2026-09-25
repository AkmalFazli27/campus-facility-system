import type { SessionUser } from "@/lib/session";
export default function OfficerDashboard({ user }: { user: Pick<SessionUser, "id" | "name"> }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-2xl font-bold">Antrian petugas — segera hadir</h1>
      <p className="text-sm text-ink-600">Halo {user.name}, slot ini milik A4 (FR-DASH-01).</p>
    </div>
  );
}
