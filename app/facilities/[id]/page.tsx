import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import ReservationForm from "@/components/custom/reservations/ReservationForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statusCopy } from "@/lib/facilities/constants";
import { db } from "@/lib/db";
import { facilityIdSchema } from "@/lib/validations/facility";
import { todayInJakarta } from "@/lib/reservation-ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const parsedId = facilityIdSchema.safeParse(rawId);
  if (!parsedId.success) return { title: "Fasilitas tidak ditemukan | KampusSpace" };

  const facility = await db.facility.findUnique({
    where: { id: parsedId.data },
    select: { name: true, description: true },
  });

  return {
    title: facility ? `${facility.name} | KampusSpace` : "Fasilitas tidak ditemukan | KampusSpace",
    description: facility?.description ?? "Detail dan ketersediaan fasilitas kampus.",
  };
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const parsedId = facilityIdSchema.safeParse(rawId);
  if (!parsedId.success) notFound();

  const facility = await db.facility.findUnique({
    where: { id: parsedId.data },
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

  const status = statusCopy[facility.status];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
      <Link
        href="/facilities"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke fasilitas
      </Link>

      <section className="space-y-6">
        <Card className="rounded-3xl border-orange-100">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline" className="capitalize">
                {facility.type}
              </Badge>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">{facility.name}</CardTitle>
            <p className="leading-7 text-muted-foreground">
              {facility.description ||
                "Fasilitas kampus untuk mendukung kegiatan akademik dan organisasi."}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 border-t border-orange-100 pt-5 text-sm text-muted-foreground sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-orange-600" aria-hidden />
              {facility.location}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 text-orange-600" aria-hidden />
              Kapasitas {facility.capacity} orang
            </span>
          </CardContent>
        </Card>

        <Card id="reservasi" className="scroll-mt-28 rounded-3xl border-orange-100">
          <CardHeader>
            <CardTitle className="text-xl">Reservasi fasilitas</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Pilih tanggal dan slot yang tersedia. Pengajuan akan menunggu persetujuan petugas.
            </p>
          </CardHeader>
          <CardContent>
            <ReservationForm
              facilityId={facility.id}
              bookable={facility.status === "ACTIVE"}
              defaultDate={todayInJakarta()}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
