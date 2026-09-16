"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, MapPin, RotateCcw, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FacilityStatus = "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";

type Facility = {
  id: number;
  name: string;
  type: string;
  location: string;
  capacity: number;
  description: string | null;
  status: FacilityStatus;
};

type ApiResponse = {
  success: boolean;
  data?: Facility[];
  message?: string;
  meta?: {
    locations?: string[];
  };
};

type FilterState = {
  query: string;
  type: string;
  location: string;
  capacityMin: string;
  capacityMax: string;
  date: string;
};

const facilityTypes = [
  { value: "", label: "Semua tipe" },
  { value: "kelas", label: "Kelas" },
  { value: "aula", label: "Aula" },
  { value: "lab", label: "Laboratorium" },
  { value: "lapangan", label: "Lapangan" },
  { value: "alat", label: "Alat" },
];

const statusCopy: Record<FacilityStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Aktif", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  INACTIVE: { label: "Tidak aktif", className: "border-slate-200 bg-slate-100 text-slate-600" },
  UNDER_MAINTENANCE: {
    label: "Dalam perbaikan",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

function today() {
  const value = new Date();
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function getInitialFilters() {
  if (typeof window === "undefined") {
    return { query: "", type: "", location: "", capacityMin: "", capacityMax: "", date: today() };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    query: params.get("q") ?? "",
    type: params.get("type") ?? "",
    location: params.get("location") ?? "",
    capacityMin: params.get("capacity_min") ?? "",
    capacityMax: params.get("capacity_max") ?? "",
    date: params.get("date") ?? today(),
  };
}

function buildFilterParams(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.type) params.set("type", filters.type);
  if (filters.location) params.set("location", filters.location);
  if (filters.capacityMin) params.set("capacity_min", filters.capacityMin);
  if (filters.capacityMax) params.set("capacity_max", filters.capacityMax);
  if (filters.date) params.set("date", filters.date);

  return params;
}

export default function FacilitiesPage() {
  const [filters, setFilters] = useState(getInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState(getInitialFilters);
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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFilters = { ...appliedFilters, query: filters.query.trim() };
    const params = buildFilterParams(nextFilters);
    window.history.pushState({}, "", `/facilities?${params.toString()}`);
    setError(null);
    setIsLoading(true);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFilters = {
      ...filters,
      query: appliedFilters.query,
      location: filters.location.trim(),
    };
    const params = buildFilterParams(nextFilters);
    window.history.pushState({}, "", `/facilities?${params.toString()}`);
    setError(null);
    setIsLoading(true);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  function resetFilters() {
    const nextFilters = { query: "", type: "", location: "", capacityMin: "", capacityMax: "", date: today() };
    window.history.pushState({}, "", `/facilities?date=${nextFilters.date}`);
    setError(null);
    setIsLoading(true);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
      <section className="max-w-3xl space-y-4">
        <Badge className="border-orange-200 bg-orange-50 text-orange-700">Katalog fasilitas kampus</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Cari fasilitas</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Temukan ruang, laboratorium, aula, dan fasilitas kampus yang sesuai dengan kebutuhanmu.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 shadow-sm sm:p-6">
        <form className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={submitSearch}>
          <label className="grid gap-2 text-sm font-medium">
            Cari fasilitas
            <Input
              className="bg-white"
              value={filters.query}
              placeholder="Contoh: Lab Komputer"
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            />
          </label>
          <Button type="submit" className="sm:col-start-2 sm:row-start-1">
            <Search />
            Cari
          </Button>
        </form>

        <form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_0.7fr_0.7fr_1fr_auto] xl:items-end" onSubmit={submitFilters}>
          <label className="grid gap-2 text-sm font-medium">
            Tipe fasilitas
            <select
              className="h-9 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={filters.type}
              onChange={(event) => setFilters({ ...filters, type: event.target.value })}
            >
              {facilityTypes.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Lokasi
            <select
              className="h-9 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={filters.location}
              onChange={(event) => setFilters({ ...filters, location: event.target.value })}
            >
              <option value="">Semua lokasi</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Kapasitas min.
            <Input
              className="bg-white"
              min="0"
              type="number"
              value={filters.capacityMin}
              placeholder="0"
              onChange={(event) => setFilters({ ...filters, capacityMin: event.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Kapasitas maks.
            <Input
              className="bg-white"
              min="0"
              type="number"
              value={filters.capacityMax}
              placeholder="500"
              onChange={(event) => setFilters({ ...filters, capacityMax: event.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Tanggal
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
              <Input
                className="bg-white pl-9"
                type="date"
                value={filters.date}
                onChange={(event) => setFilters({ ...filters, date: event.target.value })}
              />
            </div>
          </label>
          <div className="flex items-center gap-2">
            <Button type="submit" className="flex-1 lg:w-full">
              Terapkan filter
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={resetFilters} aria-label="Reset filter">
              <RotateCcw />
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4" aria-live="polite">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Pilihan fasilitas</h2>
            {!isLoading && !error && <p className="text-sm text-muted-foreground">{facilities.length} fasilitas ditemukan</p>}
          </div>
          {filters.date && <p className="text-right text-sm text-muted-foreground">Untuk {filters.date}</p>}
        </div>

        {isLoading && <FacilitySkeleton />}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-medium">Data fasilitas belum dapat dimuat.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => {
              setError(null);
              setIsLoading(true);
              setAppliedFilters({ ...appliedFilters });
            }}>Coba lagi</Button>
          </div>
        )}

        {!isLoading && !error && facilities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-10 text-center">
            <h3 className="font-semibold">Tidak ada fasilitas yang cocok</h3>
            <p className="mt-2 text-sm text-muted-foreground">Coba ubah filter atau tampilkan semua fasilitas.</p>
            <Button className="mt-5" variant="outline" onClick={resetFilters}>Reset filter</Button>
          </div>
        )}

        {!isLoading && !error && facilities.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
          </div>
        )}
      </section>
    </main>
  );
}

function FacilityCard({ facility }: { facility: Facility }) {
  const status = statusCopy[facility.status];

  return (
    <Card className="flex h-full flex-col overflow-hidden border-orange-100 transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="outline" className="capitalize">{facility.type}</Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
        <CardTitle className="text-xl">{facility.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">
          {facility.description || "Fasilitas kampus untuk mendukung kegiatan akademik dan organisasi."}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><MapPin className="size-4 text-orange-600" />{facility.location}</span>
          <span className="flex items-center gap-2"><Users className="size-4 text-orange-600" />Kapasitas {facility.capacity} orang</span>
        </div>
        <Button className="w-full" variant="outline" disabled>
          Detail segera hadir
        </Button>
      </CardContent>
    </Card>
  );
}

function FacilitySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Memuat fasilitas">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-xl border border-orange-100 bg-orange-50/60" />
      ))}
    </div>
  );
}
