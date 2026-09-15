"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
import { buildFacilitySearchUrl } from "@/lib/landing";

const TYPE_OPTIONS = [
  { value: "all", label: "Semua jenis" },
  { value: "kelas", label: "Ruang kelas" },
  { value: "aula", label: "Aula" },
  { value: "lab", label: "Laboratorium" },
  { value: "alat", label: "Alat" },
  { value: "lapangan", label: "Lapangan" },
];

export default function QuickSearchForm() {
  const router = useRouter();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    router.push(
      buildFacilitySearchUrl({
        type: String(data.get("type") ?? "all"),
        location: String(data.get("location") ?? ""),
        date: String(data.get("date") ?? ""),
      })
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Cek ketersediaan cepat"
      className="flex flex-col gap-4 rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-100/50 lg:flex-row lg:items-end lg:rounded-full lg:px-6"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-type">Jenis fasilitas</Label>
        <Select name="type" defaultValue="all">
          <SelectTrigger id="quick-type" className="w-full">
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
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-location">Lokasi</Label>
        <Input
          id="quick-location"
          name="location"
          placeholder="cth. Gedung A"
          autoComplete="off"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="quick-date">Tanggal</Label>
        <Input id="quick-date" name="date" type="date" />
      </div>
      <Button
        type="submit"
        aria-label="Cari ketersediaan"
        className="rounded-2xl bg-brand-500 hover:bg-brand-600 lg:rounded-full"
      >
        <Search aria-hidden />
        <span className="lg:sr-only">Cari ketersediaan</span>
        <span className="lg:hidden">Cari ketersediaan</span>
      </Button>
    </form>
  );
}
