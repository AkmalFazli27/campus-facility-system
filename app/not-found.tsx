import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Halaman tidak ditemukan</h2>
      <p className="text-sm text-muted-foreground">
        Tautan yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada.
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
