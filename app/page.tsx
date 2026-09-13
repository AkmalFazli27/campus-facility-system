import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-semibold">Fasilitas Kampus</span>
          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Masuk
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Daftar
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Reservasi & pelaporan fasilitas kampus dalam satu tempat
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Lihat ketersediaan ruang, aula, laboratorium, dan lapangan secara real-time.
            Ajukan reservasi, pantau status, dan laporkan kerusakan tanpa koordinasi manual.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/facilities" className={cn(buttonVariants({ size: "lg" }))}>
              Lihat Fasilitas
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Daftar Akun
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Cek Ketersediaan</CardTitle>
              <CardDescription>Slot 07.00–20.00 per 30 menit, tanpa perlu login.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Telusuri fasilitas berdasarkan tipe, lokasi, dan kapasitas.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ajukan Reservasi</CardTitle>
              <CardDescription>Pilih slot, isi tujuan, tunggu persetujuan petugas.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Status reservasi terlihat jelas: pending, disetujui, atau ditolak.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Laporkan Kerusakan</CardTitle>
              <CardDescription>Kirim laporan + foto, pantau hingga selesai.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Petugas menindaklanjuti dan memperbarui status fasilitas.
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-sm text-muted-foreground">
          Sistem Reservasi & Pelaporan Fasilitas Kampus
        </div>
      </footer>
    </div>
  );
}
