import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import FacilityPreviewCard, {
  type FacilityPreview,
} from "@/components/custom/FacilityPreviewCard";
import FinalCta from "@/components/custom/FinalCta";
import HeroSection from "@/components/custom/HeroSection";
import HowItWorks from "@/components/custom/HowItWorks";
import PublicFooter from "@/components/custom/PublicFooter";
import QuickSearchForm from "@/components/custom/QuickSearchForm";
import RetryButton from "@/components/custom/RetryButton";
import WorkflowCards from "@/components/custom/WorkflowCards";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getPreviewFacilities(): Promise<FacilityPreview[]> {
  return db.facility.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    take: 4,
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

async function getLocations(): Promise<string[]> {
  const rows = await db.facility.findMany({
    where: { status: "ACTIVE" },
    distinct: ["location"],
    orderBy: { location: "asc" },
    select: { location: true },
  });
  return rows.map((row) => row.location).filter((location) => location.length > 0);
}

export default async function Home() {
  let facilities: FacilityPreview[] | null = null;
  let locations: string[] = [];
  let heroUser: { name: string } | null = null;

  try {
    [facilities, locations] = await Promise.all([
      getPreviewFacilities(),
      getLocations(),
    ]);
  } catch {
  }

  try {
    const sessionUser = await getSessionUser();
    if (sessionUser) heroUser = { name: sessionUser.name };
  } catch {
    heroUser = null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-12 sm:py-16">
        <HeroSection user={heroUser} />
        <QuickSearchForm locations={locations} />

        <section aria-labelledby="popular-facilities-heading" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-wider text-brand-600 uppercase">
                Pilihan kampus
              </p>
              <h2
                id="popular-facilities-heading"
                className="mt-2 text-3xl font-bold tracking-tight text-ink-950"
              >
                Fasilitas populer kampus
              </h2>
            </div>
            <Link
              href="/facilities"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-11 rounded-full border-brand-200 bg-brand-50 px-6 text-brand-600 hover:bg-brand-100 hover:text-brand-700"
              )}
            >
              Lihat semua fasilitas
            </Link>
          </div>

          {facilities === null ? (
            <div className="rounded-3xl border border-warning/30 bg-warning/10 p-6">
              <h3 className="font-bold text-ink-950">Gagal memuat fasilitas</h3>
              <p className="mt-2 text-sm text-ink-600">
                Data fasilitas sedang tidak tersedia. Silakan coba lagi.
              </p>
              <RetryButton />
            </div>
          ) : facilities.length === 0 ? (
            <div className="rounded-3xl border border-brand-100 bg-white p-6">
              <h3 className="font-bold text-ink-950">Belum ada fasilitas aktif</h3>
              <p className="mt-2 text-sm text-ink-600">
                Fasilitas aktif akan tampil di halaman ini.
              </p>
              <Link
                href="/facilities"
                className={cn(buttonVariants(), "mt-4 rounded-full")}
              >
                Lihat fasilitas
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {facilities.map((facility) => (
                <FacilityPreviewCard key={facility.id} facility={facility} />
              ))}
            </div>
          )}
        </section>

        <section id="tentang" className="scroll-mt-24 space-y-4">
          <WorkflowCards />
          <div className="flex justify-center">
            <Link
              href="/tentang"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-brand-600 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              Pelajari lebih lanjut tentang KampusSpace →
            </Link>
          </div>
        </section>
        <HowItWorks />
        <FinalCta isLoggedIn={heroUser !== null} />
      </main>
      <PublicFooter />
    </div>
  );
}
