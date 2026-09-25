"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RetryButton() {
  const router = useRouter();

  return (
    <Button variant="outline" className="mt-4 rounded-full" onClick={() => router.refresh()}>
      <RefreshCw aria-hidden />
      Coba lagi
    </Button>
  );
}
