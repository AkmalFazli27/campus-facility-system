import type { FilterState } from "@/lib/facilities/types";

export function today() {
  const value = new Date();
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function createDefaultFilters(): FilterState {
  return { query: "", type: "", location: "", capacityMin: "", capacityMax: "", date: today() };
}

export function getInitialFilters(): FilterState {
  if (typeof window === "undefined") return createDefaultFilters();

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
