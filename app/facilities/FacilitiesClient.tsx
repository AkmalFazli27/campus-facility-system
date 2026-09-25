"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FacilityCard from "@/components/custom/facilities/FacilityCard";
import FacilityFilters from "@/components/custom/facilities/FacilityFilters";
import FacilitySkeleton from "@/components/custom/facilities/FacilitySkeleton";
import type { ApiResponse, Facility, FilterState } from "@/lib/facilities/types";
import { buildFilterParams, createDefaultFilters } from "@/lib/facilities/helpers";

export default function FacilitiesClient({
  initialFilters,
}: {
  initialFilters: FilterState;
}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = buildFilterParams(appliedFilters);

    fetch(`/api/facilities?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as ApiResponse;
        if (!response.ok || !body.success) {
          throw new Error(body.message ?? "Gagal mengambil data fasilitas");
        }
        setLocations(body.meta?.locations ?? []);
        return body.data ?? [];
      })
      .then(setFacilities)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Terjadi kesalahan");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [appliedFilters]);

  function updateUrl(nextFilters: FilterState) {
    const query = buildFilterParams(nextFilters).toString();
    window.history.pushState({}, "", query ? `/facilities?${query}` : "/facilities");
  }

  function applyFilters(nextFilters: FilterState) {
    updateUrl(nextFilters);
    setError(null);
    setIsLoading(true);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  function resetFilters() {
    applyFilters(createDefaultFilters());
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
      <section className="max-w-3xl space-y-4">
        <Badge className="border-orange-200 bg-orange-50 text-orange-700">
          Katalog fasilitas kampus
        </Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Cari fasilitas</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Temukan ruang, laboratorium, aula, dan fasilitas kampus yang sesuai dengan kebutuhanmu.
          </p>
        </div>
      </section>

      <FacilityFilters
        filters={filters}
        locations={locations}
        onChange={setFilters}
        onSearch={applyFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <section className="space-y-4" aria-live="polite">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Pilihan fasilitas</h2>
            {!isLoading && !error && (
              <p className="text-sm text-muted-foreground">{facilities.length} fasilitas ditemukan</p>
            )}
          </div>
          {filters.date && (
            <p className="text-right text-sm text-muted-foreground">Untuk {filters.date}</p>
          )}
        </div>

        {isLoading && <FacilitySkeleton />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-medium">Data fasilitas belum dapat dimuat.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => applyFilters({ ...appliedFilters })}>
              Coba lagi
            </Button>
          </div>
        )}

        {!isLoading && !error && facilities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-10 text-center">
            <h3 className="font-semibold">Tidak ada fasilitas yang cocok</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Coba ubah filter atau tampilkan semua fasilitas.
            </p>
            <Button className="mt-5" variant="outline" onClick={resetFilters}>
              Reset filter
            </Button>
          </div>
        )}

        {!isLoading && !error && facilities.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
