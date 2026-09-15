import FacilityPreviewCard, {
  type FacilityPreview,
} from "@/components/custom/FacilityPreviewCard";
import QuickSearchForm from "@/components/custom/QuickSearchForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

async function getFacilities(type: string, location: string): Promise<FacilityPreview[]> {
  return db.facility.findMany({
    where: {
      status: "ACTIVE",
      ...(type && type !== "all" ? { type } : {}),
      ...(location ? { location: { contains: location } } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      capacity: true,
      status: true,
    },
  });
}

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const type = firstParam(params.type);
  const location = firstParam(params.location);
  const date = firstParam(params.date);
  let facilities: FacilityPreview[] | null = null;

  try {
    facilities = await getFacilities(type, location);
  } catch {
    // Keep database details out of the public catalog.
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12 sm:py-16">
      <section aria-labelledby="facilities-heading" className="space-y-3">
        <p className="text-sm font-bold tracking-wider text-brand-600 uppercase">
          Katalog publik
        </p>
        <h1 id="facilities-heading" className="text-4xl font-bold tracking-tight text-ink-950">
          Cari fasilitas
        </h1>
        <p className="max-w-2xl text-ink-600">
          Temukan fasilitas aktif kampus berdasarkan jenis dan lokasi. Pilih tanggal untuk
          melanjutkan pengecekan slot yang tersedia.
        </p>
        {date && (
          <p className="text-sm font-medium text-brand-600">Tanggal tujuan: {date}</p>
        )}
      </section>

      <QuickSearchForm />

      {facilities === null ? (
        <div className="rounded-3xl border border-warning/30 bg-warning/10 p-6" role="alert">
          <h2 className="font-bold text-ink-950">Katalog belum dapat dimuat</h2>
          <p className="mt-2 text-sm text-ink-600">
            Data fasilitas sedang tidak tersedia. Silakan coba lagi beberapa saat lagi.
          </p>
        </div>
      ) : facilities.length === 0 ? (
        <div className="rounded-3xl border border-brand-100 bg-white p-6">
          <h2 className="font-bold text-ink-950">Fasilitas tidak ditemukan</h2>
          <p className="mt-2 text-sm text-ink-600">
            Coba ubah jenis atau lokasi pencarianmu.
          </p>
        </div>
      ) : (
        <section aria-label="Daftar fasilitas aktif" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <FacilityPreviewCard key={facility.id} facility={facility} />
          ))}
        </section>
      )}
    </main>
  );
}
