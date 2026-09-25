import type { FilterState } from "@/lib/facilities/types";

export function today() {
  const value = new Date();
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function createDefaultFilters(): FilterState {
  return { query: "", type: "", location: "", capacityMin: "", capacityMax: "", date: today() };
}

type FacilitySearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getFiltersFromSearchParams(params: FacilitySearchParams): FilterState {
  const defaults = createDefaultFilters();
  return {
    query: firstParam(params.q) ?? "",
    type: firstParam(params.type) ?? "",
    location: firstParam(params.location) ?? "",
    capacityMin: firstParam(params.capacity_min) ?? "",
    capacityMax: firstParam(params.capacity_max) ?? "",
    date: firstParam(params.date) ?? defaults.date,
  };
}

export function buildFilterParams(filters: FilterState) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.type) params.set("type", filters.type);
  if (filters.location) params.set("location", filters.location);
  if (filters.capacityMin) params.set("capacity_min", filters.capacityMin);
  if (filters.capacityMax) params.set("capacity_max", filters.capacityMax);
  if (filters.date) params.set("date", filters.date);
  return params;
}
