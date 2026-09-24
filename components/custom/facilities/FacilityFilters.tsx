"use client";

import type { FormEvent } from "react";
import { CalendarDays, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { facilityTypes } from "@/lib/facilities/constants";
import type { FilterState } from "@/lib/facilities/types";

type FacilityFiltersProps = {
  filters: FilterState;
  locations: string[];
  onChange: (filters: FilterState) => void;
  onSearch: (filters: FilterState) => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
};

export default function FacilityFilters({
  filters,
  locations,
  onChange,
  onSearch,
  onApply,
  onReset,
}: FacilityFiltersProps) {
  function updateFilters(patch: Partial<FilterState>) {
    onChange({ ...filters, ...patch });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch({ ...filters, query: filters.query.trim() });
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply({ ...filters, location: filters.location.trim() });
  }

  return (
    <section className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 shadow-sm sm:p-6">
      <form
        className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={submitSearch}
      >
        <label className="grid gap-2 text-sm font-medium">
          Cari fasilitas
          <Input
            className="bg-white"
            value={filters.query}
            placeholder="Contoh: Lab Komputer"
            onChange={(event) => updateFilters({ query: event.target.value })}
          />
        </label>
        <Button type="submit" className="sm:col-start-2 sm:row-start-1">
          <Search />
          Cari
        </Button>
      </form>

      <form
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_0.7fr_0.7fr_1fr_auto] xl:items-end"
        onSubmit={submitFilters}
      >
        <label className="grid gap-2 text-sm font-medium">
          Tipe fasilitas
          <select
            className="h-9 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            value={filters.type}
            onChange={(event) => updateFilters({ type: event.target.value })}
          >
            {facilityTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Lokasi
          <select
            className="h-9 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            value={filters.location}
            onChange={(event) => updateFilters({ location: event.target.value })}
          >
            <option value="">Semua lokasi</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
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
            onChange={(event) => updateFilters({ capacityMin: event.target.value })}
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
            onChange={(event) => updateFilters({ capacityMax: event.target.value })}
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
              onChange={(event) => updateFilters({ date: event.target.value })}
            />
          </div>
        </label>
        <div className="flex items-center gap-2">
          <Button type="submit" className="flex-1 lg:w-full">
            Terapkan filter
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={onReset} aria-label="Reset filter">
            <RotateCcw />
          </Button>
        </div>
      </form>
    </section>
  );
}
