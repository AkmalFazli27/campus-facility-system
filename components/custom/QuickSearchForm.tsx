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
  children,
}: {
  icon: LucideIcon;
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 px-3 py-2 lg:border-r lg:border-brand-100">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"
      >
        <Icon className="size-5" />
      </span>
      <div className="w-full text-left">
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

export default function QuickSearchForm() {
  const router = useRouter();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const slot = String(data.get("slot") ?? "");
    const [startTime, endTime] = slot.split("|");
    router.push(
      buildFacilitySearchUrl({
        type: String(data.get("type") ?? "all"),
        location: String(data.get("location") ?? ""),
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
      className="flex flex-col gap-3 rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-100/50 lg:flex-row lg:items-center lg:gap-0 lg:rounded-full lg:px-6"
    >
      <SearchField icon={Building2} label="Jenis fasilitas" htmlFor="quick-type">
        <Select name="type" defaultValue="all">
          <SelectTrigger
            id="quick-type"
            className="w-full border-none bg-transparent p-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <SelectValue placeholder="Semua jenis" />
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
        <Input
          id="quick-location"
          name="location"
          placeholder="cth. Gedung A"
          autoComplete="off"
          className="border-none bg-transparent p-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </SearchField>

      <SearchField icon={CalendarDays} label="Tanggal" htmlFor="quick-date">
        <Input
          id="quick-date"
          name="date"
          type="date"
          className="border-none bg-transparent p-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </SearchField>

      <SearchField icon={Clock3} label="Waktu (30 menit)" htmlFor="quick-slot">
        <Select name="slot" defaultValue="07:00|07:30">
          <SelectTrigger
            id="quick-slot"
            className="w-full border-none bg-transparent p-0 text-sm font-semibold text-ink-950 shadow-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <SelectValue placeholder="Pilih slot" />
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

      <div className="flex justify-end lg:w-auto">
        <Button
          type="submit"
          className="w-full min-h-11 rounded-2xl bg-brand-500 px-6 hover:bg-brand-600 lg:w-14 lg:rounded-full lg:px-0"
        >
          <Search aria-hidden className="size-5" />
          <span className="lg:sr-only">Cari ketersediaan</span>
        </Button>
      </div>
    </form>
  );
}
