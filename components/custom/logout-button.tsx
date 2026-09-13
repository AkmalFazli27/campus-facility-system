"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    setSubmitting(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={submitting}>
      {submitting ? "Keluar..." : "Keluar"}
    </Button>
  );
}
