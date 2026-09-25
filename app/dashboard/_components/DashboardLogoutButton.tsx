"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardLogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("keluar gagal");
      toast.success("Berhasil keluar");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Gagal keluar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={submitting}
      className={cn("w-full justify-start gap-2 text-ink-600 hover:text-ink-950", className)}
    >
      <LogOut aria-hidden className="size-4" />
      {submitting ? "Keluar..." : "Keluar"}
    </Button>
  );
}
