"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Check,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { userTypeLabel } from "@/lib/user-dashboard";

export type AdminUserItem = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "OFFICER" | "ADMIN";
  userType: "MAHASISWA" | "DOSEN" | "TENDIK";
  identityNumber: string | null;
  accountStatus: "ACTIVE" | "PENDING" | "REJECTED" | "INACTIVE";
  createdAt: Date | string;
};

export default function UserManagementView({
  initialUsers,
}: {
  initialUsers: AdminUserItem[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "create">(
    initialUsers.some((u) => u.accountStatus === "PENDING") ? "pending" : "all"
  );

  // Filters for "all" tab
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Create User form state
  const [createRole, setCreateRole] = useState<"USER" | "OFFICER">("USER");
  const [createType, setCreateType] = useState<"MAHASISWA" | "DOSEN" | "TENDIK">("MAHASISWA");
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createIdentity, setCreateIdentity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action state
  const [processingId, setProcessingId] = useState<number | null>(null);

  const pendingUsers = users.filter((u) => u.accountStatus === "PENDING");

  async function handleVerify(user: AdminUserItem) {
    if (processingId) return;
    setProcessingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/verify`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memverifikasi akun");

      toast.success(`Akun ${user.name} berhasil diverifikasi dan aktif!`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, accountStatus: "ACTIVE" } : u))
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(user: AdminUserItem) {
    if (processingId) return;
    setProcessingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reject`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menolak akun");

      toast.success(`Pendaftaran ${user.name} telah ditolak.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, accountStatus: "REJECTED" } : u))
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeactivate(user: AdminUserItem) {
    if (processingId) return;
    setProcessingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/deactivate`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menonaktifkan akun");

      toast.success(`Akun ${user.name} telah dinonaktifkan.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, accountStatus: "INACTIVE" } : u))
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!createName.trim()) return toast.error("Nama lengkap wajib diisi");
    if (!createEmail.trim()) return toast.error("Email wajib diisi");
    if (createPassword.length < 8)
      return toast.error("Password minimal 8 karakter dengan huruf dan angka");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          role: createRole,
          userType: createType,
          identityNumber: createIdentity.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mendaftarkan akun");
      }

      toast.success(
        `Akun ${json.data.user.role === "OFFICER" ? "Petugas" : "Pengguna"} ${json.data.user.name} berhasil dibuat (ACTIVE)!`
      );

      setUsers((prev) => [json.data.user, ...prev]);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateIdentity("");
      setActiveTab("all");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.identityNumber && u.identityNumber.toLowerCase().includes(q));

    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.accountStatus === statusFilter;
    const matchType = !typeFilter || u.userType === typeFilter;

    return matchQuery && matchRole && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="inline-flex w-full sm:w-auto rounded-2xl bg-slate-100 p-1 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "pending"
                ? "bg-white text-ink-950 shadow-xs"
                : "text-ink-600 hover:text-ink-950"
            )}
          >
            <UserCheck className="size-3.5 text-amber-600" />
            Menunggu Verifikasi
            {pendingUsers.length > 0 && (
              <span className="rounded-full bg-amber-500 text-white px-2 py-0.2 text-[10px] font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "all"
                ? "bg-white text-ink-950 shadow-xs"
                : "text-ink-600 hover:text-ink-950"
            )}
          >
            <Users className="size-3.5 text-brand-600" />
            Semua Pengguna ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "create"
                ? "bg-white text-ink-950 shadow-xs"
                : "text-ink-600 hover:text-ink-950"
            )}
          >
            <UserPlus className="size-3.5 text-emerald-600" />
            Daftarkan Langsung
          </button>
        </div>

        {activeTab === "all" && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" />
            <Input
              placeholder="Cari nama, email, NIM/NIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 rounded-full border-slate-200 bg-white text-xs shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Menunggu Verifikasi (Pending) */}
      {activeTab === "pending" && (
        <Card className="border-slate-200 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 p-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-ink-950 flex items-center gap-2">
                <UserCheck className="size-4 text-amber-600" />
                Antrean Pendaftaran Akun Civitas
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Pengguna dengan status PENDING tidak dapat login ke sistem sampai disetujui admin.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                pendingUsers.length > 0
                  ? "border-amber-200 bg-amber-50 text-amber-800 text-xs"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800 text-xs"
              }
            >
              {pendingUsers.length} Menunggu Persetujuan
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {pendingUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="size-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-ink-950">
                    Tidak Ada Pendaftaran Menunggu
                  </p>
                  <p className="text-xs text-ink-500 max-w-sm mt-1">
                    Semua akun civitas yang melakukan registrasi mandiri telah diverifikasi atau tidak ada permohonan baru saat ini.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("all")}
                  className="rounded-xl text-xs font-semibold"
                >
                  Buka Seluruh Daftar Pengguna
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-ink-600 font-semibold">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Tipe Civitas</th>
                      <th className="py-3 px-4">NIM / NIP</th>
                      <th className="py-3 px-4">Tanggal Daftar</th>
                      <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingUsers.map((user, idx) => {
                      const isProcessing = processingId === user.id;
                      const dateStr =
                        typeof user.createdAt === "string"
                          ? user.createdAt.slice(0, 10)
                          : user.createdAt.toISOString().slice(0, 10);

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-center font-mono text-ink-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-ink-950">
                            <div className="flex items-center gap-2.5">
                              <span className="size-8 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center shrink-0 border border-amber-100 text-xs">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-ink-600">{user.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {userTypeLabel(user.userType)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-ink-800">
                            {user.identityNumber || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-ink-500">{dateStr}</td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerify(user)}
                                disabled={isProcessing}
                                className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 shadow-2xs"
                              >
                                <Check className="size-3.5 mr-1" />
                                {isProcessing ? "..." : "Setujui"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(user)}
                                disabled={isProcessing}
                                className="h-8 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 text-xs font-medium px-3"
                              >
                                <X className="size-3.5 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Semua Pengguna */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {/* Quick Filters Card */}
          <Card className="border-slate-200 shadow-2xs p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-ink-700 mb-1.5 block">
                  Filter Peran (Role)
                </Label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Semua Peran (User, Officer, Admin)</option>
                  <option value="USER">User (Pengguna Biasa)</option>
                  <option value="OFFICER">Officer (Petugas Fasilitas)</option>
                  <option value="ADMIN">Admin (Administrator)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-ink-700 mb-1.5 block">
                  Filter Status Akun
                </Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Semua Status Akun</option>
                  <option value="ACTIVE">Aktif (ACTIVE)</option>
                  <option value="PENDING">Menunggu (PENDING)</option>
                  <option value="REJECTED">Ditolak (REJECTED)</option>
                  <option value="INACTIVE">Nonaktif (INACTIVE)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-ink-700 mb-1.5 block">
                  Filter Tipe Civitas
                </Label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Semua Tipe Civitas</option>
                  <option value="MAHASISWA">Mahasiswa</option>
                  <option value="DOSEN">Dosen</option>
                  <option value="TENDIK">Tenaga Kependidikan</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="border-slate-200 shadow-xs overflow-hidden">
            <CardHeader className="border-b border-slate-100 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-ink-950">
                  Daftar Seluruh Pengguna Sistem
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Menampilkan {filteredUsers.length} dari {users.length} total pengguna terdaftar.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setActiveTab("create")}
                className="h-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 shadow-2xs"
              >
                <Plus className="size-3.5 mr-1" />
                Tambah Akun
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-ink-600 font-semibold">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Peran</th>
                      <th className="py-3 px-4">Tipe Civitas</th>
                      <th className="py-3 px-4">NIM / NIP</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-ink-400">
                          Tidak ada pengguna yang sesuai dengan kriteria filter
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, idx) => {
                        const isProcessing = processingId === user.id;

                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="py-3 px-4 text-center font-mono text-ink-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-semibold text-ink-950">
                              {user.name}
                            </td>
                            <td className="py-3 px-4 text-ink-600 font-mono text-[11px]">
                              {user.email}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                  user.role === "ADMIN"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : user.role === "OFFICER"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-slate-100 text-slate-700"
                                )}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-ink-600">
                              {userTypeLabel(user.userType)}
                            </td>
                            <td className="py-3 px-4 font-mono text-ink-800">
                              {user.identityNumber || "-"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                                  user.accountStatus === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : user.accountStatus === "PENDING"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : user.accountStatus === "REJECTED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                )}
                              >
                                {user.accountStatus === "ACTIVE"
                                  ? "Aktif"
                                  : user.accountStatus === "PENDING"
                                  ? "Menunggu"
                                  : user.accountStatus === "REJECTED"
                                  ? "Ditolak"
                                  : "Nonaktif"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {user.accountStatus === "PENDING" ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerify(user)}
                                    disabled={isProcessing}
                                    className="h-7 text-[11px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
                                  >
                                    Setujui
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(user)}
                                    disabled={isProcessing}
                                    className="h-7 text-[11px] rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50 px-2"
                                  >
                                    Tolak
                                  </Button>
                                </div>
                              ) : user.accountStatus === "ACTIVE" &&
                                user.role !== "ADMIN" ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeactivate(user)}
                                  disabled={isProcessing}
                                  className="h-7 text-[11px] rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <Ban className="size-3 mr-1" />
                                  Nonaktifkan
                                </Button>
                              ) : (
                                <span className="text-ink-300 text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Tambah Pengguna / Petugas Langsung (US13 & US14) */}
      {activeTab === "create" && (
        <Card className="border-slate-200 shadow-xs max-w-2xl mx-auto">
          <CardHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-2">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                Registrasi Langsung Admin
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-ink-950 mt-1">
              Daftarkan Petugas atau Pengguna Baru
            </CardTitle>
            <CardDescription className="text-xs">
              Akun yang didaftarkan langsung oleh admin akan langsung berstatus <strong>ACTIVE</strong> tanpa melalui antrean verifikasi mandiri. Petugas tidak memiliki form registrasi publik.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-ink-700">
                    Peran Akun (Role)
                  </Label>
                  <select
                    value={createRole}
                    onChange={(e) =>
                      setCreateRole(e.target.value as "USER" | "OFFICER")
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="USER">Pengguna (Mahasiswa / Dosen / Civitas)</option>
                    <option value="OFFICER">Petugas Fasilitas (Officer)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-ink-700">
                    Tipe Civitas
                  </Label>
                  <select
                    value={createType}
                    onChange={(e) =>
                      setCreateType(
                        e.target.value as "MAHASISWA" | "DOSEN" | "TENDIK"
                      )
                    }
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-ink-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="MAHASISWA">Mahasiswa</option>
                    <option value="DOSEN">Dosen</option>
                    <option value="TENDIK">Tenaga Kependidikan (Tendik)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-name" className="text-xs font-semibold text-ink-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="create-name"
                  placeholder="Contoh: Budi Santoso"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="create-email" className="text-xs font-semibold text-ink-700">
                    Alamat Email
                  </Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="nama@kampus.ac.id"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-identity" className="text-xs font-semibold text-ink-700">
                    Nomor Identitas (NIM / NIP)
                  </Label>
                  <Input
                    id="create-identity"
                    placeholder={createType === "MAHASISWA" ? "9-16 digit NIM" : "18 digit NIP"}
                    value={createIdentity}
                    onChange={(e) => setCreateIdentity(e.target.value)}
                    className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-password" className="text-xs font-semibold text-ink-700">
                  Password Awal
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Minimal 8 karakter huruf dan angka"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 bg-white text-xs shadow-2xs"
                  required
                />
                <p className="text-[11px] text-ink-400">
                  Sandi awal yang akan digunakan akun untuk login pertama kali.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("all")}
                  className="h-9 rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 shadow-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Daftarkan Akun Aktif"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
