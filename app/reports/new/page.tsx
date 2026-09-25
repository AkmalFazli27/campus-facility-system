import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReportForm from "@/components/custom/reports/ReportForm";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Formulir Laporan Kerusakan | KampusSpace",
  description: "Laporkan kerusakan sarana dan prasarana kampus.",
};

export default async function NewReportPage(props: {
  searchParams: Promise<{ facility_id?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/reports/new");
  }

  const searchParams = await props.searchParams;
  const preselectedFacilityId = searchParams.facility_id
    ? Number.parseInt(searchParams.facility_id, 10)
    : undefined;

  const facilities = await db.facility.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      type: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10 sm:py-14">
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-950 transition-colors mb-4"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Daftar Laporan
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          Laporkan Kerusakan Fasilitas
        </h1>
        <p className="mt-1.5 text-sm text-ink-600">
          Bantu kami menjaga fasilitas kampus tetap nyaman dengan melaporkan kerusakan secara akurat disertai bukti foto.
        </p>
      </div>

      <ReportForm
        facilities={facilities}
        preselectedFacilityId={
          preselectedFacilityId && !Number.isNaN(preselectedFacilityId)
            ? preselectedFacilityId
            : undefined
        }
      />
    </main>
  );
}
