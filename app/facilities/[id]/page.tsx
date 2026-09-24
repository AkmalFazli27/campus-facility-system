import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_COPY = {
  ACTIVE: {
    label: "Aktif",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  INACTIVE: {
    label: "Tidak aktif",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  UNDER_MAINTENANCE: {
    label: "Dalam perbaikan",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
} as const;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const facilityId = Number(id);
  if (!Number.isInteger(facilityId) || facilityId <= 0) {
    return { title: "Fasilitas tidak ditemukan | KampusSpace" };
  }

  const facility = await db.facility.findUnique({
    where: { id: facilityId },
    select: { name: true },
  });

  return {
    title: facility
      ? `${facility.name} | KampusSpace`
      : "Fasilitas tidak ditemukan | KampusSpace",
  };
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const facilityId = Number(id);
  if (!Number.isInteger(facilityId) || facilityId <= 0) notFound();

  const facility = await db.facility.findUnique({
    where: { id: facilityId },
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      capacity: true,
      description: true,
      status: true,
    },
  });

  if (!facility) notFound();

  const status = STATUS_COPY[facility.status];
  const bookable = facility.status === "ACTIVE";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
      <div>
        <Link
          href="/facilities"
          className={cn(buttonVariants({ variant: "ghost" }), "pl-0")}
        >
          ← Kembali ke katalog
        </Link>
      </div>

      <section className="max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {facility.type}
          </Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
          {facility.name}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-orange-600" />
            {facility.location}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4 text-orange-600" />
            Kapasitas {facility.capacity} orang
          </span>
        </div>
        {facility.description && (
          <p className="text-base leading-7 text-muted-foreground">
            {facility.description}
          </p>
        )}
      </section>

      {!bookable && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800"
        >
          <p className="font-medium">Fasilitas ini sedang tidak dapat dipesan.</p>
          <p className="mt-1 text-sm">
            Status saat ini: {status.label}. Reservasi baru akan ditolak server
            (US03 AC3).
          </p>
        </div>
      )}

      <Card id="reservasi" className="border-orange-100">
        <CardHeader>
          <CardTitle>Ajukan reservasi</CardTitle>
          <CardDescription>
            {bookable
              ? "Form pemesanan dengan validasi slot 30 menit (07:00–20:00) segera hadir di sini."
              : "Form pemesanan aktif kembali setelah fasilitas kembali aktif."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sementara itu, riwayat pengajuanmu bisa dipantau di{" "}
            <Link href="/reservations" className="underline">
              Reservasi saya
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
