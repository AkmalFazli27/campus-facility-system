import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import BenefitCards from "@/components/custom/BenefitCards";
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

export default async function Home() {
  let facilities: FacilityPreview[] | null = null;

  try {
    facilities = await getPreviewFacilities();
  } catch {
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-12 sm:py-16">
        <HeroSection />
        <QuickSearchForm />
        <BenefitCards />

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
                "min-h-11 rounded-full px-6"
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

        <section id="tentang" className="scroll-mt-24">
          <WorkflowCards />
        </section>
        <HowItWorks />
        <FinalCta />
      </main>
      <PublicFooter />
    </div>
  );
}
