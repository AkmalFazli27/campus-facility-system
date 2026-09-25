import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PendingVerificationPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Menunggu Verifikasi</CardTitle>
          <CardDescription>
            Pendaftaran Anda berhasil. Akun akan aktif setelah diverifikasi admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Silakan hubungi administrator kampus bila verifikasi memakan waktu terlalu lama.
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke Beranda
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
