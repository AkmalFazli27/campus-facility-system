"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buildFacilitySearchUrl, buildTimeSlots } from "@/lib/landing";

const TYPE_OPTIONS = [
  { value: "all", label: "Semua jenis" },
  { value: "kelas", label: "Ruang kelas" },
  { value: "aula", label: "Aula" },
  { value: "lab", label: "Laboratorium" },
  { value: "alat", label: "Alat" },
  { value: "lapangan", label: "Lapangan" },
];

const TIME_SLOTS = buildTimeSlots();

function SearchField({
  icon: Icon,
  label,
  htmlFor,
  withDivider = true,
  children,
}: {
  icon: LucideIcon;
  label: string;
  htmlFor: string;
  withDivider?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 basis-0 items-center gap-3 px-3 py-2 lg:px-4",
        withDivider && "lg:border-r lg:border-brand-100"
      )}
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"
      >
        <Icon className="size-5" />
      </span>
      <div className="w-full min-w-0 text-left">
        <Label
          htmlFor={htmlFor}
          className="block text-[11px] font-bold tracking-wider text-ink-400 uppercase"
        >
          {label}
        </Label>
        {children}
      </div>
    </div>
  );
}

export type QuickSearchFormProps = {
  locations: string[];
};

export default function QuickSearchForm({ locations }: QuickSearchFormProps) {
  const router = useRouter();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const slot = String(data.get("slot") ?? "");
    const [startTime, endTime] = slot.split("|");
    const location = String(data.get("location") ?? "");
    router.push(
      buildFacilitySearchUrl({
        type: String(data.get("type") ?? "all"),
        location: location === "all" ? "" : location,
        date: String(data.get("date") ?? ""),
        startTime,
        endTime,
      })
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Cek ketersediaan cepat"
      className="flex flex-col gap-3 rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-100/50 lg:flex-row lg:items-center lg:gap-0 lg:rounded-full lg:px-4"
    >
      <SearchField icon={Building2} label="Jenis fasilitas" htmlFor="quick-type">
        <Select name="type" defaultValue="all">
          <SelectTrigger
            id="quick-type"
            className="h-8 w-full min-w-0 border-none bg-transparent px-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <SelectValue placeholder="Semua jenis">
              {(value) =>
                TYPE_OPTIONS.find((opt) => opt.value === value)?.label ??
                "Semua jenis"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <SearchField icon={MapPin} label="Lokasi" htmlFor="quick-location">
        <Select name="location" defaultValue="all">
          <SelectTrigger
            id="quick-location"
            className="h-8 w-full min-w-0 border-none bg-transparent px-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <SelectValue placeholder="Semua lokasi">
              {(value) => (value === "all" ? "Semua lokasi" : String(value))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua lokasi</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <SearchField icon={CalendarDays} label="Tanggal" htmlFor="quick-date">
        <Input
          id="quick-date"
          name="date"
          type="date"
          className="h-8 w-full min-w-0 border-none bg-transparent px-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </SearchField>

      <SearchField
        icon={Clock3}
        label="Waktu (30 menit)"
        htmlFor="quick-slot"
        withDivider={false}
      >
        <Select name="slot" defaultValue="07:00|07:30">
          <SelectTrigger
            id="quick-slot"
            className="h-8 w-full min-w-0 border-none bg-transparent px-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <SelectValue placeholder="Pilih slot">
              {(value) =>
                TIME_SLOTS.find((slot) => `${slot.start}|${slot.end}` === value)
                  ?.label ?? "Pilih slot"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((slot) => (
              <SelectItem key={slot.start} value={`${slot.start}|${slot.end}`}>
                {slot.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <div className="flex lg:shrink-0 lg:pl-3">
        <Button
          type="submit"
          className="h-11 w-full rounded-2xl bg-brand-500 px-6 hover:bg-brand-600 lg:w-14 lg:rounded-full lg:px-0"
        >
          <Search aria-hidden className="size-5" />
          <span className="lg:sr-only">Cari ketersediaan</span>
        </Button>
      </div>
    </form>
  );
}
