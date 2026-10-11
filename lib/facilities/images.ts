import type { LucideIcon } from "lucide-react";
import { FlaskConical, Landmark, Presentation, Trophy, Wrench } from "lucide-react";

// Gambar katalog per tipe (US01/US02): file statis di public/assets/facilities/
// (ikut git + zip Drive). Foto custom per fasilitas (fase upload, kolom imageUrl)
// menjadi prioritas pertama saat tersedia; ikon dipakai bila gambar absen/gagal.
export const FACILITY_IMAGE_TYPES = ["kelas", "aula", "lab", "lapangan", "alat"] as const;

export type FacilityImageType = (typeof FACILITY_IMAGE_TYPES)[number];

export type FacilityTypeImage = {
  src: string;
  alt: string;
};

export const FACILITY_TYPE_IMAGES: Record<FacilityImageType, FacilityTypeImage> = {
  kelas: { src: "/assets/facilities/kelas.jpg", alt: "Foto ruang kelas kampus" },
  aula: { src: "/assets/facilities/aula.jpg", alt: "Foto aula kampus" },
  lab: { src: "/assets/facilities/lab.jpg", alt: "Foto laboratorium kampus" },
  lapangan: { src: "/assets/facilities/lapangan.jpg", alt: "Foto lapangan kampus" },
  alat: { src: "/assets/facilities/alat.jpg", alt: "Foto alat penunjang kampus" },
};

export const FACILITY_TYPE_ICONS: Record<FacilityImageType, LucideIcon> = {
  kelas: Presentation,
  aula: Landmark,
  lab: FlaskConical,
  lapangan: Trophy,
  alat: Wrench,
};

const DEFAULT_TYPE: FacilityImageType = "kelas";

export function normalizeFacilityType(type: string): FacilityImageType {
  const key = type.trim().toLowerCase();
  const known = (FACILITY_IMAGE_TYPES as readonly string[]).includes(key);
  return known ? (key as FacilityImageType) : DEFAULT_TYPE;
}

export function getFacilityImage(type: string): FacilityTypeImage {
  return FACILITY_TYPE_IMAGES[normalizeFacilityType(type)];
}

export function getFacilityTypeIcon(type: string): LucideIcon {
  return FACILITY_TYPE_ICONS[normalizeFacilityType(type)];
}
