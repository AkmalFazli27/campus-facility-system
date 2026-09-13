"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Terjadi kesalahan</h2>
      <p className="text-sm text-muted-foreground">
        Silakan coba lagi. Jika masalah berlanjut, hubungi administrator.
      </p>
      <Button onClick={reset}>Coba lagi</Button>
    </div>
  );
}
