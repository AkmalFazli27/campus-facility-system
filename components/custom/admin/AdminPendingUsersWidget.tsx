"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock,
  Mail,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userTypeLabel } from "@/lib/user-dashboard";

export type PendingUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  userType: "MAHASISWA" | "DOSEN" | "TENDIK";
  identityNumber: string | null;
  createdAt: Date | string;
};

export default function AdminPendingUsersWidget({
  initialUsers,
}: {
  initialUsers: PendingUser[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState<PendingUser[]>(initialUsers);
  const [processingId, setProcessingId] = useState<number | null>(null);

  async function handleVerify(user: PendingUser) {
    if (processingId) return;
    setProcessingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/verify`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memverifikasi akun");
      }

      toast.success(`Akun ${user.name} berhasil disetujui (ACTIVE)!`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(user: PendingUser) {
    if (processingId) return;
    setProcessingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reject`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menolak akun");
      }

      toast.success(`Pendaftaran ${user.name} telah ditolak.`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between p-5">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-ink-950 flex items-center gap-2">
              <UserCheck className="size-4 text-brand-600" />
              Persetujuan Pendaftaran Akun Civitas
            </CardTitle>
            <Badge
              variant="outline"
              className={
                users.length > 0
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }
            >
              {users.length} Menunggu
            </Badge>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Tinjau pendaftaran mandiri mahasiswa dan dosen sebelum diizinkan masuk dan meminjam fasilitas.
          </CardDescription>
        </div>
        <Link
          href="/admin/users"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
        >
          Buka Kelola Pengguna <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-950">
                Semua Akun Telah Diverifikasi
              </p>
              <p className="text-xs text-ink-500 max-w-sm mt-0.5">
                Tidak ada pendaftaran baru yang menunggu persetujuan admin. Civitas yang terdaftar aktif dapat langsung melakukan reservasi.
              </p>
            </div>
            <Link
              href="/admin/users"
              className="mt-2 text-xs font-semibold text-ink-700 hover:text-ink-950 underline underline-offset-4"
            >
              Lihat Seluruh Daftar Pengguna ↗
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((item) => {
              const isProcessing = processingId === item.id;
              const dateStr =
                typeof item.createdAt === "string"
                  ? item.createdAt.slice(0, 10)
                  : item.createdAt.toISOString().slice(0, 10);

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="size-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-ink-950">
                          {item.name}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {userTypeLabel(item.userType)}
                        </span>
                        {item.identityNumber && (
                          <span className="font-mono text-xs text-ink-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            {item.identityNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-500">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="size-3 text-ink-400" />
                          {item.email}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-ink-400" />
                          Daftar: {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(item)}
                      disabled={isProcessing}
                      className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 shadow-2xs"
                    >
                      <Check className="size-3.5 mr-1" />
                      {isProcessing ? "Memproses..." : "Setujui"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(item)}
                      disabled={isProcessing}
                      className="h-8 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-xs font-medium px-3"
                    >
                      <X className="size-3.5 mr-1" />
                      Tolak
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
