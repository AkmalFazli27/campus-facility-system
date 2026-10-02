"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, LogIn, Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { SavedAccount } from "@/lib/accounts";
import type { Role } from "@/lib/authorize";
import { getHeaderDashboardHref } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type AccountsResponse = {
  data?: { accounts?: SavedAccount[]; activeId?: number | null };
};

export default function AccountSwitcher({
  onDone,
  className,
}: {
  onDone?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/auth/accounts", { cache: "no-store" });
        const json = (await res.json()) as AccountsResponse;
        if (!ignore) {
          setAccounts(json?.data?.accounts ?? []);
          setActiveId(json?.data?.activeId ?? null);
        }
      } catch {
        if (!ignore) toast.error("Gagal memuat daftar akun");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSwitch(id: number) {
    if (busyId !== null || id === activeId) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      const target = accounts.find((a) => a.id === id);
      toast.success(`Beralih ke ${target?.name ?? "akun"}`);
      onDone?.();
      router.push(
        target ? getHeaderDashboardHref(target.role as Role) : "/dashboard",
      );
      router.refresh();
    } catch {
      toast.error("Gagal berpindah akun");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(id: number) {
    if (busyId !== null) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/auth/accounts/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch {
      toast.error("Gagal menghapus akun");
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogoutAll() {
    if (busyId !== null) return;
    setBusyId(-1);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error();
      onDone?.();
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Gagal keluar");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="px-3 pt-1 pb-1 text-xs font-semibold tracking-wider text-ink-400 uppercase">
        Akun
      </p>
      {loading ? (
        <p className="px-3 py-2 text-sm text-ink-500">Memuat…</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {accounts.map((account) => {
            const isActive = account.id === activeId;
            return (
              <li key={account.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSwitch(account.id)}
                  disabled={busyId !== null}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none disabled:opacity-60",
                    isActive ? "bg-brand-50" : "hover:bg-slate-100",
                  )}
                >
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white"
                  >
                    {account.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-950">
                      {account.name}
                    </span>
                    <span className="block truncate text-xs text-ink-500">
                      {account.email}
                    </span>
                  </span>
                  {isActive && (
                    <Check aria-hidden className="size-4 shrink-0 text-brand-600" />
                  )}
                </button>
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => handleRemove(account.id)}
                    disabled={busyId !== null}
                    aria-label={`Hapus akun ${account.name}`}
                    title="Hapus akun dari daftar"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-ink-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-ink-700 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none disabled:opacity-60"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/login?next=/dashboard"
        onClick={onDone}
        className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
      >
        <Plus aria-hidden className="size-4 text-brand-600" />
        Tambah akun lain
      </Link>
      {accounts.length > 1 && (
        <button
          type="button"
          onClick={handleLogoutAll}
          disabled={busyId !== null}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none disabled:opacity-60"
        >
          <LogIn aria-hidden className="size-4" />
          Keluar dari semua akun
        </button>
      )}
    </div>
  );
}
