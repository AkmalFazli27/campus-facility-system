"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminDashboardExportButton({
  type,
  label,
  className,
}: {
  type: "occupancy" | "damage";
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const endpoint =
        type === "occupancy"
          ? "/api/admin/recap/occupancy/export"
          : "/api/admin/recap/damage/export";

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error("Gagal mengunduh dokumen PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-${type}-dashboard.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `Laporan PDF ${
          type === "occupancy" ? "Okupansi" : "Kerusakan"
        } berhasil diunduh!`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mengunduh PDF";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleExport}
      disabled={loading}
      className={className || "rounded-xl text-xs font-semibold"}
    >
      {loading ? (
        <>
          <Loader2 className="size-3.5 mr-1.5 animate-spin text-brand-600" />
          Mengekspor...
        </>
      ) : (
        <>
          <Download className="size-3.5 mr-1.5 text-brand-600" />
          {label || (type === "occupancy" ? "Export PDF Okupansi" : "Export PDF Kerusakan")}
        </>
      )}
    </Button>
  );
}
